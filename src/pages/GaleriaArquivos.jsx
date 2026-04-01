import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Badge, Card, SectionLabel, WebShell } from '../components/UI.jsx'

const CORES_PROMO = {
  'jackeline@filtrosbrasil.com.br': '#1B3A6D',
  'nayanne@filtrosbrasil.com.br':   '#E31E24',
  'u2': '#1B3A6D', 'u3': '#E31E24',
}

// Dados demo — em produção vêm do Supabase Storage
const FOTOS_DEMO = [
  { id:1,  promotor:'Jackeline B.', pdv:'BERKO Centro Automotivo',   bloco:'Bloco 01', pergunta:'Foto da fachada do PDV',          data:'2026-03-29', hora:'14:22', tamanho:'312 KB', cor:'#1B3A6D', ini:'JB', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { id:2,  promotor:'Jackeline B.', pdv:'BERKO Centro Automotivo',   bloco:'Bloco 02', pergunta:'Foto da exposição dos filtros',    data:'2026-03-29', hora:'14:35', tamanho:'287 KB', cor:'#1B3A6D', ini:'JB', img:'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=600&q=80' },
  { id:3,  promotor:'Nayanne C.',   pdv:'Distribuidora NovaTec',     bloco:'Bloco 01', pergunta:'Foto da fachada do PDV',          data:'2026-03-27', hora:'10:44', tamanho:'341 KB', cor:'#E31E24', ini:'NK', img:'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=600&q=80' },
  { id:4,  promotor:'Nayanne C.',   pdv:'Distribuidora NovaTec',     bloco:'Bloco 02', pergunta:'Foto da exposição dos filtros',    data:'2026-03-27', hora:'10:58', tamanho:'276 KB', cor:'#E31E24', ini:'NK', img:'https://images.unsplash.com/photo-1622185135505-2d795003994a?w=600&q=80' },
  { id:5,  promotor:'Jackeline B.', pdv:'Filter Center SJP',         bloco:'Bloco 01', pergunta:'Foto da fachada do PDV',          data:'2026-03-28', hora:'09:32', tamanho:'326 KB', cor:'#1B3A6D', ini:'JB', img:'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&q=80' },
  { id:6,  promotor:'Nayanne C.',   pdv:'Pinhais Filtros',           bloco:'Bloco 02', pergunta:'Foto da exposição dos filtros',    data:'2026-03-26', hora:'09:45', tamanho:'294 KB', cor:'#E31E24', ini:'NK', img:'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80' },
]

export default function GaleriaArquivos({ onBack }) {
  const { pdvs } = useApp()
  const [filtPromotor, setFiltPromotor] = useState('')
  const [filtBloco, setFiltBloco]       = useState('')
  const [busca, setBusca]               = useState('')
  const [viewMode, setViewMode]         = useState('grid')
  const [modalIdx, setModalIdx]         = useState(null)

  const filtrados = FOTOS_DEMO.filter(f => {
    if (filtPromotor && !f.promotor.includes(filtPromotor)) return false
    if (filtBloco    && f.bloco !== filtBloco) return false
    if (busca        && !f.promotor.toLowerCase().includes(busca.toLowerCase()) &&
                        !f.pdv.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })

  const navModal = (dir) => {
    const novo = modalIdx + dir
    if (novo >= 0 && novo < filtrados.length) setModalIdx(novo)
  }

  useEffect(() => {
    const handler = (e) => {
      if (modalIdx === null) return
      if (e.key === 'ArrowLeft')  navModal(-1)
      if (e.key === 'ArrowRight') navModal(+1)
      if (e.key === 'Escape')     setModalIdx(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [modalIdx, filtrados.length])

  const foto = modalIdx !== null ? filtrados[modalIdx] : null

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Topbar */}
      <div style={{ height: 54, background: 'white', borderBottom: '.5px solid var(--g200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {onBack && <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--navy)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 500 }}>← Voltar</button>}
          <span style={{ fontSize: 15, fontWeight: 600 }}>Arquivos enviados pelos promotores</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['grid','list'].map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{ width: 32, height: 32, borderRadius: 7, border: '.5px solid var(--g200)', background: viewMode === m ? 'var(--navy)' : 'white', color: viewMode === m ? 'white' : 'var(--g400)', cursor: 'pointer', fontSize: 14 }}>
              {m === 'grid' ? '⊞' : '☰'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        {/* Info técnica */}
        <div style={{ background: 'var(--navy-light)', border: '.5px solid var(--navy-mid)', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 12, marginBottom: 18 }}>
          <span style={{ fontSize: 18 }}>📷</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 4 }}>Padrão de upload de fotos</div>
            <div style={{ fontSize: 12, color: 'var(--g600)', lineHeight: 1.6 }}>
              Fotos otimizadas automaticamente: <strong>JPEG 80% de qualidade</strong>, máximo <strong>1920px</strong>, resultando em <strong>200–400 KB</strong> por arquivo. Nitidez total, upload rápido em 4G.
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
          {[
            { lbl: 'Total de arquivos', val: FOTOS_DEMO.length, cor: 'var(--navy)' },
            { lbl: 'Fotos hoje',        val: 0,                 cor: 'var(--green)' },
            { lbl: 'Promotoras ativas', val: 2,                 cor: 'var(--g800)' },
            { lbl: 'Armazenamento',     val: '2.1 MB',          cor: 'var(--amber)' },
          ].map(k => (
            <Card key={k.lbl} style={{ padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>{k.lbl}</div>
              <div style={{ fontSize: 26, fontWeight: 600, color: k.cor }}>{k.val}</div>
            </Card>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1.5px solid var(--g200)', borderRadius: 9, padding: '9px 13px', flex: 1, minWidth: 200 }}>
            🔍 <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por promotora ou PDV..." style={{ border: 'none', outline: 'none', fontFamily: 'var(--font)', fontSize: 13, flex: 1 }} />
          </div>
          {[
            { val: filtPromotor, set: setFiltPromotor, opts: [['','Todas as promotoras'],['Jackeline','Jackeline B.'],['Nayanne','Nayanne C.']] },
            { val: filtBloco,    set: setFiltBloco,    opts: [['','Todos os blocos'],['Bloco 01','Bloco 01'],['Bloco 02','Bloco 02'],['Bloco 03','Bloco 03']] },
          ].map((f, i) => (
            <select key={i} value={f.val} onChange={e => f.set(e.target.value)} style={{ padding: '9px 28px 9px 12px', border: '.5px solid var(--g200)', borderRadius: 9, fontFamily: 'var(--font)', fontSize: 13, background: 'white', cursor: 'pointer', outline: 'none' }}>
              {f.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
        </div>

        {/* Grid */}
        {viewMode === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
            {filtrados.map((f, i) => (
              <div key={f.id} onClick={() => setModalIdx(i)} style={{ background: 'white', borderRadius: 11, border: '.5px solid var(--g200)', overflow: 'hidden', cursor: 'pointer', transition: 'all .18s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(27,58,109,.12)'; e.currentTarget.style.borderColor = 'var(--navy)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--g200)'; }}>
                <img src={f.img} alt={f.pergunta} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
                  onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                <div style={{ width: '100%', aspectRatio: '4/3', background: 'var(--navy-light)', display: 'none', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🖼</div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: f.cor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white', flexShrink: 0 }}>{f.ini}</div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--g800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.promotor}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--g400)', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.pdv}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge variant="navy" style={{ fontSize: 9 }}>{f.bloco}</Badge>
                    <span style={{ fontSize: 10, color: 'var(--g400)' }}>{f.data.split('-').reverse().join('/')}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, padding: '8px 12px', borderTop: '.5px solid var(--g100)' }}>
                  <button onClick={e => { e.stopPropagation(); setModalIdx(i); }} style={{ flex: 1, padding: '6px', border: 'none', borderRadius: 7, background: 'var(--navy)', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>🔍 Ampliar</button>
                  <button onClick={e => e.stopPropagation()} style={{ width: 30, padding: '6px', border: '.5px solid var(--g200)', borderRadius: 7, background: 'white', cursor: 'pointer', fontSize: 11 }}>⬇</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lista */}
        {viewMode === 'list' && (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--g50)' }}>
                  {['Foto','Promotora','PDV','Bloco / Pergunta','Data','Tamanho','Ações'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '.5px solid var(--g100)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((f, i) => (
                  <tr key={f.id} onClick={() => setModalIdx(i)} style={{ cursor: 'pointer', borderBottom: '.5px solid var(--g100)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--g50)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '10px 14px' }}>
                      <img src={f.img} alt="" style={{ width: 48, height: 36, borderRadius: 6, objectFit: 'cover', border: '.5px solid var(--g200)' }} onError={e => { e.target.style.display='none' }} />
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: f.cor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white', flexShrink: 0 }}>{f.ini}</div>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{f.promotor}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--g600)' }}>{f.pdv}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>{f.bloco}</div>
                      <div style={{ fontSize: 11, color: 'var(--g400)', marginTop: 1 }}>{f.pergunta}</div>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--g400)', whiteSpace: 'nowrap' }}>{f.data.split('-').reverse().join('/')} {f.hora}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--g400)' }}>{f.tamanho}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 5 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setModalIdx(i)} style={{ width: 28, height: 28, borderRadius: 7, border: '.5px solid var(--g200)', background: 'white', cursor: 'pointer', fontSize: 13 }}>🔍</button>
                        <button style={{ width: 28, height: 28, borderRadius: 7, border: '.5px solid var(--g200)', background: 'white', cursor: 'pointer', fontSize: 13 }}>⬇</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtrados.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--g400)' }}>Nenhum arquivo encontrado</div>}
          </Card>
        )}
      </div>

      {/* Modal ampliação */}
      {foto && (
        <div onClick={() => setModalIdx(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 900, width: '100%', background: 'white', borderRadius: 14, overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'var(--navy)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <div style={{ color: 'white', fontSize: 15, fontWeight: 600 }}>{foto.pergunta}</div>
                <div style={{ color: 'rgba(255,255,255,.55)', fontSize: 12, marginTop: 2 }}>{foto.promotor} · {foto.pdv}</div>
              </div>
              <button onClick={() => setModalIdx(null)} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: 'white', width: 30, height: 30, borderRadius: 7, cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F1A2E', padding: 16 }}>
                <img src={foto.img} alt={foto.pergunta} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 6 }} />
              </div>
              <div style={{ width: 240, borderLeft: '.5px solid var(--g100)', padding: 18, overflowY: 'auto', flexShrink: 0 }}>
                <SectionLabel>Detalhes</SectionLabel>
                {[['Promotora',foto.promotor],['PDV',foto.pdv],['Bloco',foto.bloco],['Pergunta',foto.pergunta],['Data',foto.data.split('-').reverse().join('/')+' '+foto.hora],['Tamanho',foto.tamanho],['Padrão','JPEG 80% · 1920px']].map(([k,v]) => (
                  <div key={k} style={{ padding: '8px 0', borderBottom: '.5px solid var(--g50)' }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--g800)', lineHeight: 1.4 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '12px 18px', borderTop: '.5px solid var(--g100)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              <button onClick={() => navModal(-1)} disabled={modalIdx === 0} style={{ width: 32, height: 32, borderRadius: 7, border: '.5px solid var(--g200)', background: 'white', cursor: modalIdx === 0 ? 'default' : 'pointer', opacity: modalIdx === 0 ? .4 : 1, fontSize: 15 }}>←</button>
              <button onClick={() => navModal(+1)} disabled={modalIdx === filtrados.length-1} style={{ width: 32, height: 32, borderRadius: 7, border: '.5px solid var(--g200)', background: 'white', cursor: modalIdx === filtrados.length-1 ? 'default' : 'pointer', opacity: modalIdx === filtrados.length-1 ? .4 : 1, fontSize: 15 }}>→</button>
              <span style={{ flex: 1, fontSize: 12, color: 'var(--g400)', paddingLeft: 8 }}>{modalIdx+1} de {filtrados.length}</span>
              <button style={{ padding: '8px 14px', border: '.5px solid var(--g200)', borderRadius: 8, background: 'white', color: 'var(--g600)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font)' }}>⬇ Baixar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
