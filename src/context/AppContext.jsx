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

function rotaPorPerfil(p) {
  return { promotora:'promotora-home', gestor:'gestor-dashboard', admin:'editor-blocos', representante:'rep-home' }[p] || 'login'
}

export function AppProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [rota, setRota]       = useState('login')
  const [params, setParams]   = useState({})
  const [pdvs, setPdvs]       = useState(PDVS_INICIAL)
  const [blocos, setBlocos]   = useState(BLOCOS_INICIAL)
  const [toast, setToast]     = useState(null)

  const showToast = useCallback((msg, tipo='ok') => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3500) }, [])
  const navegar   = useCallback((r,p={}) => { setParams(p); setRota(r); window.scrollTo(0,0) }, [])

  const carregarDados = useCallback(async (u) => {
    if (!SUPABASE_ATIVO) return
    try {
      const [b,p] = await Promise.all([blocoService.listar(), pdvService.listar(u?.perfil==='promotora'?u.id:null)])
      if (b?.length) setBlocos(b)
      if (p?.length) setPdvs(p)
    } catch(e) { console.warn('Dados locais:', e.message) }
  }, [])

  useEffect(() => {
    if (!SUPABASE_ATIVO) return
    let ok = true
    auth.usuarioAtual().then(u => { if(ok&&u){ setUsuario(u); setRota(rotaPorPerfil(u.perfil)); carregarDados(u) } }).catch(()=>{})
    const { data:{subscription} } = auth.onAuthChange(ev => { if(ev==='SIGNED_OUT'){setUsuario(null);setRota('login')} })
    return () => { ok=false; subscription.unsubscribe() }
  }, [carregarDados])

  const login = useCallback(async (email, senha, perfil) => {
    const e = email.toLowerCase().trim()
    if (SUPABASE_ATIVO) {
      try {
        await auth.login(e, senha)
        const u = await auth.usuarioAtual()
        if (!u) return 'Login feito mas perfil não encontrado. Execute o SQL de metadados no Supabase.'
        if (u.perfil !== perfil) return `Este e-mail é do perfil "${u.perfil}".`
        setUsuario(u); navegar(rotaPorPerfil(u.perfil)); carregarDados(u); return null
      } catch(err) {
        const m = err.message||''
        if (m.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
        if (m.includes('Email not confirmed'))       return 'Confirme o e-mail antes de entrar.'
        return 'Erro: ' + m
      }
    }
    const u = USUARIOS_LOCAL[e]
    if (!u)                return 'E-mail não encontrado.'
    if (u.senha !== senha) return 'Senha incorreta.'
    if (u.perfil !== perfil) return `Este e-mail é do perfil "${u.perfil}".`
    setUsuario({...u,email:e}); navegar(rotaPorPerfil(u.perfil)); return null
  }, [navegar, carregarDados])

  const logout = useCallback(async () => {
    try { if(SUPABASE_ATIVO) await auth.logout() } catch{}
    setUsuario(null); setPdvs(PDVS_INICIAL); setBlocos(BLOCOS_INICIAL); navegar('login')
  }, [navegar])

  const addPdv = useCallback(async (d) => {
    if (SUPABASE_ATIVO && usuario) {
      try { const n=await pdvService.criar({...d,promotora_id:usuario.id}); if(n){setPdvs(p=>[{...n,visitas:[]}, ...p]);return n} } catch(e){showToast('Erro ao salvar PDV.','error')}
    }
    setPdvs(p=>[d,...p]); return d
  }, [usuario, showToast])

  const updatePdv  = useCallback(async(id,d)=>{ if(SUPABASE_ATIVO){try{await pdvService.atualizar(id,d)}catch{}} setPdvs(p=>p.map(x=>x.id===id?{...x,...d}:x)) },[])
  const addVisita  = useCallback((pid,v)=>{ setPdvs(p=>p.map(x=>x.id===pid?{...x,visitas:[...(x.visitas||[]),v]}:x)) },[])
  const saveBlocos = useCallback(async(nb)=>{ setBlocos(nb); if(SUPABASE_ATIVO){try{for(const b of nb)await blocoService.salvarBloco(b)}catch{showToast('Erro ao salvar.','error')}} },[showToast])

  return (
    <AppCtx.Provider value={{usuario,rota,params,pdvs,blocos,toast,supabaseAtivo:SUPABASE_ATIVO,navegar,login,logout,addPdv,updatePdv,addVisita,saveBlocos,showToast,carregarDados}}>
      {children}
    </AppCtx.Provider>
  )
}

export const useApp = () => useContext(AppCtx)
