// ─── USUÁRIOS ───
export const USUARIOS = {
  'ednilson.silva@filtrosbrasil.com.br':  { nome: 'Ednilson Silva',     perfil: 'gestor',         iniciais: 'ES', senha: '123456' },
  'jackeline@filtrosbrasil.com.br': { nome: 'Jackeline Brandani', perfil: 'promotora',      iniciais: 'JB', senha: '123456' },
  'nayanne@filtrosbrasil.com.br':   { nome: 'Nayanne Cristina',   perfil: 'promotora',      iniciais: 'NK', senha: '123456' },
  'roberto@filtrosbrasil.com.br':   { nome: 'Roberto Almeida',    perfil: 'representante',  iniciais: 'RA', senha: '123456' },
  'admin@filtrosbrasil.com.br':     { nome: 'Administrador',      perfil: 'admin',          iniciais: 'AD', senha: '123456' },
};

// ─── BLOCOS JUNTOU GANHOU ───
export const BLOCOS_INICIAL = [
  {
    id: 'b01', nome: 'Bloco 01 — Primeira Visita',
    descricao: 'Registrar a primeira visita da promotoria ao PDV',
    cor: '#1B3A6D', visita: 1,
    perguntas: [
      { id: 'q1', ordem: 1, tipo: 'multi',      texto: 'Quais distribuidoras o PDV atende?',         opcoes: 'Filtros Brasil;Wega;Bosch;Mann Filter;Outra', obrigatorio: true,  condicional: false },
      { id: 'q2', ordem: 2, tipo: 'simnao',     texto: 'O responsável está presente?',               opcoes: '', obrigatorio: true,  condicional: false },
      { id: 'q3', ordem: 3, tipo: 'single',     texto: 'Interesse no programa Juntou Ganhou?',       opcoes: 'Sim, muito interesse;Talvez;Não no momento', obrigatorio: true,  condicional: false },
      { id: 'q4', ordem: 4, tipo: 'foto',       texto: 'Registre a fachada do PDV',                  opcoes: '', obrigatorio: true,  condicional: false },
      { id: 'q5', ordem: 5, tipo: 'discursiva', texto: 'Observações sobre a visita',                 opcoes: '', obrigatorio: false, condicional: false },
    ],
  },
  {
    id: 'b02', nome: 'Bloco 02 — Acompanhamento',
    descricao: 'Visita de acompanhamento após adesão ao programa',
    cor: '#1A7F3C', visita: 2,
    perguntas: [
      { id: 'q1', ordem: 1, tipo: 'simnao',  texto: 'PDV aderiu ao programa Juntou Ganhou?',     opcoes: '', obrigatorio: true,  condicional: false },
      { id: 'q2', ordem: 2, tipo: 'single',  texto: 'Exposição dos produtos Filtros Brasil?',    opcoes: 'Destaque principal;Com concorrentes;Sem destaque;Não exposto', obrigatorio: true, condicional: false },
      { id: 'q3', ordem: 3, tipo: 'foto',    texto: 'Registre a exposição dos filtros',          opcoes: '', obrigatorio: true,  condicional: false },
      { id: 'q4', ordem: 4, tipo: 'simnao',  texto: 'Responsável satisfeito com os produtos FB?', opcoes: '', obrigatorio: false, condicional: false },
    ],
  },
  {
    id: 'b03', nome: 'Bloco 03 — Evolução',
    descricao: 'Acompanhamento final da jornada do PDV',
    cor: '#B8740A', visita: 3,
    perguntas: [
      { id: 'q1', ordem: 1, tipo: 'slider',     texto: 'Share estimado Filtros Brasil no PDV?',   opcoes: '0%;10%;20%;30%;40%;50%;60%;70%;80%;90%;100%', obrigatorio: true,  condicional: false },
      { id: 'q2', ordem: 2, tipo: 'multi',      texto: 'Tipos de filtros FB mais vendidos?',      opcoes: 'Filtro de ar;Filtro de óleo;Filtro de combustível;Filtro de cabine', obrigatorio: false, condicional: false },
      { id: 'q3', ordem: 3, tipo: 'numero',     texto: 'Unidades FB vendidas este mês?',          opcoes: '', obrigatorio: false, condicional: false },
      { id: 'q4', ordem: 4, tipo: 'foto',       texto: 'Evidência de venda ou estoque FB',        opcoes: '', obrigatorio: true,  condicional: false },
      { id: 'q5', ordem: 5, tipo: 'discursiva', texto: 'Avaliação final do PDV na jornada',       opcoes: '', obrigatorio: false, condicional: false },
    ],
  },
];

// ─── PDVs DE EXEMPLO ───
export const PDVS_INICIAL = [
  {
    id: 'pdv1', nomeFantasia: 'BERKO Centro Automotivo', razaoSocial: 'Berko Comércio Ltda',
    cnpj: '12.345.678/0001-90', tipo: 'auto-center',
    logradouro: 'Av. Iguaçu, 1234', bairro: 'Água Verde', cidade: 'Curitiba', estado: 'PR', cep: '80420-050',
    telefone: '(41) 3344-2200', email: 'contato@berko.com.br', site: 'www.berko.com.br',
    responsavel: 'Marcos Berko', cargoResponsavel: 'Proprietário',
    lat: -25.4461, lng: -49.2869,
    promotora: 'jackeline@filtrosbrasil.com.br',
    dataCadastro: '2026-03-15', crmStatus: 'cliente',
    visitas: [
      { id: 'v1', data: '2026-03-15', checkinHora: '09:12', checkoutHora: '09:48', blocoId: 'b01', foto: true },
      { id: 'v2', data: '2026-03-22', checkinHora: '10:05', checkoutHora: '10:41', blocoId: 'b02', foto: true },
      { id: 'v3', data: '2026-03-29', checkinHora: '14:20', checkoutHora: '15:02', blocoId: 'b03', foto: true },
    ],
  },
  {
    id: 'pdv2', nomeFantasia: 'Distribuidora Scherer', razaoSocial: 'Scherer Auto Peças ME',
    cnpj: '98.765.432/0001-11', tipo: 'distribuidora',
    logradouro: 'Rua das Hortências, 224', bairro: 'Afonso Pena', cidade: 'São José dos Pinhais', estado: 'PR', cep: '83040-310',
    telefone: '(41) 99823-4421', email: 'carlos@scherer.com.br', site: '',
    responsavel: 'Carlos Scherer', cargoResponsavel: 'Sócio-proprietário',
    lat: -25.5354, lng: -49.2034,
    promotora: 'jackeline@filtrosbrasil.com.br',
    dataCadastro: '2026-03-22', crmStatus: 'lead',
    visitas: [
      { id: 'v1', data: '2026-03-22', checkinHora: '14:12', checkoutHora: '14:38', blocoId: 'b01', foto: true },
    ],
  },
  {
    id: 'pdv3', nomeFantasia: 'Filter Center SJP', razaoSocial: 'Filter Center Ltda',
    cnpj: '11.222.333/0001-44', tipo: 'varejo',
    logradouro: 'Av. das Flores, 89', bairro: 'Centro', cidade: 'São José dos Pinhais', estado: 'PR', cep: '83005-010',
    telefone: '(41) 3382-1100', email: 'regina@filtercenter.com.br', site: '',
    responsavel: 'Regina Souza', cargoResponsavel: 'Gerente',
    lat: -25.5238, lng: -49.2087,
    promotora: 'jackeline@filtrosbrasil.com.br',
    dataCadastro: '2026-03-28', crmStatus: 'lead',
    visitas: [
      { id: 'v1', data: '2026-03-28', checkinHora: '09:30', checkoutHora: '10:05', blocoId: 'b01', foto: true },
    ],
  },
  {
    id: 'pdv4', nomeFantasia: 'Auto Mecânica Romar', razaoSocial: 'Romar Auto ME',
    cnpj: '55.666.777/0001-88', tipo: 'mecanica',
    logradouro: 'R. Marechal Floriano, 12', bairro: 'Centro', cidade: 'Curitiba', estado: 'PR', cep: '80010-120',
    telefone: '(41) 3355-7766', email: 'roberto@romar.com.br', site: '',
    responsavel: 'Roberto Mar', cargoResponsavel: 'Proprietário',
    lat: -25.4284, lng: -49.2733,
    promotora: 'nayanne@filtrosbrasil.com.br',
    dataCadastro: '2026-03-30', crmStatus: 'lead',
    visitas: [],
  },
];

// ─── PROMOTORAS ───
export const PROMOTORAS = [
  { email: 'jackeline@filtrosbrasil.com.br', nome: 'Jackeline Brandani', iniciais: 'JB', cor: '#1B3A6D', regiao: 'Curitiba Sul', metaMes: 64, realizadas: 47 },
  { email: 'nayanne@filtrosbrasil.com.br',   nome: 'Nayanne Cristina',   iniciais: 'NK', cor: '#E31E24', regiao: 'Grande Curitiba', metaMes: 72, realizadas: 58 },
];

// ─── HELPERS ───
export const TIPOS_PDV = [
  { val: 'auto-center',   label: 'Auto Center' },
  { val: 'distribuidora', label: 'Distribuidora' },
  { val: 'mecanica',      label: 'Oficina / Mecânica' },
  { val: 'posto',         label: 'Posto de Combustível' },
  { val: 'varejo',        label: 'Varejo / Loja de Peças' },
  { val: 'atacado',       label: 'Atacado' },
  { val: 'outro',         label: 'Outro' },
];

export const TIPOS_PERGUNTA = [
  { val: 'single',     label: 'Seleção única' },
  { val: 'multi',      label: 'Múltipla escolha' },
  { val: 'discursiva', label: 'Discursiva' },
  { val: 'simnao',     label: 'Sim / Não' },
  { val: 'foto',       label: 'Foto' },
  { val: 'slider',     label: 'Slider / %' },
  { val: 'numero',     label: 'Número' },
];

export function blocoStatus(pdv, blocos) {
  const feitos = (pdv.visitas || []).map(v => v.blocoId);
  return blocos.map(b => ({
    ...b,
    done: feitos.includes(b.id),
    available:
      b.id === 'b01' ? !feitos.includes('b01') :
      b.id === 'b02' ? feitos.includes('b01') && !feitos.includes('b02') :
      feitos.includes('b02') && !feitos.includes('b03'),
  }));
}

export function haversineM(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export function fmtData(iso) {
  if (!iso || iso === '—') return '—';
  const [y, m, d] = iso.split('-');
  const ms = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  return `${d} de ${ms[+m-1]}`;
}

export function nowISO() {
  return new Date().toISOString().split('T')[0];
}

export function nowHora() {
  const n = new Date();
  return n.getHours().toString().padStart(2,'0') + ':' + n.getMinutes().toString().padStart(2,'0');
}
