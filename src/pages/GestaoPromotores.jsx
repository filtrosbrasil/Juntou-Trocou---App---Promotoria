import { useState } from 'react'
import { Badge, Card, SectionLabel, Input, Select, Btn, Toggle } from '../components/UI.jsx'

const CORES = ['#1B3A6D','#E31E24','#1A7F3C','#B8740A','#6B3FA0','#0F766E']

const PROMOTORES_INICIAL = [
  { id:1, nome:'Jackeline Brandani',      cpf:'123.456.789-00', telefone:'(41) 98765-4321', email:'jackeline@gmail.com', representacao:'JB Representações', username:'jack.brandani',  senha:'123456', monitoramento:'padrao',   gps:'nao', webApp:'sim', status:'ativo',  cor:'#1B3A6D' },
  { id:2, nome:'Nayanne Cristina Coimbra',cpf:'',               telefone:'(41) 99123-4567', email:'nayanne@gmail.com',   representacao:'NC Promoções',       username:'nayanne.hmvb',  senha:'123456', monitoramento:'padrao',   gps:'nao', webApp:'sim', status:'ativo',  cor:'#E31E24' },
  { id:3, nome:'Kamyla Amorim Oliveira',  cpf:'',               telefone:'(41) 97654-3210', email:'kamyla@gmail.com',    representacao:'KA Soluções',        username:'kamylla.adonai',senha:'123456', monitoramento:'fulltime', gps:'sim', webApp:'nao', status:'ativo',  cor:'#1A7F3C' },
  { id:4, nome:'Leliani',                 cpf:'',               telefone:'',                email:'leliani@gmail.com',   representacao:'',                   username:'leliani.hmvb',  senha:'123456', monitoramento:'padrao',   gps:'nao', webApp:'sim', status:'ativo',  cor:'#B8740A' },
  { id:5, nome:'Tatiane Horace',          cpf:'',               telefone:'(11) 96543-2109', email:'tati@gmail.com',      representacao:'TH Representações',  username:'tati.adonai',   senha:'123456', monitoramento:'padrao',   gps:'nao', webApp:'sim', status:'inativo',cor:'#6B3FA0' },
]

const FORM_VAZIO = { nome:'', cpf:'', telefone:'', email:'', representacao:'', username:'', senha:'', monitoramento:'padrao', gps:'nao', webApp:'sim', status:'ativo', extra1:'', extra2:'', extra3:'' }

function mascaraCPF(v) {
  return v.replace(/\D/g,'').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2').slice(0,14)
}
function mascaraTel(v) {
  const s = v.replace(/\D/g,'')
  return s.length <= 10
    ? s.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3')
    : s.replace(/(\d{2})(\d{5})(\d{0,4})/,'($1) $2-$3')
}

export default function GestaoPromotores({ onBack }) {
  const [promotores, setPromotores] = useState(PROMOTORES_INICIAL)
  const [tela, setTela]             = useState('lista') // lista | form
  const [editId, setEditId]         = useState(null)
  const [form, setForm]             = useState(FORM_VAZIO)
  const [erros, setErros]           = useState({})
  const [filtro, setFiltro]         = useState('todos')
  const [busca, setBusca]           = useState('')
  const [toast, setToast]           = useState(null)
  const [nextId, setNextId]         = useState(6)

  const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const lista = promotores.filter(p => {
    const matchFiltro = filtro === 'todos' || p.status === filtro
    const matchBusca  = !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) || p.username.toLowerCase().includes(busca.toLowerCase())
    return matchFiltro && matchBusca
  })

  const abrirCadastro = () => { setEditId(null); setForm(FORM_VAZIO); setErros({}); setTela('form') }

  const editarPromotor = (id) => {
    const p = promotores.find(x => x.id === id)
    if (!p) return
    setEditId(id)
    setForm({ ...FORM_VAZIO, ...p })
    setErros({})
    setTela('form')
  }

  const salvar = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Obrigatório'
    if (!form.senha || form.senha.length < 6) e.senha = 'Mínimo 6 caracteres'
    const dupl = promotores.find(p => p.username === form.username && p.id !== editId)
    if (dupl) e.username = 'Username já em uso'
    setErros(e)
    if (Object.keys(e).length > 0) return

    if (editId) {
      setPromotores(prev => prev.map(p => p.id === editId ? { ...p, ...form } : p))
      showToast('✓ Promotor atualizado!')
    } else {
      const novo = { ...form, id: nextId, cor: CORES[nextId % CORES.length] }
      setNextId(n => n+1)
      setPromotores(prev => [novo, ...prev])
      showToast('✓ Promotor cadastrado!')
    }
    setTela('lista')
  }

  const toggleStatus = (id) => {
    setPromotores(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'ativo' ? 'inativo' : 'ativo' } : p))
  }

  const remover = (id) => {
    if (!window.confirm('Remover o acesso deste promotor?')) return
    setPromotores(prev => prev.filter(p => p.id !== id))
    showToast('✓ Acesso removido.')
  }

  // ─── LISTA ───
  if (tela === 'lista') return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 54, background: 'white', borderBottom: '.5px solid var(--g200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {onBack && <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--navy)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 500 }}>← Voltar</button>}
          <span style={{ fontSize: 15, fontWeight: 600 }}>Gestão de Promotores</span>
          <Badge variant="navy">{promotores.filter(p=>p.status==='ativo').length} ativos</Badge>
        </div>
        <button onClick={abrirCadastro} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 8, background: 'var(--navy)', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer' }}>
          + Criar promotor
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        {/* Filtros */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1.5px solid var(--g200)', borderRadius: 9, padding: '9px 13px', flex: 1, minWidth: 200 }}>
            🔍 <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou username..." style={{ border: 'none', outline: 'none', fontFamily: 'var(--font)', fontSize: 13, flex: 1 }} />
          </div>
          {['todos','ativo','inativo'].map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{ padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '.5px solid var(--g200)', background: filtro===f?'var(--navy)':'white', color: filtro===f?'white':'var(--g600)', fontFamily: 'var(--font)' }}>
              {{ todos:'Todos', ativo:'Ativos', inativo:'Inativos' }[f]}
            </button>
          ))}
        </div>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--g50)' }}>
                {['Promotor','Username','Representação','Monitoramento','Web App','Status','Ações'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '.5px solid var(--g100)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map(p => {
                const ini = (p.nome||p.username).split(' ').slice(0,2).map(w=>w[0]?.toUpperCase()||'').join('')
                return (
                  <tr key={p.id} style={{ borderBottom: '.5px solid var(--g100)' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--g50)'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: p.cor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0 }}>{ini}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--g800)' }}>{p.nome||'—'}</div>
                          {p.email && <div style={{ fontSize: 11, color: 'var(--g400)', marginTop: 1 }}>{p.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 12, color: 'var(--g600)' }}>{p.username}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--g600)' }}>{p.representacao||'—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <Badge variant={p.monitoramento==='fulltime'?'amber':'navy'}>{p.monitoramento==='fulltime'?'Full-time':'Padrão'}</Badge>
                      {p.monitoramento==='fulltime'&&p.gps==='sim'&&<span style={{ marginLeft: 4 }}><Badge variant="amber">GPS+</Badge></span>}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <Badge variant={p.webApp==='sim'?'green':'red'}>{p.webApp==='sim'?'Autorizado':'Bloqueado'}</Badge>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <Badge variant={p.status==='ativo'?'green':'gray'}>{p.status==='ativo'?'Ativo':'Inativo'}</Badge>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[['✏️','Editar',()=>editarPromotor(p.id)],[p.status==='ativo'?'🔒':'🔓','Ativar/desativar',()=>toggleStatus(p.id)],['🗑','Remover',()=>remover(p.id)]].map(([ico,title,fn]) => (
                          <button key={ico} onClick={fn} title={title} style={{ width: 28, height: 28, borderRadius: 7, border: '.5px solid var(--g200)', background: 'white', cursor: 'pointer', fontSize: 13 }}>{ico}</button>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {lista.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--g400)' }}>Nenhum promotor encontrado</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--g800)', color: 'white', padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 999 }}>{toast}</div>}
    </div>
  )

  // ─── FORM ───
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 54, background: 'white', borderBottom: '.5px solid var(--g200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setTela('lista')} style={{ background: 'none', border: 'none', color: 'var(--navy)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 500 }}>← Promotores</button>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{editId ? 'Editar Promotor' : 'Cadastro de Promotor'}</span>
        </div>
        <button onClick={salvar} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 8, background: 'var(--green)', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer' }}>
          ✓ {editId ? 'Salvar alterações' : 'Cadastrar promotor'}
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        <div style={{ maxWidth: 760 }}>
          {/* Identificação */}
          <Card style={{ marginBottom: 14 }}>
            <SectionLabel>Dados de identificação</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Nome" value={form.nome} onChange={v=>setF('nome',v)} placeholder="Nome completo" />
              <Input label="CPF" value={form.cpf} onChange={v=>setF('cpf',mascaraCPF(v))} placeholder="000.000.000-00" />
              <Input label="Telefone" value={form.telefone} onChange={v=>setF('telefone',mascaraTel(v))} placeholder="(00) 00000-0000" />
              <Input label="E-mail" value={form.email} onChange={v=>setF('email',v)} placeholder="email@exemplo.com" type="email" />
              <div style={{ gridColumn: '1/-1' }}>
                <Input label="Nome da representação" value={form.representacao} onChange={v=>setF('representacao',v)} placeholder="Ex: Adonai Representações Ltda" />
              </div>
            </div>
          </Card>

          {/* Acesso */}
          <Card style={{ marginBottom: 14 }}>
            <SectionLabel>Acesso ao aplicativo</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Username *" value={form.username} onChange={v=>setF('username',v)} placeholder="Ex: jackeline.fb" error={erros.username} />
              <Input label="Senha *" value={form.senha} onChange={v=>setF('senha',v)} placeholder="Mínimo 6 caracteres" type="password" error={erros.senha} />
            </div>
          </Card>

          {/* Configurações */}
          <Card style={{ marginBottom: 14 }}>
            <SectionLabel>Configurações de acesso</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 6 }}>Tipo de monitoramento</label>
                <select value={form.monitoramento} onChange={e=>{ setF('monitoramento',e.target.value); if(e.target.value!=='fulltime') setF('gps','nao'); }} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--g200)', borderRadius: 9, fontFamily: 'var(--font)', fontSize: 13, outline: 'none' }}>
                  <option value="padrao">Padrão — monitorar apenas durante check-in e check-out</option>
                  <option value="fulltime">Full-time — monitorar geolocalização o tempo todo</option>
                </select>
                <div style={{ fontSize: 11, color: 'var(--g400)', marginTop: 5 }}>⚠️ Full-time não disponível no Web App</div>
              </div>

              {form.monitoramento === 'fulltime' && (
                <div>
                  <div style={{ background: 'var(--amber-light)', border: '.5px solid #F0C97A', borderRadius: 9, padding: '12px 14px', marginBottom: 10, fontSize: 12, color: 'var(--amber)', lineHeight: 1.5 }}>
                    <strong>GPS Enhancement</strong> — recomendado para promotores em regiões com sinal fraco, modo offline ou redes antigas. Ignora oscilações instáveis de GPS. Ative apenas quando necessário.
                  </div>
                  <Toggle value={form.gps==='sim'} onChange={v=>setF('gps',v?'sim':'nao')} label="GPS Enhancement ativado" />
                </div>
              )}

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 8 }}>Acesso ao Web App</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[['sim','Sim — autorizado','green'],['nao','Não — bloqueado','red']].map(([val,lbl,cor]) => (
                    <button key={val} onClick={()=>setF('webApp',val)} style={{ padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font)', border: `1.5px solid ${form.webApp===val?`var(--${cor})`:'var(--g200)'}`, background: form.webApp===val?`var(--${cor}-light)`:'white', color: form.webApp===val?`var(--${cor})`:'var(--g600)' }}>{lbl}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 8 }}>Status</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[['ativo','Ativo','green'],['inativo','Inativo','red']].map(([val,lbl,cor]) => (
                    <button key={val} onClick={()=>setF('status',val)} style={{ padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font)', border: `1.5px solid ${form.status===val?`var(--${cor})`:'var(--g200)'}`, background: form.status===val?`var(--${cor}-light)`:'white', color: form.status===val?`var(--${cor})`:'var(--g600)' }}>{lbl}</button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Campos extras */}
          <Card style={{ marginBottom: 22 }}>
            <SectionLabel>Campos extras <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10, color: 'var(--g400)', borderBottom: 'none' }}>— opcionais</span></SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[1,2,3].map(n => (
                <Input key={n} label={`Campo extra ${n}`} value={form[`extra${n}`]||''} onChange={v=>setF(`extra${n}`,v)} placeholder="" />
              ))}
            </div>
          </Card>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={salvar} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 20px', borderRadius: 9, background: 'var(--green)', color: 'white', border: 'none', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer' }}>
              ✓ {editId ? 'Salvar alterações' : 'Cadastrar promotor'}
            </button>
            <button onClick={() => setTela('lista')} style={{ padding: '11px 16px', borderRadius: 9, background: 'white', color: 'var(--g600)', border: '.5px solid var(--g200)', fontSize: 13, fontFamily: 'var(--font)', cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
