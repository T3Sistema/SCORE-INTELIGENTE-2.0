export enum UserRole {
  ADMIN = 'admin',
  COMPANY = 'company',
  EMPLOYEE = 'employee',
  GROUP = 'group',
}

export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface User {
  id: string;
  name: string;
  companyName: string; // For Group users, this will be the Group Name
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  isActive?: boolean;
  photoUrl?: string;
  position?: string;
  managedCompanies?: string[];
  companyCode?: string;
  companyId?: string;
  approvedBy?: string;
  approvalDate?: string;
  approvalTime?: string;
  state?: string;
  city?: string;
  bairro?: string;
  birthDate?: string;
  segmento?: string;
  createdAt?: string;
}

export interface AnswerOption {
  id: string;
  text: string;
  score: number;
}

export interface Question {
  id:string;
  categoryId: string;
  text: string;
  answers: AnswerOption[];
  targetRole: UserRole.COMPANY | UserRole.EMPLOYEE;
}

export interface Category {
  id: string;
  name: string;
}

export interface Segmento {
  id: string;
  name: string;
}

export interface Submission {
  id: string;
  userId: string;
  userName?: string;
  companyName: string;
  categoryId: string;
  categoryName: string;
  answers: { questionId: string; score: number }[];
  totalScore: number;
  maxScore: number;
  date: string;
  detailedAnswers?: any;
  photoUrl?: string;
  phone?: string;
}

export enum LogType {
  USER_APPROVAL = 'aprovacao_usuario',
  QUESTIONNAIRE_SUBMISSION = 'envio_questionario',
  USER_LOGIN = 'login_usuario',
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: LogType;
  message: string;
  adminId?: string;
  adminName?: string;
}

// NeuroMapa Types
export type NeuroCategoryTarget = UserRole.COMPANY | UserRole.EMPLOYEE | 'ambos';

export interface NeuroCategory extends Category {
    targetRole: NeuroCategoryTarget;
}

export interface NeuroQuestion extends Question {
    isOpenEnded?: boolean;
    targetScope?: 'all' | 'specific' | 'multiple' | 'company_all_employees';
    targetId?: string | null;
    targetIds?: string[];
    targetName?: string | null;
    targetNames?: string[];
    targetEmployee?: User | null;
    targetEmployees?: User[];
}

export interface NeuroSubmission {
  id: string;
  userId: string;
  userName: string;
  companyName: string;
  categoryId: string;
  categoryName: string;
  answers: {
    questionId: string;
    questionText: string;
    answer: string;
  }[];
  date: string;
}

export interface NeuroAnalysisResult {
  id: number;
  nome: string;
  perguntas_e_respostas: string;
  resultado: string;
  email: string;
  telefone: string;
  empresa: string;
  data: string;
  horario: string;
  foto: string;
  categoria?: string;
}

export interface OralTestResult {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  foto: string; // Employee's photo URL
  resultado_detalhado: string;
  pergunta: string;
  resposta_funcionario: string; // Audio response URL
  data: string;
  horario_inicio: string;
  horario_resposta: string;
  tempo_limite: string;
  score_anterior: string;
  score_atual: string;
  transcricao: string;
  categoria?: string;
}

export interface AvailableOralTest {
  Id: number;
  Nome: string;
  Telefone: string;
  'E-mail': string;
  Empresa: string;
  Pergunta: string | null;
  'Data de envio': string;
  'Horário de envio': string | null;
  Categoria: string;
  'Tempo Limite': string;
  Status: 'Em andamento' | 'Iniciada' | 'Respondida' | 'Anulada';
  'Perguntas & Respostas': string;
  // New optional fields for results view
  'Score Anterior'?: string;
  'Score Atual'?: string;
  Foto?: string;
  'Resposta Funcionario'?: string; // audio url
  Transcricao?: string;
  'Resultado Detalhado'?: string;
  'Horario Inicio'?: string;
  'Horario Resposta'?: string;
}

export interface Grupo {
  id: string;
  nome: string;
  responsavel: {
      id: string;
      nome: string;
      email: string;
  };
  empresas: string[];
}