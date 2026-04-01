import { useApp } from './context/AppContext.jsx'
import { ToastGlobal } from './components/UI.jsx'
import LoginPage        from './pages/LoginPage.jsx'
import PromotoraApp     from './pages/PromotoraApp.jsx'
import CadastroPDV      from './pages/CadastroPDV.jsx'
import GestorDashboard  from './pages/GestorDashboard.jsx'
import { RepresentantePortal, EditorBlocos } from './pages/OutrasPages.jsx'

export default function App() {
  const { rota, usuario } = useApp()

  if (rota === 'login' || !usuario) return <><LoginPage /><ToastGlobal /></>

  const render = () => {
    switch (rota) {
      case 'promotora-home':        return <PromotoraApp />
      case 'cadastro-pdv':          return <CadastroPDV />
      case 'gestor-dashboard':
      case 'gestor-equipe':
      case 'gestor-pdvs':
      case 'gestor-visitas':
      case 'gestor-blocos':
      case 'gestor-arquivos':
      case 'gestor-relatorios':
      case 'gestor-promotores':
      case 'gestor-alertas':        return <GestorDashboard />
      case 'editor-blocos':
        if (usuario.perfil !== 'gestor' && usuario.perfil !== 'admin')
          return <div style={{padding:40,textAlign:'center',color:'var(--red)'}}>Acesso restrito.</div>
        return <EditorBlocos />
      case 'rep-home':              return <RepresentantePortal />
      default:
        if (usuario.perfil === 'promotora')     return <PromotoraApp />
        if (usuario.perfil === 'gestor')        return <GestorDashboard />
        if (usuario.perfil === 'admin')         return <EditorBlocos />
        if (usuario.perfil === 'representante') return <RepresentantePortal />
        return <LoginPage />
    }
  }

  return <><div style={{minHeight:'100dvh'}}>{render()}</div><ToastGlobal /></>
}
