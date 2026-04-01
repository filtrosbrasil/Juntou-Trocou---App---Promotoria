import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Btn, Badge, Card, SectionLabel, ProgressBar, MobileHeader, BottomNav, DeviceShell } from '../components/UI.jsx';
import { blocoStatus, haversineM, fmtData, nowISO, nowHora } from '../data/inicial.js';

const RAIO_M = 50;

export default function PromotoraApp() {
  const { usuario, pdvs, blocos, navegar, addPdv, addVisita, showToast, logout } = useApp();
  const [tela, setTela]           = useState('home');
  const [pdvAtual, setPdvAtual]   = useState(null);
  const [blocoAtual, setBlocoAtual] = useState(null);
  const [checkinFeito, setCheckinFeito] = useState(false);
  const [checkinHora, setCheckinHora]   = useState(null);
  const [gpsLat, setGpsLat]   = useState(null);
  const [gpsLng, setGpsLng]   = useState(null);
  const [gpsDist, setGpsDist] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | buscando | ok | erro | fora
  const [qAtual, setQAtual]     = useState(0);
  const [respostas, setRespostas] = useState({});
  const [fotoFeita, setFotoFeita] = useState(false);
  const [visitaAtiva, setVisitaAtiva] = useState(null);
  const [timerSec, setTimerSec] = useState(0);

  const meusPdvs = pdvs.filter(p => p.promotora === usuario?.email);

  // Timer da visita
  useEffect(() => {
    if (!checkinFeito) return;
    const t = setInterval(() => setTimerSec(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [checkinFeito]);

  const fmtTimer = () => {
    const m = Math.floor(timerSec / 60).toString().padStart(2,'0');
    const s = (timerSec % 60).toString().padStart(2,'0');
    return `${m}:${s}`;
  };

  // ─── GPS ───
  const obterGPS = () => {
    setGpsStatus('buscando');
    if (!navigator.geolocation) {
      simularGPS(); return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => processarGPS(pos.coords.latitude, pos.coords.longitude, false),
      () => simularGPS(),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const simularGPS = () => {
    if (!pdvAtual) return;
    const lat = pdvAtual.lat + 0.00025;
    const lng = pdvAtual.lng + 0.00025;
    processarGPS(lat, lng, true);
  };

  const processarGPS = (lat, lng, simulado) => {
    setGpsLat(lat); setGpsLng(lng);
    const dist = haversineM(lat, lng, pdvAtual.lat, pdvAtual.lng);
    setGpsDist(Math.round(dist));
    setGpsStatus(dist <= RAIO_M ? 'ok' : 'fora');
    if (simulado && dist <= RAIO_M) showToast('GPS simulado para demonstração', 'ok');
  };

  // ─── CHECK-IN ───
  const fazerCheckin = () => {
    setCheckinFeito(true);
    setCheckinHora(nowHora());
    setTimerSec(0);
    const v = { id: 'v'+Date.now(), data: nowISO(), checkinHora: nowHora(), checkoutHora: null, blocoId: null, foto: false };
    setVisitaAtiva(v);
    showToast('Check-in realizado com sucesso!');
    setTela('dashboard-pdv');
  };

  const fazerCheckout = () => {
    if (visitaAtiva && visitaAtiva.blocoId) {
      addVisita(pdvAtual.id, { ...visitaAtiva, checkoutHora: nowHora() });
    }
    setCheckinFeito(false); setVisitaAtiva(null); setTimerSec(0);
    showToast('Check-out registrado.');
    setTela('dashboard-pdv');
  };

  // ─── ABRIR PDV ───
  const abrirPDV = (pdv) => {
    setPdvAtual(pdv);
    setCheckinFeito(false); setGpsStatus('idle'); setGpsDist(null);
    setTela('dashboard-pdv');
  };

  // ─── ABRIR BLOCO ───
  const abrirBloco = (bloco) => {
    setBlocoAtual(bloco); setQAtual(0); setRespostas({}); setFotoFeita(false);
    setTela('questionario');
  };

  // ─── FINALIZAR BLOCO ───
  const finalizarBloco = () => {
    const hora = nowHora();
    const visita = {
      id: visitaAtiva?.id || 'v'+Date.now(),
      data: nowISO(), checkinHora: checkinHora || hora,
      checkoutHora: hora, blocoId: blocoAtual.id, foto: fotoFeita,
    };
    addVisita(pdvAtual.id, visita);
    setCheckinFeito(false); setVisitaAtiva(null); setTimerSec(0);
    showToast(`${blocoAtual.nome.split('—')[0].trim()} respondido!`);
    setTela('resumo-bloco');
  };

  const bs = pdvAtual ? blocoStatus(pdvAtual, blocos) : [];

  // ─── RENDER TELAS ───
  const renderTela = () => {
    switch (tela) {

      // HOME
      case 'home': return (
        <DeviceShell>
          <div style={{ background: 'var(--navy)', padding: '14px 16px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 12 }}>Bom dia 👋</div>
                <div style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>{usuario?.nome?.split(' ')[0]}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 600 }}>{usuario?.iniciais}</div>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[
                { num: meusPdvs.length, lbl: 'PDVs', cor: 'var(--navy)' },
                { num: meusPdvs.filter(p=>p.visitas.length>0).length, lbl: 'Visitados', cor: 'var(--green)' },
                { num: meusPdvs.filter(p=>p.visitas.length===0).length, lbl: 'Pendentes', cor: 'var(--red)' },
              ].map(s => (
                <Card key={s.lbl} style={{ textAlign: 'center', padding: '12px 8px' }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: s.cor }}>{s.num}</div>
                  <div style={{ fontSize: 10, color: 'var(--g400)', marginTop: 2 }}>{s.lbl}</div>
                </Card>
              ))}
            </div>

            {/* PDVs */}
            <Card>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Minha carteira de PDVs</div>
              {meusPdvs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--g400)', fontSize: 13 }}>Nenhum PDV cadastrado ainda</div>
              )}
              {meusPdvs.map((p, i) => {
                const bs2 = blocoStatus(p, blocos);
                const done = bs2.filter(b => b.done).length;
                const statusVar = done === 3 ? 'green' : done === 0 ? 'gray' : 'navy';
                const statusLabel = done === 3 ? 'Completo' : done === 0 ? 'Sem visitas' : `${done}/3 blocos`;
                return (
                  <div key={p.id} onClick={() => abrirPDV(p)} style={{
                    display: 'flex', alignItems: 'center', gap: 11,
                    padding: '11px 0', borderBottom: i < meusPdvs.length-1 ? '.5px solid var(--g100)' : 'none',
                    cursor: 'pointer',
                  }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--navy-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>🏪</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--g800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nomeFantasia}</div>
                      <div style={{ fontSize: 12, color: 'var(--g400)', marginTop: 1 }}>{p.cidade}, {p.estado}</div>
                      <div style={{ marginTop: 4 }}><Badge variant={statusVar}>{statusLabel}</Badge></div>
                    </div>
                    <span style={{ color: 'var(--g200)', fontSize: 18 }}>›</span>
                  </div>
                );
              })}
            </Card>

            <Btn size="full" variant="red" onClick={() => navegar('cadastro-pdv')}>+ Cadastrar novo PDV</Btn>
            <Btn size="full" variant="outline" onClick={logout} style={{ fontSize: 12 }}>Sair</Btn>
          </div>
          <BottomNav items={[
            { id: 'home', label: 'Início', icon: '🏠', active: true, onClick: () => setTela('home') },
            { id: 'pdvs', label: 'PDVs', icon: '🏪', onClick: () => setTela('home') },
            { id: 'perfil', label: 'Perfil', icon: '👤', onClick: () => {} },
          ]} />
        </DeviceShell>
      );

      // DASHBOARD DO PDV
      case 'dashboard-pdv': return pdvAtual ? (
        <DeviceShell>
          <MobileHeader title={pdvAtual.nomeFantasia} subtitle={`${pdvAtual.cidade}, ${pdvAtual.estado}`} onBack={() => setTela('home')} backLabel="Meus PDVs" />
          <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
            {/* Info PDV */}
            <Card>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Informações</div>
              {[
                ['Responsável', pdvAtual.responsavel],
                ['Telefone', pdvAtual.telefone],
                ['Endereço', `${pdvAtual.logradouro}, ${pdvAtual.cidade}`],
                ['CNPJ', pdvAtual.cnpj],
              ].map(([k,v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '.5px solid var(--g50)', fontSize: 13 }}>
                  <span style={{ color: 'var(--g400)' }}>{k}</span>
                  <span style={{ fontWeight: 500, color: 'var(--g800)', textAlign: 'right', maxWidth: '60%' }}>{v}</span>
                </div>
              ))}
            </Card>

            {/* Check-in / checkout */}
            <Card>
              {!checkinFeito ? (
                <Btn size="full" onClick={() => { setGpsStatus('idle'); setTela('checkin'); }}>
                  📍 Fazer check-in
                </Btn>
              ) : (
                <>
                  <div style={{ background: 'var(--green-light)', border: '1.5px solid var(--green)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>✅</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>Check-in realizado — {checkinHora}</div>
                      <div style={{ fontSize: 11, color: 'var(--green)', opacity: .7 }}>GPS confirmado · {gpsDist !== null ? `${gpsDist}m do PDV` : ''} · {fmtTimer()}</div>
                    </div>
                  </div>
                  <Btn size="full" variant="outline" onClick={fazerCheckout} style={{ fontSize: 13 }}>Registrar check-out</Btn>
                </>
              )}
            </Card>

            {/* Blocos */}
            <Card>
              <SectionLabel>Blocos Juntou Ganhou</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {bs.map(b => (
                  <div key={b.id} onClick={b.available && checkinFeito ? () => abrirBloco(b) : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                      borderRadius: 10, border: `.5px solid ${b.done ? 'var(--green)' : 'var(--g200)'}`,
                      background: b.done ? 'var(--green-light)' : 'white',
                      cursor: b.available && checkinFeito ? 'pointer' : 'default',
                      opacity: !b.done && !b.available ? .6 : 1,
                    }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: b.done ? 'var(--green)' : b.available && checkinFeito ? 'var(--navy)' : 'var(--g100)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, fontWeight: 700, color: b.done || (b.available && checkinFeito) ? 'white' : 'var(--g400)',
                    }}>{b.done ? '✓' : b.id.slice(-1)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: b.done ? 'var(--green)' : 'var(--g800)' }}>{b.label || b.nome}</div>
                      <div style={{ fontSize: 12, color: 'var(--g400)', marginTop: 2 }}>
                        {b.done ? 'Concluído' :
                         b.available && checkinFeito ? 'Toque para responder' :
                         !checkinFeito ? 'Faça check-in para desbloquear' :
                         'Complete o bloco anterior primeiro'}
                      </div>
                    </div>
                    <Badge variant={b.done ? 'green' : b.available && checkinFeito ? 'navy' : 'gray'}>
                      {b.done ? 'Feito' : b.available && checkinFeito ? 'Disponível' : 'Bloqueado'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Histórico */}
            <Card>
              <SectionLabel>Histórico de visitas</SectionLabel>
              {pdvAtual.visitas.length === 0 && <div style={{ fontSize: 13, color: 'var(--g400)', textAlign: 'center', padding: '12px 0' }}>Sem visitas registradas</div>}
              {[...pdvAtual.visitas].reverse().map((v, i, arr) => {
                const bdef = blocos.find(b => b.id === v.blocoId);
                return (
                  <div key={v.id} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: i < arr.length-1 ? '.5px solid var(--g100)' : 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
                      {i < arr.length-1 && <div style={{ width: 1, flex: 1, background: 'var(--g100)', marginTop: 4 }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--g800)' }}>{bdef?.nome?.split('—')[0].trim() || v.blocoId} — {fmtData(v.data)}</div>
                      <div style={{ fontSize: 11, color: 'var(--g400)', marginTop: 2 }}>Check-in {v.checkinHora} · Check-out {v.checkoutHora || '—'} {v.foto ? '· 📷' : ''}</div>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        </DeviceShell>
      ) : null;

      // CHECK-IN
      case 'checkin': return pdvAtual ? (
        <DeviceShell>
          <MobileHeader title={pdvAtual.nomeFantasia} subtitle="Validação de presença" onBack={() => setTela('dashboard-pdv')} backLabel="PDV" />
          <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
            {/* Mapa placeholder */}
            <div style={{ background: 'var(--navy-light)', borderRadius: 10, height: 150, position: 'relative', overflow: 'hidden', border: '.5px solid var(--navy-mid)' }}>
              {[25,50,75].map(p => <div key={p} style={{ position: 'absolute', width: '100%', height: .5, background: 'rgba(27,58,109,.1)', top: `${p}%` }} />)}
              {[33,66].map(p => <div key={p} style={{ position: 'absolute', height: '100%', width: .5, background: 'rgba(27,58,109,.1)', left: `${p}%` }} />)}
              <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: 'var(--red)', border: '2px solid white', transform: 'translate(-50%,-50%)', top: '35%', left: '52%', boxShadow: '0 0 0 3px rgba(227,30,36,.2)' }} />
              {gpsLat && <div style={{ position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: 'var(--navy)', border: '2px solid white', transform: 'translate(-50%,-50%)', top: gpsStatus === 'ok' ? '42%' : '65%', left: '52%', boxShadow: '0 0 0 4px rgba(27,58,109,.2)' }} />}
              <div style={{ position: 'absolute', top: 8, left: 8, background: 'var(--navy)', color: 'white', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6 }}>GPS</div>
              {gpsDist !== null && <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'white', color: gpsStatus === 'ok' ? 'var(--green)' : 'var(--red)', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, border: '.5px solid var(--g200)' }}>{gpsDist}m</div>}
            </div>

            {/* Status GPS */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: gpsStatus === 'ok' ? 'var(--green)' : gpsStatus === 'buscando' ? 'var(--amber)' : gpsStatus === 'fora' || gpsStatus === 'erro' ? 'var(--red)' : 'var(--g400)', animation: gpsStatus === 'buscando' ? 'gpsPulse 1.2s ease infinite' : 'none' }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: gpsStatus === 'ok' ? 'var(--green)' : gpsStatus === 'buscando' ? 'var(--amber)' : 'var(--red)' }}>
                  {gpsStatus === 'idle'    ? 'Aguardando GPS...' :
                   gpsStatus === 'buscando'? 'Obtendo localização...' :
                   gpsStatus === 'ok'      ? `Dentro do raio · ${gpsDist}m do PDV` :
                   gpsStatus === 'fora'    ? `Fora do raio — ${gpsDist}m do PDV` :
                   'Erro ao obter GPS'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--g400)' }}>
                {pdvAtual.logradouro}, {pdvAtual.cidade} · Raio: <strong>50 metros</strong>
              </div>
            </Card>

            {/* Alerta */}
            {gpsStatus === 'fora' && (
              <div style={{ background: 'var(--red-light)', border: '1px solid #F5B3B3', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#8B1215' }}>
                Você está a <strong>{gpsDist}m</strong> do PDV. O check-in requer presença física no local (máximo 50m).
              </div>
            )}
            {gpsStatus === 'ok' && (
              <div style={{ background: 'var(--navy-light)', border: '1px solid var(--navy-mid)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: 'var(--navy)' }}>
                ✓ Você está a <strong>{gpsDist}m</strong> do PDV. Check-in liberado!
              </div>
            )}

            {/* Botões */}
            {gpsStatus === 'idle' && <Btn size="full" onClick={obterGPS}>📡 Obter localização</Btn>}
            {(gpsStatus === 'erro' || gpsStatus === 'fora' || gpsStatus === 'buscando') && (
              <Btn size="full" variant="outline" onClick={obterGPS}>↺ Tentar novamente</Btn>
            )}
            {gpsStatus === 'ok' && (
              <Btn size="full" variant="green" onClick={fazerCheckin}>📍 Confirmar check-in</Btn>
            )}
          </div>
        </DeviceShell>
      ) : null;

      // QUESTIONÁRIO
      case 'questionario': return blocoAtual ? (() => {
        const pergs = blocoAtual.perguntas;
        const total = pergs.length;
        const q = pergs[qAtual];
        const pct = Math.round(((qAtual+1)/total)*100);
        const opcoes = q.opcoes ? q.opcoes.split(';').filter(Boolean) : [];

        const selSingle = (i) => {
          setRespostas(prev => ({...prev, [qAtual]: i}));
          if (qAtual < total - 1) setTimeout(() => setQAtual(a => a+1), 280);
        };
        const togMulti = (i) => {
          setRespostas(prev => {
            const cur = prev[qAtual] || [];
            return {...prev, [qAtual]: cur.includes(i) ? cur.filter(x=>x!==i) : [...cur,i]};
          });
        };

        return (
          <DeviceShell>
            <div style={{ background: 'var(--navy)', padding: '13px 16px 14px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <button onClick={() => qAtual > 0 ? setQAtual(a=>a-1) : setTela('dashboard-pdv')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.8)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                  ← {qAtual === 0 ? 'PDV' : 'Anterior'}
                </button>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>{qAtual+1}/{total}</span>
              </div>
              <div style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>{blocoAtual.nome?.split('—')[0].trim()}</div>
              <div style={{ color: 'rgba(255,255,255,.55)', fontSize: 11, marginTop: 2 }}>{pdvAtual?.nomeFantasia}</div>
              <div style={{ height: 4, background: 'rgba(255,255,255,.2)', borderRadius: 2, overflow: 'hidden', marginTop: 10 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'var(--red)', borderRadius: 2, transition: 'width .4s' }} />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--g800)', lineHeight: 1.45 }}>{q.texto}</div>
              {q.obrigatorio && <span style={{ fontSize: 10, color: 'var(--red)', fontWeight: 600 }}>* Obrigatória</span>}
              {q.dica && <div style={{ fontSize: 12, color: 'var(--g400)' }}>{q.dica}</div>}

              {/* Single */}
              {q.tipo === 'single' && opcoes.map((op, i) => (
                <button key={i} onClick={() => selSingle(i)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 13px',
                  border: `${respostas[qAtual]===i?'1.5px solid var(--navy)':'.5px solid var(--g200)'}`,
                  borderRadius: 10, cursor: 'pointer', background: respostas[qAtual]===i?'var(--navy-light)':'white',
                  color: respostas[qAtual]===i?'var(--navy)':'var(--g800)', fontWeight: respostas[qAtual]===i?600:400,
                  fontSize: 14, fontFamily: 'var(--font)', textAlign: 'left', transition: 'all .15s',
                }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${respostas[qAtual]===i?'var(--navy)':'var(--g200)'}`, flexShrink: 0, background: respostas[qAtual]===i?'var(--navy)':'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {respostas[qAtual]===i && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  {op}
                </button>
              ))}

              {/* Multi */}
              {q.tipo === 'multi' && opcoes.map((op, i) => {
                const sel = (respostas[qAtual]||[]).includes(i);
                return (
                  <button key={i} onClick={() => togMulti(i)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 13px',
                    border: `${sel?'1.5px solid var(--navy)':'.5px solid var(--g200)'}`,
                    borderRadius: 10, cursor: 'pointer', background: sel?'var(--navy-light)':'white',
                    color: sel?'var(--navy)':'var(--g800)', fontWeight: sel?600:400,
                    fontSize: 14, fontFamily: 'var(--font)', textAlign: 'left', transition: 'all .15s',
                  }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${sel?'var(--navy)':'var(--g200)'}`, flexShrink: 0, background: sel?'var(--navy)':'white' }}>
                      {sel && <span style={{ display: 'block', textAlign: 'center', color: 'white', fontSize: 11, lineHeight: '16px' }}>✓</span>}
                    </div>
                    {op}
                  </button>
                );
              })}

              {/* Sim/Não */}
              {q.tipo === 'simnao' && ['Sim','Não'].map((op, i) => (
                <button key={op} onClick={() => selSingle(i)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 13px',
                  border: `${respostas[qAtual]===i?'1.5px solid var(--navy)':'.5px solid var(--g200)'}`,
                  borderRadius: 10, cursor: 'pointer', background: respostas[qAtual]===i?'var(--navy-light)':'white',
                  color: respostas[qAtual]===i?'var(--navy)':'var(--g800)', fontWeight: respostas[qAtual]===i?600:400,
                  fontSize: 15, fontFamily: 'var(--font)', transition: 'all .15s',
                }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${respostas[qAtual]===i?'var(--navy)':'var(--g200)'}`, flexShrink: 0, background: respostas[qAtual]===i?'var(--navy)':'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {respostas[qAtual]===i && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  {op}
                </button>
              ))}

              {/* Foto */}
              {q.tipo === 'foto' && (
                <div onClick={() => { setFotoFeita(true); setRespostas(prev=>({...prev,[qAtual]:'foto'})); }}
                  style={{ border: `1.5px dashed ${fotoFeita?'var(--green)':'var(--g200)'}`, borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer', background: fotoFeita?'var(--green-light)':'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: fotoFeita?'var(--green-light)':'var(--navy-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📷</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: fotoFeita?'var(--green)':'var(--g600)' }}>{fotoFeita?'✓ Foto registrada':'Toque para fotografar'}</div>
                  <div style={{ fontSize: 11, color: 'var(--g400)' }}>{q.dica || 'Câmera / galeria'}</div>
                </div>
              )}

              {/* Slider */}
              {q.tipo === 'slider' && (() => {
                const val = respostas[qAtual] !== undefined ? respostas[qAtual] : 30;
                return (
                  <div style={{ padding: '0 4px' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)', textAlign: 'center', marginBottom: 10 }}>{val}%</div>
                    <input type="range" min={0} max={100} step={5} value={val}
                      onChange={e => setRespostas(prev => ({...prev,[qAtual]:+e.target.value}))}
                      style={{ width: '100%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--g400)', marginTop: 4 }}>
                      <span>0%</span><span>50%</span><span>100%</span>
                    </div>
                  </div>
                );
              })()}

              {/* Número */}
              {q.tipo === 'numero' && (
                <input type="number" value={respostas[qAtual]||''} onChange={e => setRespostas(prev=>({...prev,[qAtual]:e.target.value}))}
                  placeholder="Digite um número..." style={{ width: '100%', padding: '12px', border: '1.5px solid var(--g200)', borderRadius: 10, fontSize: 16, textAlign: 'center', fontFamily: 'var(--font)', outline: 'none' }} />
              )}

              {/* Discursiva */}
              {q.tipo === 'discursiva' && (
                <textarea value={respostas[qAtual]||''} onChange={e => setRespostas(prev=>({...prev,[qAtual]:e.target.value}))}
                  placeholder={q.dica || 'Digite sua resposta...'} rows={4}
                  style={{ width: '100%', padding: '11px 12px', border: '1.5px solid var(--g200)', borderRadius: 10, fontSize: 14, fontFamily: 'var(--font)', resize: 'none', outline: 'none' }} />
              )}

              {/* Nav */}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {qAtual > 0 && <button onClick={() => setQAtual(a=>a-1)} style={{ padding: '12px 14px', border: '.5px solid var(--g200)', borderRadius: 10, background: 'white', color: 'var(--g600)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font)' }}>←</button>}
                {qAtual < total - 1
                  ? <Btn size="full" onClick={() => setQAtual(a=>a+1)}>Próxima →</Btn>
                  : <Btn size="full" variant="green" onClick={finalizarBloco}>Finalizar ✓</Btn>
                }
              </div>
            </div>
          </DeviceShell>
        );
      })() : null;

      // RESUMO BLOCO
      case 'resumo-bloco': return (
        <DeviceShell>
          <MobileHeader title="Visita concluída" subtitle={pdvAtual?.nomeFantasia} />
          <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '24px 0' }}>
              <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, animation: 'popIn .4s cubic-bezier(.34,1.56,.64,1) both' }}>✅</div>
              <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--g800)', textAlign: 'center' }}>{blocoAtual?.nome?.split('—')[0].trim()} registrado!</div>
              <div style={{ fontSize: 13, color: 'var(--g400)', textAlign: 'center', lineHeight: 1.6 }}>
                {bs.every(b=>b.done) ? 'Jornada completa! Os 3 blocos foram respondidos.' : 'Retorne ao PDV para a próxima visita.'}
              </div>
            </div>
            <Btn size="full" onClick={() => { setPdvAtual(pdvs.find(p=>p.id===pdvAtual?.id) || pdvAtual); setTela('dashboard-pdv'); }}>← Voltar ao PDV</Btn>
            <Btn size="full" variant="outline" onClick={() => setTela('home')}>Ver todos os PDVs</Btn>
          </div>
        </DeviceShell>
      );

      default: return null;
    }
  };

  return renderTela();
}
