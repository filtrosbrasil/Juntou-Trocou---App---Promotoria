import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Btn, Input, Select, Card, SectionLabel, DeviceShell, MobileHeader } from '../components/UI.jsx';
import { TIPOS_PDV, nowISO } from '../data/inicial.js';

const ESTADOS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map(e=>({val:e,label:e}));

export default function CadastroPDV() {
  const { usuario, addPdv, navegar, showToast } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nomeFantasia:'', razaoSocial:'', cnpj:'', tipo:'auto-center',
    logradouro:'', numero:'', complemento:'', bairro:'', cidade:'', estado:'PR', cep:'',
    telefone:'', email:'', site:'', instagram:'',
    responsavel:'', cargoResponsavel:'', obs:'', jaClienteFB: false,
  });
  const [erros, setErros] = useState({});

  const set = (campo, val) => { setForm(f=>({...f,[campo]:val})); setErros(e=>({...e,[campo]:''})); };

  const maskCNPJ = v => v.replace(/\D/g,'').replace(/^(\d{2})(\d)/,'$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3').replace(/\.(\d{3})(\d)/,'.$1/$2').replace(/(\d{4})(\d)/,'$1-$2').slice(0,18);
  const maskCEP  = v => { let s=v.replace(/\D/g,''); if(s.length>5) s=s.slice(0,5)+'-'+s.slice(5,8); return s; };
  const maskTel  = v => { let s=v.replace(/\D/g,''); return s.length<=10?s.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3'):s.replace(/(\d{2})(\d{5})(\d{0,4})/,'($1) $2-$3'); };

  const validar1 = () => {
    const e = {};
    if (!form.nomeFantasia.trim()) e.nomeFantasia = 'Campo obrigatório';
    if (!form.cnpj.trim()) e.cnpj = 'Campo obrigatório';
    if (!form.tipo) e.tipo = 'Campo obrigatório';
    setErros(e); return Object.keys(e).length === 0;
  };
  const validar2 = () => {
    const e = {};
    if (!form.cep.trim())       e.cep = 'Campo obrigatório';
    if (!form.logradouro.trim()) e.logradouro = 'Campo obrigatório';
    if (!form.numero.trim())    e.numero = 'Campo obrigatório';
    if (!form.cidade.trim())    e.cidade = 'Campo obrigatório';
    if (!form.estado)           e.estado = 'Campo obrigatório';
    if (!form.telefone.trim())  e.telefone = 'Campo obrigatório';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'E-mail inválido';
    setErros(e); return Object.keys(e).length === 0;
  };
  const validar3 = () => {
    const e = {};
    if (!form.responsavel.trim()) e.responsavel = 'Campo obrigatório';
    setErros(e); return Object.keys(e).length === 0;
  };

  const salvar = () => {
    if (!validar3()) return;
    const novo = {
      id: 'pdv' + Date.now(),
      ...form,
      lat: -25.43 + Math.random()*.05,
      lng: -49.27 + Math.random()*.05,
      promotora: usuario.email,
      dataCadastro: nowISO(),
      crmStatus: form.jaClienteFB ? 'cliente' : 'lead',
      visitas: [],
    };
    addPdv(novo);
    showToast('PDV cadastrado e enviado ao CRM!');
    navegar('promotora-home');
  };

  const STEPS = [
    { label: 'Identificação', titulo: 'Dados da empresa' },
    { label: 'Localização', titulo: 'Endereço e contato' },
    { label: 'Comercial', titulo: 'Perfil comercial' },
  ];

  return (
    <DeviceShell>
      <div style={{ background: 'var(--navy)', padding: '13px 16px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <button onClick={() => step > 1 ? setStep(s=>s-1) : navegar('promotora-home')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.8)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font)' }}>
            {step > 1 ? '← Anterior' : '← Cancelar'}
          </button>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>Passo {step} de 3</span>
        </div>
        <div style={{ color: 'white', fontSize: 17, fontWeight: 600 }}>{STEPS[step-1].titulo}</div>
        <div style={{ color: 'rgba(255,255,255,.55)', fontSize: 12, marginTop: 2 }}>Cadastro de PDV — Juntou Ganhou</div>
        {/* Step dots */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10, justifyContent: 'center' }}>
          {STEPS.map((_,i) => (
            <div key={i} style={{ height: 5, borderRadius: 3, background: i<step?'white':'rgba(255,255,255,.25)', width: i===step-1?18:6, transition: 'all .3s' }} />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* STEP 1 */}
        {step === 1 && (
          <Card>
            <SectionLabel>Dados da empresa</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input label="Nome fantasia" value={form.nomeFantasia} onChange={v=>set('nomeFantasia',v)} placeholder="Ex: Auto Center São Paulo" required error={erros.nomeFantasia} />
              <Input label="Razão social" value={form.razaoSocial} onChange={v=>set('razaoSocial',v)} placeholder="Razão social completa" />
              <Input label="CNPJ" value={form.cnpj} onChange={v=>set('cnpj',maskCNPJ(v))} placeholder="00.000.000/0001-00" required error={erros.cnpj} />
              <Select label="Tipo de estabelecimento" value={form.tipo} onChange={v=>set('tipo',v)} options={TIPOS_PDV} required />
            </div>
          </Card>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <Card>
              <SectionLabel>Endereço</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Input label="CEP" value={form.cep} onChange={v=>set('cep',maskCEP(v))} placeholder="00000-000" required error={erros.cep} />
                <Input label="Logradouro" value={form.logradouro} onChange={v=>set('logradouro',v)} placeholder="Rua, Avenida..." required error={erros.logradouro} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <Input label="Número" value={form.numero} onChange={v=>set('numero',v)} placeholder="Nº" required error={erros.numero} />
                  <Input label="Complemento" value={form.complemento} onChange={v=>set('complemento',v)} placeholder="Sala, Andar..." />
                </div>
                <Input label="Bairro" value={form.bairro} onChange={v=>set('bairro',v)} placeholder="Bairro" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 10 }}>
                  <Input label="Cidade" value={form.cidade} onChange={v=>set('cidade',v)} placeholder="Cidade" required error={erros.cidade} />
                  <Select label="UF" value={form.estado} onChange={v=>set('estado',v)} options={ESTADOS} required />
                </div>
              </div>
            </Card>
            <Card>
              <SectionLabel>Contato</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Input label="Telefone / WhatsApp" value={form.telefone} onChange={v=>set('telefone',maskTel(v))} placeholder="(00) 00000-0000" required error={erros.telefone} />
                <Input label="E-mail" value={form.email} onChange={v=>set('email',v)} placeholder="contato@empresa.com.br" type="email" required error={erros.email} />
                <Input label="Site" value={form.site} onChange={v=>set('site',v)} placeholder="www.empresa.com.br" />
                <Input label="Instagram" value={form.instagram} onChange={v=>set('instagram',v)} placeholder="@perfil" />
              </div>
            </Card>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <Card>
              <SectionLabel>Responsável</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Input label="Nome do responsável / comprador" value={form.responsavel} onChange={v=>set('responsavel',v)} placeholder="Nome completo" required error={erros.responsavel} />
                <Input label="Cargo" value={form.cargoResponsavel} onChange={v=>set('cargoResponsavel',v)} placeholder="Ex: Proprietário, Gerente..." />
              </div>
            </Card>
            <Card>
              <SectionLabel>Perfil comercial</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Já é cliente Filtros Brasil?</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[['Sim',true],['Não',false],['Já foi','antigo']].map(([lbl,val]) => (
                      <button key={lbl} onClick={()=>set('jaClienteFB',val)} style={{ padding: '8px 14px', borderRadius: 20, border: `1.5px solid ${form.jaClienteFB===val?'var(--navy)':'var(--g200)'}`, background: form.jaClienteFB===val?'var(--navy-light)':'white', color: form.jaClienteFB===val?'var(--navy)':'var(--g600)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font)' }}>{lbl}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 5 }}>Observações para o CRM</label>
                  <textarea value={form.obs} onChange={e=>set('obs',e.target.value)} placeholder="Informações relevantes para o time comercial..." rows={3} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--g200)', borderRadius: 9, fontFamily: 'var(--font)', fontSize: 13, resize: 'none', outline: 'none' }} />
                </div>
              </div>
            </Card>
            <Card style={{ background: 'var(--navy-light)', borderColor: 'var(--navy-mid)' }}>
              <div style={{ fontSize: 13, color: 'var(--navy)', lineHeight: 1.5 }}>
                ✓ Ao salvar, este PDV será cadastrado como <strong>{form.jaClienteFB===true?'cliente':'lead'}</strong> no CRM Filtros Brasil.
              </div>
            </Card>
          </>
        )}

        {/* Botão avançar/salvar */}
        {step < 3
          ? <Btn size="full" onClick={() => { if(step===1&&!validar1()) return; if(step===2&&!validar2()) return; setStep(s=>s+1); }}>Continuar →</Btn>
          : <Btn size="full" variant="green" onClick={salvar}>✓ Salvar e enviar ao CRM</Btn>
        }
      </div>
    </DeviceShell>
  );
}
