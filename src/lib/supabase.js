import { createClient } from '@supabase/supabase-js'

const URL  = import.meta.env.VITE_SUPABASE_URL  || ''
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const SUPABASE_ATIVO = !!(URL && ANON && URL.startsWith('https://') && URL.includes('.supabase.co') && ANON.startsWith('eyJ'))

export const supabase = SUPABASE_ATIVO ? createClient(URL, ANON, { auth: { persistSession: true, storageKey: 'fb-pdv-auth' } }) : null

export const auth = {
  async login(email, senha) {
    if (!supabase) throw new Error('offline')
    try { await supabase.auth.signOut() } catch {}
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) throw new Error(error.message)
    const meta = data.user?.user_metadata || {}
    if (!meta.perfil) throw new Error('sem-perfil')
    return { id: data.user.id, email: data.user.email, nome: meta.nome || email, perfil: meta.perfil, iniciais: meta.iniciais || '??' }
  },
  async logout() {
    try { if (supabase) await supabase.auth.signOut({ scope: 'local' }) } catch {}
    try { localStorage.removeItem('fb-pdv-auth') } catch {}
  },
  async sessao() {
    if (!supabase) return null
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return null
      const meta = session.user.user_metadata || {}
      if (!meta.perfil) return null
      return { id: session.user.id, email: session.user.email, nome: meta.nome || session.user.email, perfil: meta.perfil, iniciais: meta.iniciais || '??' }
    } catch { return null }
  },
  onChange(cb) {
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } }
    return supabase.auth.onAuthStateChange(cb)
  },
}

export const db = {
  async pdvs(uid) {
    if (!supabase) return null
    try {
      let q = supabase.from('pdvs').select('*, visitas(id,checkin_em,bloco_id)').eq('ativo', true)
      if (uid) q = q.eq('promotora_id', uid)
      const { data } = await q
      return data || null
    } catch { return null }
  },
  async blocos() {
    if (!supabase) return null
    try {
      const { data } = await supabase.from('blocos').select('*, perguntas(*)').eq('ativo', true).order('ordem')
      return data ? data.map(b => ({ ...b, perguntas: (b.perguntas||[]).sort((a,b)=>a.ordem-b.ordem) })) : null
    } catch { return null }
  },
  async criarPdv(dados) {
    if (!supabase) return null
    try { const { data } = await supabase.from('pdvs').insert(dados).select().single(); return data } catch { return null }
  },
}
