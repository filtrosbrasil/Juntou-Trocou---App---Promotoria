import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { auth, pdvService, blocoService, SUPABASE_ATIVO } from '../lib/supabase.js'
import { PDVS_INICIAL, BLOCOS_INICIAL } from '../data/inicial.js'

const AppCtx = createContext(null)

const USUARIOS_LOCAL = {
  'ednilson@filtrosbrasil.com.br':  { id:'u1', nome:'Ednilson Silva',     perfil:'gestor',        iniciais:'ES', senha:'123456' },
  'jackeline@filtrosbrasil.com.br': { id:'u2', nome:'Jackeline Brandani', perfil:'promotora',     iniciais:'JB', senha:'123456' },
  'nayanne@filtrosbrasil.com.br':   { id:'u3', nome:'Nayanne Cristina',   perfil:'promotora',     iniciais:'NK', senha:'123456' },
  'roberto@filtrosbrasil.com.br':   { id:'u4', nome:'Roberto Almeida',    perfil:'representante', iniciais:'RA', senha:'123456' },
  'admin@filtrosbrasil.com.br':     { id:'u5', nome:'Administrador',      perfil:'admin',         iniciais:'AD', senha:'123456' },
}

function rotaPorPerfil(perfil) {
  return {
    promotora:     'promotora-home',
    gestor:        'gestor-dashboard',
    admin:         'editor-blocos',
    representante: 'rep-home',
  }[perfil] || 'login'
}

export function AppProvider({ children }) {
  const [usuario, setUsuario]       = useState(null)
  const [rota, setRota]             = useState('login')
  const [params, setParams]         = useState({})
  const [pdvs, setPdvs]             = useState(PDVS_INICIAL)
  const [blocos, setBlocos]         = useState(BLOCOS_INICIAL)
  const [toast, setToast]           = useState(null)
  const [carregando, setCarregando] = useState(true)

  const showToast = useCallback((msg, tipo = 'ok') => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const navegar = useCallback((r, p = {}) => {
    setParams(p)
    setRota(r)
    window.scrollTo(0, 0)
  }, [])

  const carregarDados = useCallback(async (u) => {
    if (!SUPABASE_ATIVO) return
    try {
      const [blocsData, pdvsData] = await Promise.all([
        blocoService.listar(),
        pdvService.listar(u?.perfil === 'promotora' ? u.id : null),
      ])
      if (blocsData?.length) setBlocos(blocsData)
      if (pdvsData?.length)  setPdvs(pdvsData)
    } catch (err) {
      console.warn('Dados do Supabase indisponíveis, usando dados locais:', err.message)
    }
  }, [])

  // Verificar sessão ao carregar
  useEffect(() => {
    if (!SUPABASE_ATIVO) {
      setCarregando(false)
      return
    }
    auth.usuarioAtual()
      .then(u => {
        if (u) {
          setUsuario(u)
          carregarDados(u)
          setRota(rotaPorPerfil(u.perfil))
        }
      })
      .catch(() => {})
      .finally(() => setCarregando(false))

    const { data: { subscription } } = auth.onAuthChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUsuario(null)
        setRota('login')
      }
    })
    return () => subscription.unsubscribe()
  }, [carregarDados])

  // ─── LOGIN ───
  const login = useCallback(async (email, senha, perfil) => {
    const emailLower = email.toLowerCase().trim()

    if (SUPABASE_ATIVO) {
      try {
        await auth.login(emailLower, senha)
        const u = await auth.usuarioAtual()
        if (!u) return 'Usuário não encontrado no sistema.'
        if (u.perfil !== perfil) return `Este e-mail pertence ao perfil "${u.perfil}".`
        setUsuario(u)
        await carregarDados(u)
        navegar(rotaPorPerfil(u.perfil))
        return null
      } catch (err) {
        return err.message || 'Erro ao fazer login.'
      }
    } else {
      // Modo demo — sem Supabase configurado
      const u = USUARIOS_LOCAL[emailLower]
      if (!u)              return 'E-mail não encontrado.'
      if (u.senha !== senha) return 'Senha incorreta.'
      if (u.perfil !== perfil) return `Este e-mail pertence ao perfil "${u.perfil}".`
      setUsuario({ ...u, email: emailLower })
      navegar(rotaPorPerfil(u.perfil))
      return null
    }
  }, [navegar, carregarDados])

  // ─── LOGOUT ───
  const logout = useCallback(async () => {
    try { if (SUPABASE_ATIVO) await auth.logout() } catch {}
    setUsuario(null)
    setPdvs(PDVS_INICIAL)
    setBlocos(BLOCOS_INICIAL)
    navegar('login')
  }, [navegar])

  // ─── PDVs ───
  const addPdv = useCallback(async (dadosPDV) => {
    if (SUPABASE_ATIVO && usuario) {
      try {
        const novo = await pdvService.criar({ ...dadosPDV, promotora_id: usuario.id })
        if (novo) {
          setPdvs(prev => [{ ...novo, visitas: [] }, ...prev])
          return novo
        }
      } catch (err) {
        showToast('Erro ao salvar PDV: ' + err.message, 'error')
      }
    }
    setPdvs(prev => [dadosPDV, ...prev])
    return dadosPDV
  }, [usuario, showToast])

  const updatePdv = useCallback(async (id, dados) => {
    if (SUPABASE_ATIVO) {
      try { await pdvService.atualizar(id, dados) } catch (e) { console.error(e) }
    }
    setPdvs(prev => prev.map(p => p.id === id ? { ...p, ...dados } : p))
  }, [])

  const addVisita = useCallback((pdvId, visita) => {
    setPdvs(prev => prev.map(p =>
      p.id === pdvId ? { ...p, visitas: [...(p.visitas || []), visita] } : p
    ))
  }, [])

  // ─── BLOCOS ───
  const saveBlocos = useCallback(async (novosBlocos) => {
    setBlocos(novosBlocos)
    if (SUPABASE_ATIVO) {
      try {
        for (const b of novosBlocos) await blocoService.salvarBloco(b)
      } catch (err) {
        showToast('Erro ao salvar blocos.', 'error')
      }
    }
  }, [showToast])

  // ─── LOADING ───
  if (carregando) return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0F1A2E',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 44, height: 44,
          border: '3px solid rgba(255,255,255,.15)',
          borderTopColor: '#E31E24',
          borderRadius: '50%',
          animation: 'spin .8s linear infinite',
          margin: '0 auto 16px',
        }} />
        <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 14 }}>Carregando...</div>
      </div>
    </div>
  )

  return (
    <AppCtx.Provider value={{
      usuario, rota, params, pdvs, blocos, toast,
      supabaseAtivo: SUPABASE_ATIVO,
      navegar, login, logout,
      addPdv, updatePdv, addVisita,
      saveBlocos, showToast, carregarDados,
    }}>
      {children}
    </AppCtx.Provider>
  )
}

export const useApp = () => useContext(AppCtx)
