import { useApp } from './context/AppContext.jsx'
import { ToastGlobal } from './components/UI.jsx'
import LoginPage        from './pages/LoginPage.jsx'
import PromotoraApp     from './pages/PromotoraApp.jsx'
import CadastroPDV      from './pages/CadastroPDV.jsx'
import GestorDashboard  from './pages/GestorDashboard.jsx'
import { EditorBlocos } from './pages/OutrasPages.jsx'

export default function App() {
  const { rota, usuario } = useApp()

  // Sem usuário → tela de seleção de perfil
  if (!usuario) return <><LoginPage /><ToastGlobal /></>

  const render = () => {
    switch (rota) {
      case 'promotora-home': return <PromotoraApp />
      case 'cadastro-pdv':   return <CadastroPDV />
      case 'editor-blocos':  return <EditorBlocos />
      // Tudo do admin/gestor vai para o dashboard
      default:
        if (usuario.perfil === 'promotora') return <PromotoraApp />
        return <GestorDashboard />
    }
  }

  return <><div style={{ minHeight:'100dvh' }}>{render()}</div><ToastGlobal /></>
}
