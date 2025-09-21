import { User, Category, Question, UserRole, UserStatus } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Paulo',
    companyName: 'Triad3',
    email: 'paulo@triad3.io',
    phone: '11999999999',
    passwordHash: 'triad3',
    role: UserRole.ADMIN,
    status: UserStatus.APPROVED,
  },
  {
    id: 'company-2-approved',
    name: 'Maria Souza',
    companyName: 'Soluções Tech',
    email: 'maria.souza@tech.com',
    phone: '11977777777',
    passwordHash: 'company456',
    role: UserRole.COMPANY,
    status: UserStatus.APPROVED,
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-atendimento', name: 'Atendimento ao Cliente' },
  { id: 'cat-vendas', name: 'Processo de Vendas' },
];

export const INITIAL_QUESTIONS: Question[] = [
  // Atendimento ao Cliente
  {
    id: 'q-atd-1',
    categoryId: 'cat-atendimento',
    text: 'Qual a sua satisfação geral com o nosso atendimento?',
    answers: [
      { id: 'a-1', text: 'Muito Satisfeito', score: 5 },
      { id: 'a-2', text: 'Satisfeito', score: 3 },
      { id: 'a-3', text: 'Indiferente', score: 1 },
      { id: 'a-4', text: 'Insatisfeito', score: 0 },
    ],
    targetRole: UserRole.COMPANY,
  },
  {
    id: 'q-atd-2',
    categoryId: 'cat-atendimento',
    text: 'O agente que te atendeu demonstrou conhecimento para resolver seu problema?',
    answers: [
      { id: 'a-1', text: 'Sim, totalmente', score: 5 },
      { id: 'a-2', text: 'Sim, parcialmente', score: 3 },
      { id: 'a-3', text: 'Não demonstrou conhecimento', score: 1 },
      { id: 'a-4', text: 'Não se aplica', score: 0 },
    ],
    targetRole: UserRole.COMPANY,
  },
  {
    id: 'q-atd-3',
    categoryId: 'cat-atendimento',
    text: 'O tempo de espera para ser atendido foi razoável?',
    answers: [
      { id: 'a-1', text: 'Sim, foi muito rápido', score: 5 },
      { id: 'a-2', text: 'Sim, foi aceitável', score: 3 },
      { id: 'a-3', text: 'Demorou um pouco', score: 1 },
      { id: 'a-4', text: 'Demorou demais', score: 0 },
    ],
    targetRole: UserRole.COMPANY,
  },
  {
    id: 'q-atd-4',
    categoryId: 'cat-atendimento',
    text: 'Seu problema foi resolvido no primeiro contato?',
    answers: [
      { id: 'a-1', text: 'Sim, totalmente resolvido', score: 5 },
      { id: 'a-2', text: 'Sim, mas precisei de outro contato', score: 3 },
      { id: 'a-3', text: 'Parcialmente resolvido', score: 1 },
      { id: 'a-4', text: 'Não foi resolvido', score: 0 },
    ],
    targetRole: UserRole.COMPANY,
  },
  {
    id: 'q-atd-5',
    categoryId: 'cat-atendimento',
    text: 'A comunicação do agente foi clara e objetiva?',
    answers: [
      { id: 'a-1', text: 'Extremamente clara', score: 5 },
      { id: 'a-2', text: 'Clara', score: 3 },
      { id: 'a-3', text: 'Um pouco confusa', score: 1 },
      { id: 'a-4', text: 'Muito confusa', score: 0 },
    ],
    targetRole: UserRole.COMPANY,
  },
   {
    id: 'q-atd-6',
    categoryId: 'cat-atendimento',
    text: 'Quão fácil foi entrar em contato com nossa equipe de suporte?',
    answers: [
      { id: 'a-1', text: 'Muito fácil', score: 5 },
      { id: 'a-2', text: 'Fácil', score: 3 },
      { id: 'a-3', text: 'Difícil', score: 1 },
      { id: 'a-4', text: 'Muito difícil', score: 0 },
    ],
    targetRole: UserRole.COMPANY,
  },
  {
    id: 'q-atd-7',
    categoryId: 'cat-atendimento',
    text: 'O agente foi cordial e empático durante o atendimento?',
    answers: [
      { id: 'a-1', text: 'Sim, exemplar', score: 5 },
      { id: 'a-2', text: 'Sim, foi cordial', score: 3 },
      { id: 'a-3', text: 'Neutro, nem cordial nem rude', score: 1 },
      { id: 'a-4', text: 'Não, foi rude ou impaciente', score: 0 },
    ],
    targetRole: UserRole.COMPANY,
  },
  {
    id: 'q-atd-8',
    categoryId: 'cat-atendimento',
    text: 'As soluções oferecidas atenderam às suas expectativas?',
    answers: [
      { id: 'a-1', text: 'Superaram as expectativas', score: 5 },
      { id: 'a-2', text: 'Atenderam às expectativas', score: 3 },
      { id: 'a-3', text: 'Ficaram abaixo das expectativas', score: 1 },
      { id: 'a-4', text: 'Muito abaixo das expectativas', score: 0 },
    ],
    targetRole: UserRole.COMPANY,
  },
  {
    id: 'q-atd-9',
    categoryId: 'cat-atendimento',
    text: 'Você se sentiu valorizado como cliente durante a interação?',
    answers: [
      { id: 'a-1', text: 'Sim, muito valorizado', score: 5 },
      { id: 'a-2', text: 'Sim', score: 3 },
      { id: 'a-3', text: 'Não muito', score: 1 },
      { id: 'a-4', text: 'Não, me senti como um número', score: 0 },
    ],
    targetRole: UserRole.COMPANY,
  },
  {
    id: 'q-atd-10',
    categoryId: 'cat-atendimento',
    text: 'Com base na sua experiência, qual a probabilidade de você recomendar nossa empresa?',
    answers: [
      { id: 'a-1', text: 'Muito alta (9-10)', score: 5 },
      { id: 'a-2', text: 'Média (7-8)', score: 3 },
      { id: 'a-3', text: 'Baixa (0-6)', score: 1 },
      { id: 'a-4', text: 'Nenhuma', score: 0 },
    ],
    targetRole: UserRole.COMPANY,
  },
  // Processo de Vendas
  {
    id: 'q-vnd-1',
    categoryId: 'cat-vendas',
    text: 'O vendedor demonstrou entender suas necessidades antes de apresentar uma solução?',
    answers: [
      { id: 'a-1', text: 'Sim, perfeitamente', score: 5 },
      { id: 'a-2', text: 'Sim, de forma geral', score: 3 },
      { id: 'a-3', text: 'Não muito bem', score: 1 },
      { id: 'a-4', text: 'Não, pareceu um script pronto', score: 0 },
    ],
    targetRole: UserRole.COMPANY,
  },
    {
    id: 'q-vnd-2',
    categoryId: 'cat-vendas',
    text: 'A apresentação do produto/serviço foi clara e destacou os benefícios para você?',
    answers: [
      { id: 'a-1', text: 'Sim, foi excelente e focada nos benefícios', score: 5 },
      { id: 'a-2', text: 'Sim, foi boa', score: 3 },
      { id: 'a-3', text: 'Foi um pouco genérica', score: 1 },
      { id: 'a-4', text: 'Não, foi confusa e focada em características', score: 0 },
    ],
    targetRole: UserRole.COMPANY,
  },
    {
    id: 'q-vnd-3',
    categoryId: 'cat-vendas',
    text: 'O vendedor conseguiu responder a todas as suas dúvidas de forma satisfatória?',
    answers: [
      { id: 'a-1', text: 'Sim, todas foram respondidas com clareza', score: 5 },
      { id: 'a-2', text: 'A maioria sim', score: 3 },
      { id: 'a-3', text: 'Algumas ficaram sem resposta', score: 1 },
      { id: 'a-4', text: 'Não, continuei com muitas dúvidas', score: 0 },
    ],
    targetRole: UserRole.COMPANY,
  },
    {
    id: 'q-vnd-4',
    categoryId: 'cat-vendas',
    text: 'Você sentiu que o vendedor estava mais focado em te ajudar do que apenas em vender?',
    answers: [
      { id: 'a-1', text: 'Sim, senti que era uma consultoria', score: 5 },
      { id: 'a-2', text: 'Sim, na maior parte do tempo', score: 3 },
      { id: 'a-3', text: 'Às vezes parecia forçado', score: 1 },
      { id: 'a-4', text: 'Não, a pressão para vender era óbvia', score: 0 },
    ],
    targetRole: UserRole.COMPANY,
  },
    {
    id: 'q-vnd-5',
    categoryId: 'cat-vendas',
    text: 'As informações sobre preços e condições foram transparentes?',
    answers: [
      { id: 'a-1', text: 'Sim, totalmente transparentes', score: 5 },
      { id: 'a-2', text: 'Sim, mas tive que perguntar por detalhes', score: 3 },
      { id: 'a-3', text: 'Foram um pouco vagas', score: 1 },
      { id: 'a-4', text: 'Não, houve custos inesperados', score: 0 },
    ],
    targetRole: UserRole.COMPANY,
  },
    {
    id: 'q-vnd-6',
    categoryId: 'cat-vendas',
    text: 'Como você avalia a habilidade do vendedor em lidar com suas objeções?',
    answers: [
      { id: 'a-1', text: 'Excelente, entendeu minhas preocupações', score: 5 },
      { id: 'a-2', text: 'Boa, respondeu adequadamente', score: 3 },
      { id: 'a-3', text: 'Razoável, mas não me convenceu', score: 1 },
      { id: 'a-4', 'text': 'Ruim, ignorou ou minimizou minhas preocupações', score: 0 },
    ],
    targetRole: UserRole.COMPANY,
  },
    {
    id: 'q-vnd-7',
    categoryId: 'cat-vendas',
    text: 'O processo de fechamento da venda foi simples e sem complicações?',
    answers: [
      { id: 'a-1', text: 'Sim, muito rápido e fácil', score: 5 },
      { id: 'a-2', text: 'Sim, foi tranquilo', score: 3 },
      { id: 'a-3', text: 'Houve um pouco de burocracia', score: 1 },
      { id: 'a-4', text: 'Foi complicado e demorado', score: 0 },
    ],
    targetRole: UserRole.COMPANY,
  },
    {
    id: 'q-vnd-8',
    categoryId: 'cat-vendas',
    text: 'O material de apoio (propostas, catálogos) era profissional e útil?',
    answers: [
      { id: 'a-1', text: 'Sim, muito profissional e ajudou na decisão', score: 5 },
      { id: 'a-2', text: 'Sim, era adequado', score: 3 },
      { id: 'a-3', text: 'Era básico, poderia ser melhor', score: 1 },
      { id: 'a-4', text: 'Não recebi ou era de baixa qualidade', score: 0 },
    ],
    targetRole: UserRole.COMPANY,
  },
    {
    id: 'q-vnd-9',
    categoryId: 'cat-vendas',
    text: 'O vendedor realizou um acompanhamento (follow-up) adequado após o contato inicial?',
    answers: [
      { id: 'a-1', text: 'Sim, no tempo e canal certos', score: 5 },
      { id: 'a-2', text: 'Sim, mas demorou um pouco', score: 3 },
      { id: 'a-3', text: 'Sim, mas foi insistente demais', score: 1 },
      { id: 'a-4', text: 'Não, não houve acompanhamento', score: 0 },
    ],
    targetRole: UserRole.COMPANY,
  },
    {
    id: 'q-vnd-10',
    categoryId: 'cat-vendas',
    text: 'Sua percepção geral do nosso processo de vendas é positiva?',
    answers: [
      { id: 'a-1', text: 'Muito positiva', score: 5 },
      { id: 'a-2', text: 'Positiva', score: 3 },
      { id: 'a-3', text: 'Neutra', score: 1 },
      { id: 'a-4', text: 'Negativa', score: 0 },
    ],
    targetRole: UserRole.COMPANY,
  },
];