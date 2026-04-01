import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || ''
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Só cria o client se as variáveis existirem e forem válidas
export const supabase = (SUPABASE_URL && SUPABASE_ANON)
  ? createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null

export const SUPABASE_ATIVO = !!(
  SUPABASE_URL &&
  SUPABASE_ANON &&
  SUPABASE_URL.includes('.supabase.co') &&
  SUPABASE_URL !== 'https://SEU_PROJETO.supabase.co'
)

// ─── AUTH ───
export const auth = {
  async login(email, senha) {
    if (!supabase) throw new Error('Supabase não configurado')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) throw new Error(
      error.message === 'Invalid login credentials'
        ? 'E-mail ou senha incorretos.'
        : error.message
    )
    return data.user
  },

  async logout() {
    if (!supabase) return
    await supabase.auth.signOut()
  },

  async usuarioAtual() {
    if (!supabase) return null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data: perfil } = await supabase
        .from('perfis').select('*').eq('id', user.id).single()
      return perfil ? { ...perfil, email: user.email } : null
    } catch { return null }
  },

  onAuthChange(callback) {
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } }
    return supabase.auth.onAuthStateChange(callback)
  },
}

// ─── PDVs ───
export const pdvService = {
  async listar(promotora_id = null) {
    if (!supabase) return []
    let q = supabase.from('pdvs')
      .select('*, visitas(id, checkin_em, checkout_em, bloco_id)')
      .eq('ativo', true).order('criado_em', { ascending: false })
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

// ─── VISITAS ───
export const visitaService = {
  async checkin({ pdv_id, promotora_id, bloco_id, lat, lng, dist_m }) {
    if (!supabase) return null
    const { data, error } = await supabase.from('visitas').insert({
      pdv_id, promotora_id, bloco_id,
      checkin_lat: lat, checkin_lng: lng,
      checkin_dist_m: Math.round(dist_m),
      checkin_valido: dist_m <= 50,
    }).select().single()
    if (error) throw new Error(error.message)
    return data
  },

  async checkout(visita_id, lat, lng) {
    if (!supabase) return null
    const { data, error } = await supabase.from('visitas')
      .update({ checkout_em: new Date().toISOString(), checkout_lat: lat, checkout_lng: lng })
      .eq('id', visita_id).select().single()
    if (error) throw new Error(error.message)
    return data
  },
}

// ─── BLOCOS ───
export const blocoService = {
  async listar() {
    if (!supabase) return []
    const { data, error } = await supabase.from('blocos')
      .select('*, perguntas(*)').eq('ativo', true).order('ordem')
    if (error) throw new Error(error.message)
    return (data || []).map(b => ({
      ...b,
      perguntas: (b.perguntas || []).sort((a, b) => a.ordem - b.ordem),
    }))
  },

  async salvarBloco(bloco) {
    if (!supabase) return
    const { id, perguntas, ...dados } = bloco
    if (id) {
      await supabase.from('blocos').update(dados).eq('id', id)
    } else {
      const { data } = await supabase.from('blocos').insert(dados).select().single()
      if (data) {
        for (const p of perguntas || []) {
          await supabase.from('perguntas').insert({ ...p, bloco_id: data.id })
        }
      }
    }
  },
}

// ─── RESPOSTAS ───
export const respostaService = {
  async salvar(visita_id, pdv_id, promotora_id, respostas) {
    if (!supabase) return
    const rows = Object.entries(respostas).map(([pergunta_id, valor]) => {
      const row = { visita_id, pdv_id, promotora_id, pergunta_id }
      if (typeof valor === 'number') row.resposta_numero = valor
      else if (Array.isArray(valor)) row.resposta_opcoes = valor.map(String)
      else if (valor === 'foto') row.resposta_foto = 'pendente'
      else row.resposta_texto = String(valor)
      return row
    })
    const { error } = await supabase.from('respostas').insert(rows)
    if (error) console.error('Erro ao salvar respostas:', error)
  },
}

// ─── STORAGE ───
export const fotoService = {
  async upload(file, visita_id, pergunta_id) {
    if (!supabase) return null
    const ext  = file.name.split('.').pop()
    const path = `${visita_id}/${pergunta_id}.${ext}`
    const { error } = await supabase.storage.from('fotos-visitas').upload(path, file, { upsert: true })
    if (error) throw new Error(error.message)
    const { data } = supabase.storage.from('fotos-visitas').getPublicUrl(path)
    return data.publicUrl
  },
}
