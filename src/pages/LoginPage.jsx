import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

const PERFIS = [
  {
    id: 'admin',
    label: 'Admin',
    desc: 'Dashboard completo, gestão de promotores, relatórios, blocos e arquivos',
    icon: '⚙️',
    cor: '#1B3A6D',
    corLight: '#E8EDF7',
  },
  {
    id: 'promotora',
    label: 'Promotora',
    desc: 'App de campo — roteiro, check-in, questionários e cadastro de PDVs',
    icon: '📍',
    cor: '#1A7F3C',
    corLight: '#E6F5EC',
  },
]

export default function LoginPage() {
  const { navegar, setUsuario } = useApp()
  const [hover, setHover] = useState(null)

  const entrar = (perfil) => {
    const usuarios = {
      admin:    { id: 'u1', nome: 'Administrador', perfil: 'admin',    iniciais: 'AD', email: 'admin@filtrosbrasil.com.br' },
      promotora:{ id: 'u2', nome: 'Promotora',     perfil: 'promotora',iniciais: 'PR', email: 'promotora@filtrosbrasil.com.br' },
    }
    setUsuario(usuarios[perfil])
    navegar(perfil === 'admin' ? 'gestor-dashboard' : 'promotora-home')
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0F1A2E 0%, #1B3A6D 100%)',
      padding: 24,
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          width: 72, height: 72, background: '#E31E24', borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(227,30,36,.35)',
        }}>⬡</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'white', letterSpacing: '-.02em' }}>
          Filtros Brasil
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.1em' }}>
          PDV · Juntou Ganhou
        </div>
      </div>

      {/* Seleção de perfil */}
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', textAlign: 'center', marginBottom: 20, fontWeight: 500 }}>
          Selecione seu perfil para continuar
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {PERFIS.map(p => (
            <div
              key={p.id}
              onClick={() => entrar(p.id)}
              onMouseEnter={() => setHover(p.id)}
              onMouseLeave={() => setHover(null)}
              style={{
                background: hover === p.id ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.07)',
                border: `1.5px solid ${hover === p.id ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.1)'}`,
                borderRadius: 16, padding: '20px 22px',
                cursor: 'pointer',
                transition: 'all .18s',
                transform: hover === p.id ? 'translateY(-2px)' : 'none',
                display: 'flex', alignItems: 'center', gap: 18,
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: p.corLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, flexShrink: 0,
              }}>{p.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 4 }}>
                  {p.label}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.5 }}>
                  {p.desc}
                </div>
              </div>
              <div style={{ fontSize: 22, color: 'rgba(255,255,255,.3)' }}>›</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: 'rgba(255,255,255,.2)' }}>
          Versão de demonstração · Filtros Brasil © 2026
        </div>
      </div>
    </div>
  )
}
