import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'

const root = document.getElementById('root')

try {
  createRoot(root).render(
    <StrictMode>
      <AppProvider>
        <App />
      </AppProvider>
    </StrictMode>
  )
} catch (err) {
  // Fallback de emergência — nunca mostra tela preta
  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0F1A2E;font-family:sans-serif">
      <div style="text-align:center;padding:40px">
        <div style="font-size:48px;margin-bottom:16px">⚠️</div>
        <div style="color:white;font-size:18px;font-weight:600;margin-bottom:8px">Erro ao iniciar o app</div>
        <div style="color:rgba(255,255,255,.5);font-size:14px;margin-bottom:24px">${err.message}</div>
        <button onclick="location.reload()" style="padding:10px 24px;background:#E31E24;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer">Recarregar</button>
      </div>
    </div>
  `
}
