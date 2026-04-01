import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || ''
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = (SUPABASE_URL && SUPABASE_ANON)
  ? createClient(SUPABASE_URL, SUPABASE_ANON, { auth: { persistSession: true, autoRefreshToken: true } })
  : null

export const SUPABASE_ATIVO = !!(SUPABASE_URL && SUPABASE_ANON && SUPABASE_URL.includes('.supabase.co'))

export const auth = {
  async login(email, senha) {
    if (!supabase) throw new Error('Supabase não configurado')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) throw new Error(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message)
    return data.user
  },
  async logout() { if (supabase) await supabase.auth.signOut() },
  async usuarioAtual() {
    if (!supabase) return null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const meta = user.user_metadata || {}
      if (meta.perfil) return { id: user.id, email: user.email, nome: meta.nome || user.email, perfil: meta.perfil, iniciais: meta.iniciais || '??' }
      const { data: perfil } = await supabase.from('perfis').select('*').eq('id', user.id).single()
      return perfil ? { ...perfil, email: user.email } : null
    } catch { return null }
  },
  onAuthChange(cb) {
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } }
    return supabase.auth.onAuthStateChange(cb)
  },
}

export const pdvService = {
  async listar(promotora_id = null) {
    if (!supabase) return []
    let q = supabase.from('pdvs').select('*, visitas(id, checkin_em, bloco_id)').eq('ativo', true).order('criado_em', { ascending: false })
    if (promotora_id) q = q.eq('promotora_id', promotora_id)
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return data || []
  },
  async criar(dados) {
    if (!supabase) return null
    const { data, error } = await supabase.from('pdvs').insert(dados).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  async atualizar(id, dados) {
    if (!supabase) return null
    const { data, error } = await supabase.from('pdvs').update(dados).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
  },
}

export const blocoService = {
  async listar() {
    if (!supabase) return []
    const { data, error } = await supabase.from('blocos').select('*, perguntas(*)').eq('ativo', true).order('ordem')
    if (error) throw new Error(error.message)
    return (data || []).map(b => ({ ...b, perguntas: (b.perguntas || []).sort((a, b) => a.ordem - b.ordem) }))
  },
  async salvarBloco(bloco) {
    if (!supabase) return
    const { id, perguntas, ...dados } = bloco
    if (id) await supabase.from('blocos').update(dados).eq('id', id)
    else {
      const { data } = await supabase.from('blocos').insert(dados).select().single()
      if (data) for (const p of perguntas || []) await supabase.from('perguntas').insert({ ...p, bloco_id: data.id })
    }
  },
}

export const visitaService = {
  async checkin({ pdv_id, promotora_id, bloco_id, lat, lng, dist_m }) {
    if (!supabase) return null
    const { data, error } = await supabase.from('visitas').insert({ pdv_id, promotora_id, bloco_id, checkin_lat: lat, checkin_lng: lng, checkin_dist_m: Math.round(dist_m), checkin_valido: dist_m <= 50 }).select().single()
    if (error) throw new Error(error.message)
    return data
  },
}

export const fotoService = {
  async upload(file, visita_id, pergunta_id) {
    if (!supabase) return null
    const path = `${visita_id}/${pergunta_id}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('fotos-visitas').upload(path, file, { upsert: true })
    if (error) throw new Error(error.message)
    return supabase.storage.from('fotos-visitas').getPublicUrl(path).data.publicUrl
  },
}
