import { createContext, useContext, useState, useCallback } from 'react'
import { PDVS_INICIAL, BLOCOS_INICIAL } from '../data/inicial.js'

const Ctx = createContext(null)

export function AppProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [rota, setRota]       = useState('login')
  const [params, setParams]   = useState({})
  const [pdvs, setPdvs]       = useState(PDVS_INICIAL)
  const [blocos, setBlocos]   = useState(BLOCOS_INICIAL)
  const [toast, setToast]     = useState(null)

  const navegar   = useCallback((r, p={}) => { setRota(r); setParams(p); window.scrollTo(0,0) }, [])
  const showToast = useCallback((msg, tipo='ok') => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3500) }, [])

  const logout = useCallback(() => {
    setUsuario(null)
    setPdvs(PDVS_INICIAL)
    setBlocos(BLOCOS_INICIAL)
    navegar('login')
  }, [navegar])

  const addPdv    = useCallback((d)    => { setPdvs(p => [d, ...p]); return d }, [])
  const updatePdv = useCallback((id,d) => { setPdvs(p => p.map(x => x.id===id ? {...x,...d} : x)) }, [])
  const addVisita = useCallback((pid,v)=> { setPdvs(p => p.map(x => x.id===pid ? {...x, visitas:[...(x.visitas||[]),v]} : x)) }, [])
  const saveBlocos= useCallback((nb)   => { setBlocos(nb) }, [])

  return (
    <Ctx.Provider value={{
      usuario, setUsuario,
      rota, params,
      pdvs, blocos, toast,
      navegar, logout,
      addPdv, updatePdv, addVisita,
      saveBlocos, showToast,
      supabaseAtivo: false,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useApp = () => useContext(Ctx)
