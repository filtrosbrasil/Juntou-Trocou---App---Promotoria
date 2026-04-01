import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Badge, Card, SectionLabel, ProgressBar, WebShell } from '../components/UI.jsx'
import { blocoStatus, fmtData, PROMOTORAS } from '../data/inicial.js'
import GaleriaArquivos   from './GaleriaArquivos.jsx'
import Relatorios        from './Relatorios.jsx'
import GestaoPromotores  from './GestaoPromotores.jsx'

const SIDEBAR = [
  { id:'dashboard',   label:'Dashboard',         icon:'⊞', section:'Principal' },
  { id:'promotores',  label:'Promotores',        icon:'👤' },
  { id:'pdvs',        label:'PDVs',              icon:'🏪' },
  { id:'visitas',     label:'Visitas',           icon:'📍' },
  { id:'blocos',      label:'Blocos Juntou Ganhou', icon:'✅', section:'Análise' },
  { id:'arquivos',    label:'Arquivos enviados', icon:'🖼' },
  { id:'relatorios',  label:'Relatórios',        icon:'📊' },
  { id:'alertas',     label:'Alertas',           icon:'⚠️' },
]

export default function GestorDashboard() {
  const { usuario, pdvs, blocos, navegar, logout } = useApp()
  const [aba, setAba] = useState('dashboard')

  const totalVisitas = pdvs.reduce((s,p) => s + p.visitas.length, 0)
  const completos    = pdvs.filter(p => blocoStatus(p, blocos).every(b => b.done)).length
  const b01Count     = pdvs.filter(p => p.visitas.some(v => v.blocoId === 'b01')).length
  const b02Count     = pdvs.filter(p => p.visitas.some(v => v.blocoId === 'b02')).length
  const b03Count     = pdvs.filter(p => p.visitas.some(v => v.blocoId === 'b03')).length

  const pdvsFiltrados = (filtro) => pdvs.filter(p => {
    const bs = blocoStatus(p, blocos)
    if (filtro === 'completo') return bs.every(b=>b.done)
    if (filtro === 'parcial')  return bs.some(b=>b.done) && !bs.every(b=>b.done)
    if (filtro === 'zero')     return !bs.some(b=>b.done)
    return true
  })

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'var(--g50)' }}>
      {/* SIDEBAR */}
      <aside style={{ width:220, background:'#122748', display:'flex', flexDirection:'column', flexShrink:0 }}>
        <div style={{ padding:'20px 18px 16px', borderBottom:'1px solid rgba(255,255,255,.07)' }}>
          <div style={{ fontSize:17, fontWeight:600, color:'white' }}>Filtros Brasil</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,.35)', marginTop:3, textTransform:'uppercase', letterSpacing:'.06em' }}>Painel do Gestor</div>
        </div>
        <div style={{ padding:'8px 6px', flex:1, overflowY:'auto' }}>
          {SIDEBAR.map((item, i) => (
            <div key={item.id}>
              {item.section && (
                <div style={{ padding:'14px 10px 5px', fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em' }}>{item.section}</div>
              )}
              <div onClick={() => setAba(item.id)} style={{
                display:'flex', alignItems:'center', gap:9,
                padding:'10px 14px', margin:'1px 0', borderRadius:8, cursor:'pointer',
                background: aba===item.id ? 'var(--red)' : 'transparent',
                color: aba===item.id ? 'white' : 'rgba(255,255,255,.55)',
                fontSize:13, fontWeight:500, transition:'all .15s',
              }}>
                <span style={{ fontSize:15 }}>{item.icon}</span> {item.label}
              </div>
            </div>
          ))}
          <div style={{ borderTop:'1px solid rgba(255,255,255,.07)', margin:'8px 0', paddingTop:8 }}>
            <div onClick={() => navegar('editor-blocos')} style={{ display:'flex', alignItems:'center', gap:9, padding:'10px 14px', borderRadius:8, cursor:'pointer', color:'rgba(255,255,255,.55)', fontSize:13, fontWeight:500 }}>
              ✏️ Editor de Blocos
            </div>
          </div>
        </div>
        <div style={{ padding:'14px 12px', borderTop:'1px solid rgba(255,255,255,.07)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:11, fontWeight:600 }}>{usuario?.iniciais}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:'white' }}>{usuario?.nome?.split(' ').slice(0,2).join(' ')}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>Gestor</div>
            </div>
          </div>
          <button onClick={logout} style={{ width:'100%', padding:'7px', border:'1px solid rgba(255,255,255,.15)', borderRadius:7, background:'transparent', color:'rgba(255,255,255,.55)', fontSize:12, cursor:'pointer', fontFamily:'var(--font)' }}>Sair</button>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Módulos que têm layout próprio */}
        {aba === 'arquivos'   && <GaleriaArquivos />}
        {aba === 'relatorios' && <Relatorios />}
        {aba === 'promotores' && <GestaoPromotores />}

        {/* Dashboard principal e demais abas */}
        {!['arquivos','relatorios','promotores'].includes(aba) && (
          <>
            {/* Topbar */}
            <div style={{ height:54, background:'white', borderBottom:'.5px solid var(--g200)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', flexShrink:0 }}>
              <div style={{ fontSize:15, fontWeight:600 }}>
                {{ dashboard:'Dashboard — Visão Geral', pdvs:'PDVs', visitas:'Visitas', blocos:'Blocos Juntou Ganhou', alertas:'Alertas' }[aba] || aba}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:12, color:'var(--g400)' }}>{new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</span>
                <div style={{ padding:'5px 10px', borderRadius:20, background:'var(--green-light)', color:'var(--green)', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--green)' }} />
                  {PROMOTORAS.length} promotoras ativas
                </div>
              </div>
            </div>

            <div style={{ flex:1, overflowY:'auto', padding:'22px 24px' }}>

              {/* DASHBOARD */}
              {aba === 'dashboard' && (
                <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
                    {[
                      { label:'PDVs cadastrados',    val:pdvs.length,  cor:'var(--navy)',  delta:'+7 esta semana' },
                      { label:'Visitas totais',       val:totalVisitas, cor:'var(--green)', delta:'total registradas' },
                      { label:'Blocos respondidos',   val:b01Count+b02Count+b03Count, cor:'var(--navy)', delta:'todos os blocos' },
                      { label:'Jornadas completas',   val:completos,    cor:'var(--red)',   delta:`${Math.round(completos/Math.max(pdvs.length,1)*100)}% dos PDVs` },
                    ].map(k => (
                      <Card key={k.label} style={{ padding:18 }}>
                        <div style={{ fontSize:11, fontWeight:600, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>{k.label}</div>
                        <div style={{ fontSize:30, fontWeight:600, color:k.cor, lineHeight:1 }}>{k.val}</div>
                        <div style={{ fontSize:12, color:'var(--g400)', marginTop:5 }}>{k.delta}</div>
                      </Card>
                    ))}
                  </div>

                  {/* Atalhos para módulos */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                    {[
                      { icon:'👤', label:'Promotores',  desc:`${PROMOTORAS.length} ativos`,              aba:'promotores',  cor:'var(--navy)' },
                      { icon:'🖼', label:'Arquivos',     desc:'Fotos das visitas',                         aba:'arquivos',   cor:'var(--green)' },
                      { icon:'📊', label:'Relatórios',  desc:'7 tipos disponíveis',                       aba:'relatorios', cor:'var(--purple)' },
                      { icon:'✅', label:'Juntou Ganhou',desc:`${completos} completos`,                   aba:'blocos',     cor:'var(--amber)' },
                    ].map(m => (
                      <div key={m.aba} onClick={() => setAba(m.aba)} style={{ background:'white', borderRadius:12, border:'.5px solid var(--g200)', padding:16, cursor:'pointer', transition:'all .15s' }}
                        onMouseEnter={e=>{ e.currentTarget.style.borderColor=m.cor; e.currentTarget.style.transform='translateY(-2px)'; }}
                        onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--g200)'; e.currentTarget.style.transform=''; }}>
                        <div style={{ fontSize:24, marginBottom:8 }}>{m.icon}</div>
                        <div style={{ fontSize:14, fontWeight:600, color:'var(--g800)' }}>{m.label}</div>
                        <div style={{ fontSize:12, color:'var(--g400)', marginTop:2 }}>{m.desc}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:16 }}>
                    {/* Mapa */}
                    <Card>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:12 }}>Equipe em campo</div>
                      <div style={{ background:'var(--navy-light)', borderRadius:10, height:240, position:'relative', overflow:'hidden', border:'.5px solid var(--navy-mid)' }}>
                        {[25,50,75].map(p=><div key={p} style={{position:'absolute',width:'100%',height:.5,background:'rgba(27,58,109,.08)',top:`${p}%`}}/>)}
                        {[20,40,60,80].map(p=><div key={p} style={{position:'absolute',height:'100%',width:.5,background:'rgba(27,58,109,.08)',left:`${p}%`}}/>)}
                        {[['#1B3A6D','35%','28%','Jackeline'],['#E31E24','20%','55%','Nayanne'],['#1A7F3C','60%','42%','Kamyla'],['#B8740A','45%','72%','Leliani']].map(([cor,top,left,nome])=>(
                          <div key={nome} title={nome} style={{position:'absolute',width:14,height:14,borderRadius:'50%',background:cor,border:'2px solid white',transform:'translate(-50%,-50%)',top,left,cursor:'pointer',boxShadow:`0 0 0 3px ${cor}33`}}/>
                        ))}
                        <div style={{position:'absolute',bottom:8,left:8,display:'flex',flexDirection:'column',gap:4}}>
                          {[['#1B3A6D','Jackeline'],['#E31E24','Nayanne'],['#1A7F3C','Kamyla'],['#B8740A','Leliani']].map(([c,n])=>(
                            <div key={n} style={{display:'flex',alignItems:'center',gap:5,background:'white',padding:'3px 7px',borderRadius:5,border:'.5px solid var(--g200)',fontSize:10,fontWeight:500,color:'var(--navy)'}}>
                              <div style={{width:8,height:8,borderRadius:'50%',background:c}}/>{n}
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                    {/* Metas */}
                    <Card>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:12 }}>Metas — março</div>
                      {PROMOTORAS.map(p => {
                        const pct = Math.round((p.realizadas/p.metaMes)*100)
                        const cor = pct>=70?'var(--green)':pct>=50?'var(--navy)':'var(--amber)'
                        return (
                          <div key={p.email} style={{ marginBottom:12 }}>
                            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                              <span style={{ fontWeight:500 }}>{p.nome.split(' ').slice(0,2).join(' ')}</span>
                              <span style={{ color:'var(--g600)' }}>{p.realizadas}/{p.metaMes} ({pct}%)</span>
                            </div>
                            <ProgressBar value={p.realizadas} max={p.metaMes} color={cor} />
                          </div>
                        )
                      })}
                    </Card>
                  </div>
                </div>
              )}

              {/* PDVs */}
              {aba === 'pdvs' && (
                <Card style={{ padding:0, overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:'var(--g50)' }}>
                        {['PDV','Cidade','Promotora','Blocos','Última visita','Status'].map(h=>(
                          <th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:10,fontWeight:600,color:'var(--g400)',textTransform:'uppercase',letterSpacing:'.05em',borderBottom:'.5px solid var(--g100)'}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pdvs.map(p => {
                        const bs = blocoStatus(p, blocos)
                        const done = bs.filter(b=>b.done).length
                        const ult = p.visitas.length ? p.visitas[p.visitas.length-1].data : null
                        return (
                          <tr key={p.id} style={{borderBottom:'.5px solid var(--g100)'}} onMouseEnter={e=>e.currentTarget.style.background='var(--g50)'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                            <td style={{padding:'11px 14px',fontWeight:600,fontSize:13}}>{p.nomeFantasia}</td>
                            <td style={{padding:'11px 14px',fontSize:13,color:'var(--g600)'}}>{p.cidade}, {p.estado}</td>
                            <td style={{padding:'11px 14px',fontSize:13,color:'var(--g600)'}}>{PROMOTORAS.find(pr=>pr.email===p.promotora)?.nome?.split(' ').slice(0,2).join(' ')||p.promotora}</td>
                            <td style={{padding:'11px 14px'}}>
                              <div style={{display:'flex',gap:4}}>
                                {bs.map((b,i)=>(
                                  <div key={i} style={{width:22,height:22,borderRadius:6,background:b.done?'var(--green)':'var(--g100)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:b.done?'white':'var(--g400)'}}>{b.done?'✓':(i+1)}</div>
                                ))}
                              </div>
                            </td>
                            <td style={{padding:'11px 14px',fontSize:12,color:'var(--g400)'}}>{ult?fmtData(ult):'—'}</td>
                            <td style={{padding:'11px 14px'}}>
                              <Badge variant={done===3?'green':done===0?'gray':'navy'}>{done===3?'Completo':done===0?'Sem visita':'Em andamento'}</Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </Card>
              )}

              {/* BLOCOS */}
              {aba === 'blocos' && (
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
                    {[['Bloco 01 — Primeira Visita',b01Count,'#1B3A6D'],['Bloco 02 — Acompanhamento',b02Count,'#1A7F3C'],['Bloco 03 — Evolução',b03Count,'#B8740A']].map(([lbl,val,cor])=>(
                      <Card key={lbl} style={{padding:18}}>
                        <div style={{fontSize:11,fontWeight:600,color:'var(--g400)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:8}}>{lbl}</div>
                        <div style={{fontSize:28,fontWeight:600,color:cor,marginBottom:8}}>{val} PDVs</div>
                        <ProgressBar value={val} max={Math.max(pdvs.length,1)} color={cor} />
                        <div style={{fontSize:12,color:'var(--g400)',marginTop:6}}>{Math.round(val/Math.max(pdvs.length,1)*100)}% dos PDVs</div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* ALERTAS */}
              {aba === 'alertas' && (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {[
                    { tipo:'danger', titulo:'2 check-ins bloqueados por GPS hoje', sub:'Leliani tentou check-in a 380m do PDV. Sistema bloqueou corretamente.' },
                    { tipo:'warn',   titulo:'Promotora com meta abaixo de 50%',    sub:'Leliani: 28 de 70 visitas realizadas em março.' },
                    { tipo:'info',   titulo:`${pdvs.filter(p=>p.visitas.length===0).length} PDVs sem nenhuma visita`, sub:'PDVs cadastrados que ainda não receberam a primeira visita.' },
                  ].map((a,i) => (
                    <div key={i} style={{padding:'13px 16px',borderRadius:10,display:'flex',gap:12,background:a.tipo==='danger'?'var(--red-light)':a.tipo==='warn'?'var(--amber-light)':'var(--navy-light)',border:`1px solid ${a.tipo==='danger'?'#F5B3B3':a.tipo==='warn'?'#F0C97A':'var(--navy-mid)'}`}}>
                      <span style={{fontSize:18}}>{a.tipo==='danger'?'🔴':a.tipo==='warn'?'⚠️':'ℹ️'}</span>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:a.tipo==='danger'?'var(--red)':a.tipo==='warn'?'var(--amber)':'var(--navy)'}}>{a.titulo}</div>
                        <div style={{fontSize:12,color:'var(--g600)',marginTop:3,lineHeight:1.5}}>{a.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* VISITAS */}
              {aba === 'visitas' && (
                <Card>
                  <SectionLabel>Últimas visitas registradas</SectionLabel>
                  {pdvs.flatMap(p=>p.visitas.map(v=>({...v,pdvNome:p.nomeFantasia,promo:PROMOTORAS.find(pr=>pr.email===p.promotora)?.nome?.split(' ')[0]||'—'}))).sort((a,b)=>b.data?.localeCompare(a.data||'')).slice(0,10).map((v,i,arr)=>(
                    <div key={v.id} style={{display:'flex',gap:10,padding:'9px 0',borderBottom:i<arr.length-1?'.5px solid var(--g100)':'none'}}>
                      <div style={{paddingTop:3,display:'flex',flexDirection:'column',alignItems:'center'}}>
                        <div style={{width:10,height:10,borderRadius:'50%',background:'var(--green)',flexShrink:0}}/>
                        {i<arr.length-1&&<div style={{width:1,flex:1,background:'var(--g100)',marginTop:4}}/>}
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:'var(--g800)'}}>{v.pdvNome}</div>
                        <div style={{fontSize:11,color:'var(--g400)',marginTop:2}}>{v.promo} · {v.checkinHora||'—'} · GPS ✓</div>
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
