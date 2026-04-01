import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Badge, Card, SectionLabel } from '../components/UI.jsx'

const PROMOTORES_DEMO = [
  { nome:'Jackeline Brandani', ini:'JB', cor:'#1B3A6D', regiao:'Curitiba Sul',    pdvs:3, visitas:47, meta:64 },
  { nome:'Nayanne Cristina',   ini:'NK', cor:'#E31E24', regiao:'Grande Curitiba', pdvs:4, visitas:58, meta:72 },
  { nome:'Kamyla A. Oliveira', ini:'KA', cor:'#1A7F3C', regiao:'Interior PR',     pdvs:3, visitas:42, meta:60 },
  { nome:'Leliani',            ini:'LL', cor:'#B8740A', regiao:'SP Capital',      pdvs:2, visitas:28, meta:70 },
  { nome:'Tatiane Horace',     ini:'TH', cor:'#6B3FA0', regiao:'ABC Paulista',    pdvs:3, visitas:50, meta:65 },
]

const PDVS_DEMO = [
  { nome:'BERKO Centro Automotivo', cidade:'Curitiba, PR',    promotor:'Jackeline Brandani', b01:true,  b02:true,  b03:true,  crm:'cliente' },
  { nome:'Distribuidora Scherer',   cidade:'SJP, PR',         promotor:'Jackeline Brandani', b01:true,  b02:false, b03:false, crm:'lead'    },
  { nome:'Distribuidora NovaTec',   cidade:'Curitiba, PR',    promotor:'Nayanne Cristina',   b01:true,  b02:true,  b03:false, crm:'lead'    },
  { nome:'Filter Plus ABC',         cidade:'Santo André, SP', promotor:'Tatiane Horace',     b01:true,  b02:true,  b03:true,  crm:'cliente' },
  { nome:'Auto Mecânica Romar',     cidade:'Curitiba, PR',    promotor:'Kamyla A. Oliveira', b01:false, b02:false, b03:false, crm:'lead'    },
  { nome:'Auto Peças Mega',         cidade:'SP Capital',      promotor:'Leliani',             b01:true,  b02:false, b03:false, crm:'lead'    },
]

const RELATORIOS = [
  { id:'promotor', titulo:'Relatório por Promotor',          desc:'Desempenho individual — visitas, metas e cobertura.',           icon:'👤', cor:'#1B3A6D', corL:'#E8EDF7', tags:['Promotores','Visitas','Metas'] },
  { id:'perguntas',titulo:'Relatório de Perguntas',          desc:'Análise das perguntas dos blocos — respostas e recorrência.',    icon:'❓', cor:'#6B3FA0', corL:'#F0EAF9', tags:['Perguntas','Blocos','Respostas'] },
  { id:'pesquisa', titulo:'Pesquisa por Promotor',           desc:'Respostas de pesquisa por promotor, PDV e bloco.',              icon:'🔍', cor:'#0F766E', corL:'#CCFBF1', tags:['Pesquisa','Promotores','PDV'] },
  { id:'roteiros', titulo:'Relatório de Roteiros',           desc:'Roteiros executados — cobertura e status por promotor.',        icon:'🗺', cor:'#B8740A', corL:'#FFF3DC', tags:['Roteiros','Execução','Regiões'] },
  { id:'carteira', titulo:'Relatório de Carteira',           desc:'Carteira de PDVs por promotor — CRM e histórico.',             icon:'💼', cor:'#BE185D', corL:'#FCE7F3', tags:['Carteira','PDVs','CRM'] },
  { id:'pdv',      titulo:'Relatório de PDV',                desc:'Consolidação dos PDVs — visitas, blocos e perfil comercial.',   icon:'🏪', cor:'#1A7F3C', corL:'#E6F5EC', tags:['PDVs','Blocos','Comercial'] },
  { id:'juntou',   titulo:'Relatório Juntou, Ganhou',        desc:'Funil completo do programa — PDVs e jornadas concluídas.',     icon:'🏆', cor:'#E31E24', corL:'#FDEAEA', tags:['Juntou Ganhou','Funil','Blocos'] },
]

function ProgressBar({ value, max, color = 'var(--navy)', height = 6 }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div style={{ background: 'var(--g100)', borderRadius: 3, height, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color, transition: 'width .6s' }} />
    </div>
  )
}

export default function Relatorios({ onBack }) {
  const { pdvs, blocos } = useApp()
  const [relAtivo, setRelAtivo] = useState(null)
  const [filtros, setFiltros]   = useState({})
  const [gerado, setGerado]     = useState(false)
  const [toast, setToast]       = useState(null)

  const setF = (k, v) => setFiltros(prev => ({ ...prev, [k]: v }))

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const abrirRel = (id) => {
    setRelAtivo(RELATORIOS.find(r => r.id === id))
    setFiltros({})
    setGerado(false)
  }

  const voltar = () => {
    setRelAtivo(null)
    setGerado(false)
  }

  // ─── RENDERS DE TABELA ───
  const renderTabela = () => {
    const id = relAtivo?.id
    const lista = PROMOTORES_DEMO.filter(p =>
      !filtros.promotor || filtros.promotor === 'todos' || p.nome === filtros.promotor
    )

    if (id === 'promotor') return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr style={{ background: 'var(--g50)' }}>
          {['Promotor','Região','PDVs','Visitas','Meta','% Meta','Status'].map(h => (
            <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '.5px solid var(--g100)' }}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {lista.map(p => {
            const pct = Math.round((p.visitas / p.meta) * 100)
            const [badge, lbl] = pct >= 70 ? ['green','No prazo'] : pct >= 50 ? ['navy','Atenção'] : ['amber','Crítico']
            return (
              <tr key={p.nome} style={{ borderBottom: '.5px solid var(--g100)' }}>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.cor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white' }}>{p.ini}</div>
                    <span style={{ fontWeight: 600 }}>{p.nome}</span>
                  </div>
                </td>
                <td style={{ padding: '11px 14px', color: 'var(--g600)', fontSize: 13 }}>{p.regiao}</td>
                <td style={{ padding: '11px 14px', fontWeight: 600, fontSize: 13 }}>{p.pdvs}</td>
                <td style={{ padding: '11px 14px', fontWeight: 600, fontSize: 13 }}>{p.visitas}</td>
                <td style={{ padding: '11px 14px', color: 'var(--g400)', fontSize: 13 }}>{p.meta}</td>
                <td style={{ padding: '11px 14px', minWidth: 110 }}>
                  <div style={{ fontSize: 11, color: 'var(--g600)', marginBottom: 3 }}>{pct}%</div>
                  <ProgressBar value={p.visitas} max={p.meta} color={pct>=70?'var(--green)':pct>=50?'var(--navy)':'var(--amber)'} />
                </td>
                <td style={{ padding: '11px 14px' }}><Badge variant={badge}>{lbl}</Badge></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )

    if (id === 'pdv' || id === 'carteira') return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr style={{ background: 'var(--g50)' }}>
          {['PDV','Cidade','Promotor','Bloco 01','Bloco 02','Bloco 03','Status','CRM'].map(h => (
            <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '.5px solid var(--g100)', whiteSpace: 'nowrap' }}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {PDVS_DEMO.map(p => {
            const done = [p.b01,p.b02,p.b03].filter(Boolean).length
            const [badge,lbl] = done===3?['green','Completo']:done===0?['gray','Sem visita']:['navy','Em andamento']
            const bf = (ok) => <span style={{ color: ok?'var(--green)':'var(--g300)', fontWeight: 700 }}>{ok?'✓':'—'}</span>
            return (
              <tr key={p.nome} style={{ borderBottom: '.5px solid var(--g100)' }}>
                <td style={{ padding: '11px 14px', fontWeight: 600, fontSize: 13 }}>{p.nome}</td>
                <td style={{ padding: '11px 14px', color: 'var(--g600)', fontSize: 13 }}>{p.cidade}</td>
                <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--g600)' }}>{p.promotor}</td>
                <td style={{ padding: '11px 14px', textAlign: 'center' }}>{bf(p.b01)}</td>
                <td style={{ padding: '11px 14px', textAlign: 'center' }}>{bf(p.b02)}</td>
                <td style={{ padding: '11px 14px', textAlign: 'center' }}>{bf(p.b03)}</td>
                <td style={{ padding: '11px 14px' }}><Badge variant={badge}>{lbl}</Badge></td>
                <td style={{ padding: '11px 14px' }}><Badge variant={p.crm==='cliente'?'green':'gray'}>{p.crm==='cliente'?'Cliente':'Lead'}</Badge></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )

    if (id === 'juntou') {
      const total = PDVS_DEMO.length
      const b1 = PDVS_DEMO.filter(p=>p.b01).length
      const b2 = PDVS_DEMO.filter(p=>p.b02).length
      const b3 = PDVS_DEMO.filter(p=>p.b03).length
      return (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, padding: 18 }}>
            {[['Total','⊞',total,total,'var(--g400)'],['Bloco 01','1️⃣',b1,total,'var(--navy)'],['Bloco 02','2️⃣',b2,total,'var(--green)'],['Bloco 03','3️⃣',b3,total,'var(--amber)']].map(([lbl,ico,val,tot,cor]) => (
              <div key={lbl} style={{ background: 'var(--g50)', borderRadius: 10, padding: 14, border: '.5px solid var(--g200)', textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{ico}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: cor, marginBottom: 4 }}>{val}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', marginBottom: 6 }}>{lbl}</div>
                <ProgressBar value={val} max={tot} color={cor} height={5} />
                <div style={{ fontSize: 10, color: 'var(--g400)', marginTop: 4 }}>{Math.round(val/tot*100)}%</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '.5px solid var(--g100)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--g50)' }}>
                {['PDV','Promotor','B01','B02','B03','Status'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '.5px solid var(--g100)' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {PDVS_DEMO.map(p => {
                  const done = [p.b01,p.b02,p.b03].filter(Boolean).length
                  const [badge,lbl] = done===3?['green','✅ Completo']:done===0?['gray','Sem visita']:['navy',`Bloco 0${done+1} pendente`]
                  const bf = (ok) => <span style={{ color: ok?'var(--green)':'var(--g200)', fontWeight: 700 }}>{ok?'✓':'—'}</span>
                  return (
                    <tr key={p.nome} style={{ borderBottom: '.5px solid var(--g100)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, fontSize: 13 }}>{p.nome}</td>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--g600)' }}>{p.promotor}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>{bf(p.b01)}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>{bf(p.b02)}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>{bf(p.b03)}</td>
                      <td style={{ padding: '10px 14px' }}><Badge variant={badge}>{lbl}</Badge></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    // Fallback para outros relatórios
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--g400)' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>{relAtivo?.icon}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--g800)', marginBottom: 6 }}>Dados gerados com sucesso</div>
        <div style={{ fontSize: 13 }}>Em produção, os dados vêm do Supabase em tempo real.</div>
      </div>
    )
  }

  // ─── INDEX ───
  if (!relAtivo) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 54, background: 'white', borderBottom: '.5px solid var(--g200)', display: 'flex', alignItems: 'center', padding: '0 24px', flexShrink: 0 }}>
        {onBack && <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--navy)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 500, marginRight: 12 }}>← Voltar</button>}
        <span style={{ fontSize: 15, fontWeight: 600 }}>Central de Relatórios</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {RELATORIOS.map(r => (
            <div key={r.id} onClick={() => abrirRel(r.id)} style={{ background: 'white', borderRadius: 14, border: '.5px solid var(--g200)', overflow: 'hidden', cursor: 'pointer', transition: 'all .18s', display: 'flex', flexDirection: 'column' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
              <div style={{ padding: '18px 18px 14px', display: 'flex', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: r.corL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{r.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--g800)', marginBottom: 4 }}>{r.titulo}</div>
                  <div style={{ fontSize: 12, color: 'var(--g400)', lineHeight: 1.55 }}>{r.desc}</div>
                </div>
              </div>
              <div style={{ marginTop: 'auto', padding: '11px 18px', borderTop: '.5px solid var(--g100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {r.tags.map(t => <span key={t} style={{ fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 20, background: 'var(--g50)', color: 'var(--g600)', border: '.5px solid var(--g200)' }}>{t}</span>)}
                </div>
                <button style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', border: 'none', background: r.corL, color: r.cor }}>Abrir →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // ─── DETALHE ───
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 54, background: 'white', borderBottom: '.5px solid var(--g200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={voltar} style={{ background: 'none', border: 'none', color: 'var(--navy)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 500 }}>← Relatórios</button>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{relAtivo.titulo}</span>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Filtros */}
        <Card>
          <SectionLabel>Filtros</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Promotor</label>
              <select value={filtros.promotor||''} onChange={e=>setF('promotor',e.target.value)} style={{ padding: '9px 11px', border: '1.5px solid var(--g200)', borderRadius: 8, fontFamily: 'var(--font)', fontSize: 13, outline: 'none' }}>
                <option value="">Todos</option>
                {PROMOTORES_DEMO.map(p => <option key={p.nome} value={p.nome}>{p.nome}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Período</label>
              <select value={filtros.periodo||''} onChange={e=>setF('periodo',e.target.value)} style={{ padding: '9px 11px', border: '1.5px solid var(--g200)', borderRadius: 8, fontFamily: 'var(--font)', fontSize: 13, outline: 'none' }}>
                <option value="">Este mês</option>
                <option value="ant">Mês anterior</option>
                <option value="tri">Este trimestre</option>
                <option value="all">Todo o período</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Bloco</label>
              <select value={filtros.bloco||''} onChange={e=>setF('bloco',e.target.value)} style={{ padding: '9px 11px', border: '1.5px solid var(--g200)', borderRadius: 8, fontFamily: 'var(--font)', fontSize: 13, outline: 'none' }}>
                <option value="">Todos</option>
                <option value="b01">Bloco 01</option>
                <option value="b02">Bloco 02</option>
                <option value="b03">Bloco 03</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setGerado(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 9, background: 'var(--navy)', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer' }}>
              📊 Gerar relatório
            </button>
            <button onClick={() => { setFiltros({}); setGerado(false); }} style={{ padding: '10px 16px', borderRadius: 9, background: 'white', color: 'var(--g600)', border: '.5px solid var(--g200)', fontSize: 13, fontFamily: 'var(--font)', cursor: 'pointer' }}>
              Limpar
            </button>
          </div>
        </Card>

        {/* Preview */}
        {gerado && (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '.5px solid var(--g100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{relAtivo.titulo}</div>
              <div style={{ fontSize: 12, color: 'var(--g400)' }}>março/2026</div>
            </div>
            {renderTabela()}
            <div style={{ padding: '12px 18px', borderTop: '.5px solid var(--g100)', background: 'var(--g50)', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--g400)', flex: 1 }}>Exportar como:</span>
              {['📄 PDF','📊 Excel','📋 CSV'].map(fmt => (
                <button key={fmt} onClick={() => showToast(`✓ Gerando ${fmt}...`)} style={{ padding: '7px 12px', border: '.5px solid var(--g200)', borderRadius: 8, background: 'white', color: 'var(--g600)', fontSize: 12, fontFamily: 'var(--font)', cursor: 'pointer' }}>{fmt}</button>
              ))}
            </div>
          </Card>
        )}
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--g800)', color: 'white', padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 999, boxShadow: '0 8px 24px rgba(0,0,0,.2)' }}>{toast}</div>
      )}
    </div>
  )
}
