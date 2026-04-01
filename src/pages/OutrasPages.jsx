import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Badge, Card, SectionLabel, ProgressBar, Btn, Input, Select, Toggle, DeviceShell, WebShell } from '../components/UI.jsx';
import { blocoStatus, fmtData, TIPOS_PERGUNTA } from '../data/inicial.js';

// ══════════════════════════════════
// PORTAL DO REPRESENTANTE
// ══════════════════════════════════
export function RepresentantePortal() {
  const { usuario, pdvs, blocos, logout } = useApp();
  const [aba, setAba] = useState('home');

  const meuspdvs = pdvs.slice(0, 3); // simula região do rep
  const visitados = meuspdvs.filter(p => p.visitas.length > 0).length;

  return (
    <DeviceShell>
      <div style={{ background: 'var(--navy)', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Filtros Brasil PDV</div>
            <div style={{ fontSize: 10, background: 'var(--red)', color: 'white', padding: '2px 7px', borderRadius: 20, fontWeight: 600, marginTop: 4, display: 'inline-block' }}>Representante</div>
          </div>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,.1)', border: 'none', color: 'rgba(255,255,255,.7)', fontSize: 11, padding: '5px 10px', borderRadius: 7, cursor: 'pointer', fontFamily: 'var(--font)' }}>Sair</button>
        </div>
        <div style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>{usuario?.nome}</div>
        <div style={{ color: 'rgba(255,255,255,.55)', fontSize: 12, marginTop: 2 }}>Região: Grande São Paulo</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {[
            { num: meuspdvs.length, lbl: 'PDVs na região', cor: 'var(--navy)' },
            { num: visitados,        lbl: 'Visitados',      cor: 'var(--green)' },
            { num: meuspdvs.length - visitados, lbl: 'Pendentes', cor: 'var(--red)' },
          ].map(s => (
            <Card key={s.lbl} style={{ textAlign: 'center', padding: '12px 8px' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.cor }}>{s.num}</div>
              <div style={{ fontSize: 10, color: 'var(--g400)', marginTop: 2 }}>{s.lbl}</div>
            </Card>
          ))}
        </div>

        {/* Cobertura */}
        <Card>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 6 }}>Cobertura da região — março</div>
          <ProgressBar value={visitados} max={meuspdvs.length} color="var(--navy)" height={10} />
          <div style={{ fontSize: 12, color: 'var(--g600)', marginTop: 6 }}>{Math.round(visitados/Math.max(meuspdvs.length,1)*100)}% dos PDVs visitados</div>
        </Card>

        {/* Resultados pesquisa */}
        <Card>
          <SectionLabel>Resultado da pesquisa — sua região</SectionLabel>
          {[
            ['Share Filtros Brasil',    '31%',         'navy'],
            ['PDVs com destaque FB',   '58%',         'green'],
            ['Já compraram FB',        '71%',         'green'],
            ['Principal concorrente',  'Mann Filter', 'amber'],
          ].map(([k,v,variant]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '.5px solid var(--g100)', fontSize: 13 }}>
              <span style={{ color: 'var(--g600)' }}>{k}</span>
              <Badge variant={variant}>{v}</Badge>
            </div>
          ))}
        </Card>

        {/* PDVs */}
        <Card>
          <SectionLabel>PDVs da sua região</SectionLabel>
          {meuspdvs.map((p, i) => {
            const bs = blocoStatus(p, blocos);
            const done = bs.filter(b=>b.done).length;
            const ult = p.visitas.length ? fmtData(p.visitas[p.visitas.length-1].data) : 'Sem visita';
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i<meuspdvs.length-1?'.5px solid var(--g100)':'none' }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: done>0?'var(--green)':'var(--amber)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--g800)' }}>{p.nomeFantasia}</div>
                  <div style={{ fontSize: 11, color: 'var(--g400)', marginTop: 1 }}>{ult}</div>
                </div>
                <Badge variant={done===3?'green':done===0?'gray':'navy'}>{done}/3 blocos</Badge>
              </div>
            );
          })}
        </Card>
      </div>
    </DeviceShell>
  );
}

// ══════════════════════════════════
// EDITOR DE BLOCOS
// ══════════════════════════════════
export function EditorBlocos() {
  const { blocos, saveBlocos, navegar, logout, usuario, showToast } = useApp();
  const [blocoIdx, setBlocoIdx]   = useState(0);
  const [novaTipo, setNovaTipo]   = useState('single');
  const [novoTexto, setNovoTexto] = useState('');
  const [novoOpcoes, setNovoOpcoes] = useState('');
  const [novoObrig, setNovoObrig] = useState(false);
  const [editIdx, setEditIdx]     = useState(null);

  const bloco = blocos[blocoIdx];
  const temOpcoes = ['single','multi','slider'].includes(novaTipo);

  const addPergunta = () => {
    if (!novoTexto.trim()) { showToast('Informe o texto da pergunta.', 'error'); return; }
    const nova = { id: 'q'+Date.now(), ordem: bloco.perguntas.length+1, tipo: novaTipo, texto: novoTexto.trim(), opcoes: novoOpcoes.trim(), obrigatorio: novoObrig, condicional: false };
    const novos = blocos.map((b,i) => i===blocoIdx ? { ...b, perguntas: [...b.perguntas, nova] } : b);
    saveBlocos(novos);
    setNovoTexto(''); setNovoOpcoes(''); setNovoObrig(false);
    showToast('Pergunta adicionada!');
  };

  const removerPergunta = (qi) => {
    const novos = blocos.map((b,i) => i===blocoIdx ? { ...b, perguntas: b.perguntas.filter((_,j)=>j!==qi).map((p,j)=>({...p,ordem:j+1})) } : b);
    saveBlocos(novos);
    showToast('Pergunta removida.');
  };

  const moverCima = (qi) => {
    if (qi===0) return;
    const ps = [...bloco.perguntas];
    [ps[qi-1],ps[qi]] = [ps[qi],ps[qi-1]];
    const novos = blocos.map((b,i) => i===blocoIdx ? {...b,perguntas:ps.map((p,j)=>({...p,ordem:j+1}))} : b);
    saveBlocos(novos);
  };

  const moverBaixo = (qi) => {
    if (qi>=bloco.perguntas.length-1) return;
    const ps = [...bloco.perguntas];
    [ps[qi],ps[qi+1]] = [ps[qi+1],ps[qi]];
    const novos = blocos.map((b,i) => i===blocoIdx ? {...b,perguntas:ps.map((p,j)=>({...p,ordem:j+1}))} : b);
    saveBlocos(novos);
  };

  const renomearBloco = (val) => {
    const novos = blocos.map((b,i) => i===blocoIdx ? {...b,nome:val} : b);
    saveBlocos(novos);
  };

  const addBloco = () => {
    const novo = { id:'b'+Date.now(), nome:`Bloco 0${blocos.length+1} — Novo`, descricao:'', cor:'#6B3FA0', visita:blocos.length+1, perguntas:[] };
    saveBlocos([...blocos, novo]);
    setBlocoIdx(blocos.length);
    showToast('Novo bloco criado!');
  };

  const TIPO_MAP = { single:'Seleção única', multi:'Múltipla escolha', discursiva:'Discursiva', simnao:'Sim/Não', foto:'Foto', slider:'Slider/%', numero:'Número' };
  const TIPO_COR = { single:'#1B3A6D', multi:'#1A7F3C', discursiva:'#5C667A', simnao:'#B8740A', foto:'#E31E24', slider:'#6B3FA0', numero:'#0F766E' };

  return (
    <WebShell>
      {/* SIDEBAR */}
      <aside style={{ width: 220, background: '#122748', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: 'white' }}>Filtros Brasil</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>Editor de Blocos</div>
        </div>
        <div style={{ padding: '12px 10px', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.08em', padding: '0 4px 8px' }}>Blocos</div>
          {blocos.map((b,i) => (
            <div key={b.id} onClick={() => setBlocoIdx(i)} style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', margin: '1px 0', borderRadius: 8, cursor: 'pointer',
              background: i===blocoIdx ? 'var(--red)' : 'transparent',
              color: i===blocoIdx ? 'white' : 'rgba(255,255,255,.55)', fontSize: 13, fontWeight: 500, transition: 'all .15s',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: i===blocoIdx?'rgba(255,255,255,.6)':b.cor, flexShrink: 0 }} />
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.nome.split('—')[0].trim()}</span>
              <span style={{ fontSize: 10, background: 'rgba(255,255,255,.15)', padding: '1px 6px', borderRadius: 10 }}>{b.perguntas.length}</span>
            </div>
          ))}
          <button onClick={addBloco} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 12px', borderRadius: 8, border: '1px dashed rgba(255,255,255,.2)', background: 'transparent', color: 'rgba(255,255,255,.4)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)', marginTop: 6, width: '100%' }}>
            + Novo bloco
          </button>
        </div>
        <div style={{ padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,.07)' }}>
          <div style={{ fontSize: 13, color: 'white', fontWeight: 500, marginBottom: 4 }}>{usuario?.nome?.split(' ')[0]}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 10 }}>{usuario?.perfil === 'admin' ? 'Administrador' : 'Gestor'}</div>
          <button onClick={() => navegar('gestor-dashboard')} style={{ width: '100%', padding: '7px', border: '1px solid rgba(255,255,255,.15)', borderRadius: 7, background: 'transparent', color: 'rgba(255,255,255,.55)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)', marginBottom: 6 }}>← Dashboard</button>
          <button onClick={logout} style={{ width: '100%', padding: '7px', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, background: 'transparent', color: 'rgba(255,255,255,.35)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)' }}>Sair</button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{ height: 54, background: 'white', borderBottom: '.5px solid var(--g200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input value={bloco?.nome||''} onChange={e=>renomearBloco(e.target.value)} style={{ fontSize: 15, fontWeight: 600, border: 'none', outline: 'none', fontFamily: 'var(--font)', color: 'var(--g800)', background: 'transparent', minWidth: 300 }} />
            <Badge variant="navy">{bloco?.perguntas?.length} perguntas</Badge>
            <Badge variant="gray">{bloco?.perguntas?.filter(q=>q.obrigatorio).length} obrigatórias</Badge>
          </div>
          <Btn variant="green" size="sm" onClick={() => showToast('Blocos salvos com sucesso!')}>✓ Salvar</Btn>
        </div>

        {/* Conteúdo */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Formulário adicionar */}
          <Card>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '.06em', paddingBottom: 10, borderBottom: '2px solid var(--red)', marginBottom: 14 }}>+ Adicionar pergunta</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 1fr auto', gap: 10, marginBottom: 12 }}>
              <Input label="Texto da pergunta *" value={novoTexto} onChange={setNovoTexto} placeholder="Ex: Quais marcas o PDV trabalha?" />
              <Select label="Tipo *" value={novaTipo} onChange={v=>{setNovaTipo(v);setNovoOpcoes('');}} options={TIPOS_PERGUNTA} />
              <Input label={temOpcoes?'Opções (separadas por ;)':'Opções (não aplicável)'} value={novoOpcoes} onChange={setNovoOpcoes} placeholder={temOpcoes?'Ex: Opção A;Opção B':'—'} disabled={!temOpcoes} />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8 }}>
                <Toggle value={novoObrig} onChange={setNovoObrig} label="Obrigatória" />
                <Btn onClick={addPergunta} size="sm">+ Adicionar</Btn>
              </div>
            </div>
            {temOpcoes && <div style={{ fontSize: 11, color: 'var(--g400)' }}>💡 Separe as opções com ponto-e-vírgula: <code>Sim;Não;Talvez</code></div>}
          </Card>

          {/* Tabela */}
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '.5px solid var(--g100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Perguntas do bloco</div>
              <div style={{ fontSize: 12, color: 'var(--g400)' }}>{bloco?.perguntas?.length} perguntas · arraste para reordenar</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--g50)' }}>
                  {['Ordem','Pergunta','Tipo','Opções','Obrig.','Ações'].map(h => (
                    <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '.5px solid var(--g100)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bloco?.perguntas?.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--g400)', fontSize: 13 }}>Nenhuma pergunta ainda. Use o formulário acima para adicionar.</td></tr>
                )}
                {bloco?.perguntas?.map((q, qi) => (
                  <tr key={q.id} style={{ borderBottom: '.5px solid var(--g100)' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--g50)'}
                    onMouseLeave={e=>e.currentTarget.style.background='white'}>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--g400)', fontWeight: 600 }}>{q.ordem}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500, color: 'var(--g800)', maxWidth: 280 }}>{q.texto}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: (TIPO_COR[q.tipo]||'#666')+'20', color: TIPO_COR[q.tipo]||'#666' }}>
                        {TIPO_MAP[q.tipo]||q.tipo}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--g400)', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {q.opcoes ? q.opcoes.replace(/;/g,' · ') : '—'}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: q.obrigatorio?'var(--green)':'var(--g200)', margin: '0 auto' }} />
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[['↑',()=>moverCima(qi),qi===0],['↓',()=>moverBaixo(qi),qi===bloco.perguntas.length-1]].map(([lbl,fn,dis]) => (
                          <button key={lbl} onClick={fn} disabled={dis} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'transparent', cursor: dis?'default':'pointer', color: dis?'var(--g200)':'var(--navy)', fontSize: 13, opacity: dis?.4:1 }}>{lbl}</button>
                        ))}
                        <button onClick={() => removerPergunta(qi)} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--g400)', fontSize: 13, transition: 'all .15s' }}
                          onMouseEnter={e=>{e.target.style.background='var(--red-light)';e.target.style.color='var(--red)'}}
                          onMouseLeave={e=>{e.target.style.background='transparent';e.target.style.color='var(--g400)'}}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </WebShell>
  );
}
