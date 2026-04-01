import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Btn, Input } from '../components/UI.jsx';

const PERFIS = [
  { val: 'gestor',         label: 'Gestor',         icon: '⊞' },
  { val: 'promotora',      label: 'Promotora',      icon: '📍' },
  { val: 'representante',  label: 'Representante',  icon: '👥' },
  { val: 'admin',          label: 'Admin',          icon: '⚙' },
];

const DEMOS = [
  { email: 'ednilson@filtrosbrasil.com.br',  perfil: 'gestor',        label: 'Gestor' },
  { email: 'jackeline@filtrosbrasil.com.br', perfil: 'promotora',     label: 'Promotora' },
  { email: 'roberto@filtrosbrasil.com.br',   perfil: 'representante', label: 'Representante' },
  { email: 'admin@filtrosbrasil.com.br',     perfil: 'admin',         label: 'Admin' },
];

export default function LoginPage() {
  const { login } = useApp();
  const [email, setEmail]   = useState('');
  const [senha, setSenha]   = useState('');
  const [perfil, setPerfil] = useState('promotora');
  const [erro, setErro]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) { setErro('Informe seu e-mail.'); return; }
    if (!senha)        { setErro('Informe sua senha.'); return; }
    setLoading(true);
    setErro('');
    await new Promise(r => setTimeout(r, 900));
    const err = login(email, senha, perfil);
    if (err) { setErro(err); setLoading(false); }
  };

  const preencherDemo = (d) => {
    setEmail(d.email); setSenha('123456'); setPerfil(d.perfil); setErro('');
  };

  return (
    <div style={{
      minHeight: '100dvh', display: 'grid', gridTemplateColumns: '1fr 1fr',
    }}>
      {/* Esquerda */}
      <div style={{
        background: 'var(--navy)', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: 48, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 80%, rgba(227,30,36,.12) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(42,80,153,.25) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: 'var(--red)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⬡</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'white', lineHeight: 1 }}>Filtros Brasil</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 3 }}>PDV — Gestão de campo</div>
            </div>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <h1 style={{ fontSize: 'clamp(28px,3.5vw,44px)', color: 'white', lineHeight: 1.2, marginBottom: 18 }}>
            Sua equipe<br />de campo, sob<br /><span style={{ color: 'var(--red)' }}>controle total.</span>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.55)', lineHeight: 1.7, maxWidth: 340 }}>
            Acompanhe visitas, pesquisas e resultados das promotoras em tempo real. Tudo integrado, tudo Filtros Brasil.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 28, position: 'relative' }}>
          {[['279','PDVs ativos'],['6','Promotoras'],['3','Blocos Juntou Ganhou']].map(([n,l]) => (
            <div key={l}>
              <div style={{ fontSize: 26, fontWeight: 600, color: 'white', lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Direita */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', background: 'var(--g50)' }}>
        <div style={{ width: '100%', maxWidth: 400 }} className="fade-up">
          <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 6 }}>Entrar na plataforma</h2>
          <p style={{ fontSize: 14, color: 'var(--g400)', marginBottom: 28 }}>Selecione seu perfil e faça login</p>

          {/* Perfis */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {PERFIS.map(p => (
              <button key={p.val} onClick={() => setPerfil(p.val)} style={{
                flex: 1, padding: '10px 6px', border: `1.5px solid ${perfil===p.val?'var(--navy)':'var(--g200)'}`,
                borderRadius: 10, background: perfil===p.val?'var(--navy-light)':'white',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                transition: 'all .15s',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8, fontSize: 16,
                  background: perfil===p.val?'var(--navy)':'var(--g100)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{p.icon}</div>
                <span style={{ fontSize: 11, fontWeight: 500, color: perfil===p.val?'var(--navy)':'var(--g600)' }}>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Erro */}
          {erro && (
            <div style={{ background: 'var(--red-light)', border: '1px solid #F5B3B3', borderRadius: 9, padding: '10px 13px', fontSize: 13, color: '#8B1215', marginBottom: 14 }}>
              {erro}
            </div>
          )}

          {/* Campos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 8 }}>
            <Input label="E-mail" value={email} onChange={setEmail} placeholder="seu@email.com" type="email" />
            <Input label="Senha" value={senha} onChange={setSenha} placeholder="••••••••" type="password" />
          </div>

          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 500, cursor: 'pointer' }}>Esqueci a senha</span>
          </div>

          <Btn size="full" onClick={handleLogin} disabled={loading}>
            {loading ? '⏳ Entrando...' : 'Entrar'}
          </Btn>

          {/* Demo */}
          <div style={{ marginTop: 22, padding: '13px 14px', background: 'var(--g50)', border: '1px dashed var(--g200)', borderRadius: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Credenciais de demonstração</div>
            {DEMOS.map(d => (
              <div key={d.email} onClick={() => preencherDemo(d)} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 0', borderBottom: '1px solid var(--g100)', cursor: 'pointer',
              }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--g600)', minWidth: 110 }}>{d.label}</span>
                <span style={{ fontSize: 11, color: 'var(--g400)', fontFamily: 'monospace' }}>{d.email}</span>
                <span style={{ fontSize: 11, color: 'var(--navy)', fontWeight: 600 }}>Usar →</span>
              </div>
            ))}
            <div style={{ fontSize: 11, color: 'var(--g400)', marginTop: 8 }}>Senha de todas: <code>123456</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}
