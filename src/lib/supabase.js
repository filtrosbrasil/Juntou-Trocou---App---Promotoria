import { createClient } from '@supabase/supabase-js'

// ─────────────────────────────────────────────
// CONFIGURAÇÃO
// Cole sua URL e chave anon do projeto Supabase
// Project Settings > API > Project URL / anon key
// ─────────────────────────────────────────────
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error('❌ Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não definidas no .env')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

export const auth = {
  /** Login com email e senha */
  async login(email, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) throw new Error(error.message)
    return data.user
  },

  /** Logout */
  async logout() {
    await supabase.auth.signOut()
  },

  /** Retorna usuário logado + perfil */
  async usuarioAtual() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data: perfil } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', user.id)
      .single()
    return perfil ? { ...perfil, email: user.email } : null
  },

  /** Cria usuário (apenas gestor/admin) */
  async criarUsuario(email, senha, nome, perfil, iniciais) {
    const { data, error } = await supabase.auth.signUp({
      email, password: senha,
      options: { data: { nome, perfil, iniciais } },
    })
    if (error) throw new Error(error.message)
    return data.user
  },

  /** Observa mudanças de sessão */
  onAuthChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },
}

// ─────────────────────────────────────────────
// PDVs
// ─────────────────────────────────────────────

export const pdvService = {
  /** Lista PDVs (filtra por promotora se necessário) */
  async listar(promotora_id = null) {
    let q = supabase.from('pdvs').select(`
      *,
      promotora:perfis(nome, iniciais),
      visitas(id, checkin_em, checkout_em, bloco_id, checkin_valido)
    `).eq('ativo', true).order('criado_em', { ascending: false })

    if (promotora_id) q = q.eq('promotora_id', promotora_id)
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return data
  },

  /** Busca um PDV por ID */
  async buscar(id) {
    const { data, error } = await supabase
      .from('pdvs')
      .select(`*, promotora:perfis(nome, iniciais), visitas(*)`)
      .eq('id', id)
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  /** Cadastra novo PDV */
  async criar(dadosPDV) {
    const { data, error } = await supabase
      .from('pdvs')
      .insert(dadosPDV)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  /** Atualiza PDV */
  async atualizar(id, dados) {
    const { data, error } = await supabase
      .from('pdvs')
      .update(dados)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  /** Status resumido dos PDVs (view) */
  async listarStatus() {
    const { data, error } = await supabase
      .from('pdvs_status')
      .select('*')
      .order('ultima_visita', { ascending: false, nullsFirst: false })
    if (error) throw new Error(error.message)
    return data
  },
}

// ─────────────────────────────────────────────
// VISITAS
// ─────────────────────────────────────────────

export const visitaService = {
  /** Registra check-in */
  async checkin({ pdv_id, promotora_id, bloco_id, lat, lng, dist_m }) {
    const { data, error } = await supabase
      .from('visitas')
      .insert({
        pdv_id,
        promotora_id,
        bloco_id,
        checkin_lat: lat,
        checkin_lng: lng,
        checkin_dist_m: Math.round(dist_m),
        checkin_valido: dist_m <= 50,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  /** Registra check-out */
  async checkout(visita_id, lat, lng) {
    const { data, error } = await supabase
      .from('visitas')
      .update({ checkout_em: new Date().toISOString(), checkout_lat: lat, checkout_lng: lng })
      .eq('id', visita_id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  /** Registra tentativa bloqueada */
  async registrarBloqueio({ pdv_id, promotora_id, lat, lng, dist_m }) {
    await supabase.from('checkins_bloqueados').insert({
      pdv_id, promotora_id,
      tentativa_lat: lat, tentativa_lng: lng,
      distancia_m: Math.round(dist_m),
    })
  },

  /** Lista visitas de um PDV */
  async listarPorPDV(pdv_id) {
    const { data, error } = await supabase
      .from('visitas')
      .select('*, promotora:perfis(nome, iniciais), bloco:blocos(nome)')
      .eq('pdv_id', pdv_id)
      .order('checkin_em', { ascending: false })
    if (error) throw new Error(error.message)
    return data
  },

  /** Lista visitas do dia (gestor) */
  async listarHoje() {
    const hoje = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('visitas')
      .select('*, pdv:pdvs(nome_fantasia, cidade), promotora:perfis(nome)')
      .gte('checkin_em', hoje + 'T00:00:00')
      .lte('checkin_em', hoje + 'T23:59:59')
      .order('checkin_em', { ascending: false })
    if (error) throw new Error(error.message)
    return data
  },
}

// ─────────────────────────────────────────────
// BLOCOS E PERGUNTAS
// ─────────────────────────────────────────────

export const blocoService = {
  /** Lista blocos com perguntas */
  async listar() {
    const { data, error } = await supabase
      .from('blocos')
      .select('*, perguntas(*)')
      .eq('ativo', true)
      .order('ordem')
    if (error) throw new Error(error.message)
    // Ordena perguntas dentro de cada bloco
    return data.map(b => ({
      ...b,
      perguntas: (b.perguntas || []).sort((a, b) => a.ordem - b.ordem),
    }))
  },

  /** Salva bloco (cria ou atualiza) */
  async salvarBloco(bloco) {
    const { id, perguntas, ...dadosBloco } = bloco
    let blocoId = id

    if (id && id.startsWith('b1111')) {
      // ID fixo — atualiza
      const { error } = await supabase.from('blocos').update(dadosBloco).eq('id', id)
      if (error) throw new Error(error.message)
    } else if (!id) {
      // Novo bloco
      const { data, error } = await supabase.from('blocos').insert(dadosBloco).select().single()
      if (error) throw new Error(error.message)
      blocoId = data.id
    }

    // Salva perguntas
    for (const perg of perguntas || []) {
      await blocoService.salvarPergunta({ ...perg, bloco_id: blocoId })
    }
    return blocoId
  },

  /** Salva pergunta (cria ou atualiza) */
  async salvarPergunta(pergunta) {
    const { id, ...dados } = pergunta
    if (id && !id.startsWith('p01') && !id.startsWith('p02') && !id.startsWith('p03')) {
      await supabase.from('perguntas').upsert({ id, ...dados })
    } else if (!id) {
      await supabase.from('perguntas').insert(dados)
    } else {
      await supabase.from('perguntas').update(dados).eq('id', id)
    }
  },

  /** Remove pergunta */
  async removerPergunta(id) {
    await supabase.from('perguntas').update({ ativo: false }).eq('id', id)
  },
}

// ─────────────────────────────────────────────
// RESPOSTAS
// ─────────────────────────────────────────────

export const respostaService = {
  /** Salva todas as respostas de uma visita */
  async salvarRespostas(visita_id, pdv_id, promotora_id, respostas) {
    const rows = Object.entries(respostas).map(([pergunta_id, valor]) => {
      const row = { visita_id, pdv_id, promotora_id, pergunta_id }

      if (typeof valor === 'string' && valor !== 'foto') {
        row.resposta_texto = valor
      } else if (typeof valor === 'number') {
        row.resposta_numero = valor
      } else if (Array.isArray(valor)) {
        row.resposta_opcoes = valor.map(String)
      } else if (valor === 'foto') {
        row.resposta_foto = 'pendente' // atualiza após upload
      }

      return row
    })

    const { error } = await supabase.from('respostas').insert(rows)
    if (error) throw new Error(error.message)
  },

  /** Busca respostas de uma visita */
  async listarPorVisita(visita_id) {
    const { data, error } = await supabase
      .from('respostas')
      .select('*, pergunta:perguntas(texto, tipo)')
      .eq('visita_id', visita_id)
    if (error) throw new Error(error.message)
    return data
  },
}

// ─────────────────────────────────────────────
// STORAGE — Fotos
// ─────────────────────────────────────────────

export const fotoService = {
  /** Faz upload de foto e retorna URL pública */
  async upload(file, visita_id, pergunta_id) {
    const ext  = file.name.split('.').pop()
    const path = `${visita_id}/${pergunta_id}.${ext}`

    const { error } = await supabase.storage
      .from('fotos-visitas')
      .upload(path, file, { upsert: true })
    if (error) throw new Error(error.message)

    const { data } = supabase.storage.from('fotos-visitas').getPublicUrl(path)
    return data.publicUrl
  },

  /** Gera URL assinada (acesso temporário, 1h) */
  async urlAssinada(path) {
    const { data, error } = await supabase.storage
      .from('fotos-visitas')
      .createSignedUrl(path, 3600)
    if (error) throw new Error(error.message)
    return data.signedUrl
  },
}

// ─────────────────────────────────────────────
// DASHBOARD DO GESTOR
// ─────────────────────────────────────────────

export const gestorService = {
  /** KPIs gerais */
  async kpis() {
    const hoje = new Date().toISOString().split('T')[0]
    const [pdvs, visitasHoje, bloqueios] = await Promise.all([
      supabase.from('pdvs').select('id', { count: 'exact' }).eq('ativo', true),
      supabase.from('visitas').select('id', { count: 'exact' }).gte('checkin_em', hoje + 'T00:00:00'),
      supabase.from('checkins_bloqueados').select('id', { count: 'exact' }).gte('criado_em', hoje + 'T00:00:00'),
    ])
    return {
      totalPDVs:      pdvs.count || 0,
      visitasHoje:    visitasHoje.count || 0,
      bloqueiosHoje:  bloqueios.count || 0,
    }
  },

  /** Resumo das promotoras */
  async promotoras() {
    const { data, error } = await supabase.from('promotoras_resumo').select('*')
    if (error) throw new Error(error.message)
    return data
  },

  /** PDVs com status dos blocos */
  async pdvsStatus() {
    const { data, error } = await supabase.from('pdvs_status').select('*')
    if (error) throw new Error(error.message)
    return data
  },
}
