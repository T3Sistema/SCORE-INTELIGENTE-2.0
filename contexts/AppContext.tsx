

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Category, Question, Submission, UserStatus, UserRole, LogEntry, LogType, AnswerOption, NeuroQuestion, NeuroCategory, NeuroCategoryTarget, NeuroSubmission, NeuroAnalysisResult, OralTestResult, Segmento, Grupo } from '../types';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration with user-provided credentials
const supabaseUrl = 'https://gwwdnxtxfnybwubnnutt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3d2RueHR4Zm55Ynd1Ym5udXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzgyMTksImV4cCI6MjA3MzgxNDIxOX0.-XgNJ8c89mn4n8w1t2ZafnR-nzWIpr_HtCHPaqh4GAQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AppContextType {
  currentUser: User | null;
  users: User[];
  admins: User[];
  allEmployees: User[];
  categories: Category[];
  segmentos: Segmento[];
  questions: Question[];
  submissions: Submission[];
  employeeSubmissions: Submission[];
  logs: LogEntry[];
  loading: boolean;
  neuroQuestions: NeuroQuestion[];
  neuroCategories: NeuroCategory[];
  neuroSubmissions: NeuroSubmission[];
  neuroAnalysisResults: NeuroAnalysisResult[];
  companyNeuroAnalysisResults: NeuroAnalysisResult[];
  oralTestResults: OralTestResult[];
  selectedCompany: string | null;
  allRegisteredCompanies: User[];
  grupos: Grupo[];
  selectCompany: (companyName: string | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  register: (name: string, companyName: string, email: string, password: string, phone: string, logo: string | null, estado: string, cidade: string, bairro: string, birthDate: string, segmento: string) => Promise<{ success: boolean; message?: string }>;
  registerEmployee: (name: string, phone: string, email: string, password: string, companyCode: string, photo: string | null, estado: string, cidade: string, bairro: string, birthDate: string) => Promise<{ success: boolean; message?: string; }>;
  updateUserStatus: (userId: string, status: UserStatus) => Promise<void>;
  approveUser: (userToApprove: User) => Promise<{ success: boolean; message?: string }>;
  rejectUser: (userToReject: User) => Promise<{ success: boolean; message?: string }>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (category: Category, newName: string) => Promise<{ success: boolean; message?: string }>;
  deleteCategory: (category: Category) => Promise<{ success: boolean; message?: string }>;
  addSegmento: (name: string) => Promise<{ success: boolean; message: string }>;
  updateSegmento: (segmento: Segmento, newName: string) => Promise<{ success: boolean; message: string }>;
  deleteSegmento: (segmento: Segmento) => Promise<{ success: boolean; message: string }>;
  addQuestion: (categoryId: string, text: string, answers: { text: string; score: number }[], targetRole: UserRole.COMPANY | UserRole.EMPLOYEE) => Promise<void>;
  updateQuestion: (question: Question) => Promise<{ success: boolean; message?: string }>;
  deleteQuestion: (question: Question) => Promise<{ success: boolean; message?: string }>;
  addSubmission: (submission: Omit<Submission, 'id' | 'date'>) => Promise<void>;
  addAdmin: (name: string, email: string, password: string, phone: string) => Promise<{ success: boolean; message?: string }>;
  updateAdmin: (originalUser: User, updates: { name?: string; email?: string; phone?: string; password?: string }) => Promise<{ success: boolean; message: string }>;
  deleteAdmin: (userToDelete: User) => Promise<{ success: boolean; message: string }>;
  deleteCompany: (companyToDelete: User) => Promise<{ success: boolean; message: string; }>;
  changePassword: (user: User, currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string; }>;
  changeAdminPassword: (userId: string, email: string, currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string; }>;
  changeGroupPassword: (user: User, currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string; }>;
  updateUserProfilePhoto: (newPhotoBase64: string) => Promise<{ success: boolean; message: string; }>;
  fetchAdminQuestionnaireData: () => Promise<void>;
  fetchAdmins: () => Promise<void>;
  fetchPendingUsers: () => Promise<void>;
  fetchApprovedUsersLogs: () => Promise<void>;
  fetchLoginLogs: () => Promise<void>;
  fetchSubmissions: () => Promise<void>;
  fetchEmployeeScoresForAdmin: () => Promise<void>;
  fetchAllEmployees: () => Promise<void>;
  fetchNeuroData: () => Promise<void>;
  fetchSegmentos: () => Promise<void>;
  fetchGrupos: () => Promise<void>;
  addNeuroMapaSubmission: (submission: Omit<NeuroSubmission, 'id' | 'date'>) => Promise<{ success: boolean; result?: string; message?: string }>;
  fetchNeuroSubmissions: () => Promise<void>;
  fetchNeuroAnalysisResults: () => Promise<void>;
  fetchCompanyNeuroAnalysisResults: () => Promise<void>;
  fetchOralTestResults: () => Promise<void>;
  startOralTest: (payload: any) => Promise<{ success: boolean; message?: string; }>;
  fetchAllRegisteredCompanies: () => Promise<void>;
  updateUserIsActive: (userId: string, isActive: boolean) => Promise<{ success: boolean; message: string }>;
  toggleEmployeeActiveStatus: (userToToggle: User, newIsActive: boolean) => Promise<{ success: boolean; message: string }>;
  createGroup: (groupName: string, responsibleName: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  updateGroup: (originalGroup: Grupo, newData: { nome: string; responsavelNome: string; responsavelEmail: string }) => Promise<{ success: boolean; message: string }>;
  deleteGroup: (groupToDelete: Grupo) => Promise<{ success: boolean; message: string }>;
  addCompaniesToGroup: (groupId: string, companyNames: string[]) => Promise<{ success: boolean; message: string }>;
  removeCompanyFromGroup: (groupId: string, companyName: string) => Promise<{ success: boolean; message: string }>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [allEmployees, setAllEmployees] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [segmentos, setSegmentos] = useState<Segmento[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [employeeSubmissions, setEmployeeSubmissions] = useState<Submission[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [neuroQuestions, setNeuroQuestions] = useState<NeuroQuestion[]>([]);
  const [neuroCategories, setNeuroCategories] = useState<NeuroCategory[]>([]);
  const [neuroSubmissions, setNeuroSubmissions] = useState<NeuroSubmission[]>([]);
  const [neuroAnalysisResults, setNeuroAnalysisResults] = useState<NeuroAnalysisResult[]>([]);
  const [companyNeuroAnalysisResults, setCompanyNeuroAnalysisResults] = useState<NeuroAnalysisResult[]>([]);
  const [oralTestResults, setOralTestResults] = useState<OralTestResult[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [allRegisteredCompanies, setAllRegisteredCompanies] = useState<User[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);

  const selectCompany = useCallback((companyName: string | null) => {
    setSelectedCompany(companyName);
  }, []);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
        const parsedUser = JSON.parse(loggedInUser);
        setCurrentUser(parsedUser);
        if (parsedUser.role === UserRole.GROUP) {
            const storedCompany = localStorage.getItem('selectedCompany');
            if (storedCompany) {
                setSelectedCompany(storedCompany);
            }
        }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedCompany) {
        localStorage.setItem('selectedCompany', selectedCompany);
    } else {
        localStorage.removeItem('selectedCompany');
    }
  }, [selectedCompany]);

  const addLogEntry = useCallback(async (type: LogType, message: string, ator_id: string, alvo_id?: string) => {
    const { error } = await supabase.from('logs_de_atividade').insert({
        tipo_log: type,
        mensagem: message,
        ator_id,
        alvo_id,
    });
    if (error) {
        console.error('Error adding log entry:', error);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();

        const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('*, empresas!fk_empresa(id, nome_empresa, codigo_empresa)')
            .ilike('email', trimmedEmail) 
            .single();

        if (userError || !userData) {
            console.error('Supabase login error or user not found:', userError);
            return { success: false, message: 'Usuário ou senha incorretos.' };
        }
        
        if (userData.senha_hash.trim() !== trimmedPassword) {
            return { success: false, message: 'Usuário ou senha incorretos.' };
        }
        
        if (userData.status_aprovacao !== 'aprovado') {
             return { success: false, message: 'Sua conta ainda não foi aprovada.' };
        }
        
        if (!userData.esta_ativo) {
             return { success: false, message: 'Sua conta está desativada.' };
        }

        let loggedInUser: User | null = null;
        const baseUser: Omit<User, 'role' | 'companyName'> = {
            id: userData.id,
            name: userData.nome_completo,
            email: userData.email,
            phone: userData.telefone || '',
            passwordHash: '', // Never expose password to client state
            status: UserStatus.APPROVED,
            photoUrl: userData.foto_url || undefined,
            isActive: userData.esta_ativo,
        };

        const companyInfo = userData.empresas as { id: string; nome_empresa: string; codigo_empresa: string } | null;

        switch (userData.funcao as UserRole) {
            case UserRole.ADMIN:
                loggedInUser = {
                    ...baseUser,
                    role: UserRole.ADMIN,
                    companyName: 'Triad3',
                };
                break;
            case UserRole.COMPANY:
                loggedInUser = {
                    ...baseUser,
                    role: UserRole.COMPANY,
                    companyName: companyInfo?.nome_empresa || '',
                    companyCode: companyInfo?.codigo_empresa || '',
                    companyId: companyInfo?.id,
                };
                break;
            case UserRole.EMPLOYEE:
                loggedInUser = {
                    ...baseUser,
                    role: UserRole.EMPLOYEE,
                    companyName: companyInfo?.nome_empresa || '',
                    position: userData.cargo || 'Funcionário',
                    companyId: companyInfo?.id,
                };
                break;
            case UserRole.GROUP:
                const { data: groupData, error: groupError } = await supabase
                    .from('grupos')
                    .select('nome_grupo, empresas_do_grupo(empresas(nome_empresa))')
                    .eq('responsavel_id', userData.id)
                    .single();

                if (groupError || !groupData) {
                    return { success: false, message: 'Não foi possível carregar os dados do grupo.' };
                }

                const managedCompanies = (groupData.empresas_do_grupo as any[]).map(
                    (item: any) => item.empresas.nome_empresa
                );
                loggedInUser = {
                    ...baseUser,
                    role: UserRole.GROUP,
                    companyName: groupData.nome_grupo,
                    managedCompanies,
                };
                break;
            default:
                return { success: false, message: `Tipo de acesso desconhecido: ${userData.funcao}` };
        }
        
        if (loggedInUser) {
            setCurrentUser(loggedInUser);
            localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
            await addLogEntry(LogType.USER_LOGIN, `Usuário "${loggedInUser.name}" da empresa "${loggedInUser.companyName}" fez login.`, loggedInUser.id);
            return { success: true };
        } else {
             return { success: false, message: "Não foi possível processar os dados do usuário." };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: "Ocorreu um erro de comunicação ao tentar fazer login." };
    }
  }, [addLogEntry]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setSelectedCompany(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('selectedCompany');
    window.location.hash = '#login';
  }, []);
  
  const register = useCallback(async (name: string, companyName: string, email: string, password: string, phone: string, logo: string | null, estado: string, cidade: string, bairro: string, birthDate: string, segmento: string): Promise<{ success: boolean; message?: string }> => {
    try {
        let imageUrl: string;

        if (logo && logo.startsWith('data:image/')) {
            const base64Response = await fetch(logo);
            const logoBlob = await base64Response.blob();
            const fileExtension = logoBlob.type.split('/')[1] || 'png';
            const filePath = `logos_empresas/${Date.now()}-${companyName.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExtension}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('imagens')
                .upload(filePath, logoBlob, { contentType: logoBlob.type });

            if (uploadError) throw new Error(`Falha ao carregar o logo: ${uploadError.message}`);

            const { data: urlData } = supabase.storage.from('imagens').getPublicUrl(uploadData.path);
            imageUrl = urlData.publicUrl;
        } else {
            imageUrl = 'https://aisfizoyfpcisykarrnt.supabase.co/storage/v1/object/public/prospectaifeedback/WhatsApp%20Image%202025-09-12%20at%2000.14.26.jpeg';
        }

        // ⚠️ AVISO DE SEGURANÇA: Armazenando senha em texto puro, conforme solicitado.
        const { data: newUserData, error: newUserError } = await supabase.from('usuarios').insert({
            nome_completo: name,
            email: email,
            senha_hash: password, 
            telefone: phone,
            funcao: UserRole.COMPANY,
            status_aprovacao: 'pendente',
            foto_url: imageUrl,
            estado: estado,
            cidade: cidade,
            bairro: bairro,
            data_nascimento: birthDate.split('/').reverse().join('-'),
        }).select().single();

        if (newUserError) throw newUserError;

        const { data: segmentoData, error: segmentoError } = await supabase.from('segmentos').select('id').eq('nome', segmento).single();
        if (segmentoError || !segmentoData) throw new Error('Segmento de mercado inválido.');

        const sanitizedCompanyName = companyName
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9]/g, '')
            .toUpperCase();
        
        const companyCode = `SIT${sanitizedCompanyName.substring(0, 8)}${String(Date.now()).slice(-4)}`;
        
        const { data: newCompanyData, error: newCompanyError } = await supabase.from('empresas').insert({
            nome_empresa: companyName,
            codigo_empresa: companyCode,
            proprietario_id: newUserData.id,
            segmento_id: segmentoData.id,
        }).select().single();

        if (newCompanyError) {
            await supabase.from('usuarios').delete().eq('id', newUserData.id); // Rollback user
            throw newCompanyError;
        }

        const { error: updateUserError } = await supabase.from('usuarios').update({ empresa_id: newCompanyData.id }).eq('id', newUserData.id);
        if (updateUserError) throw updateUserError;

        return { success: true, message: 'Cadastro realizado com sucesso! Aguarde a aprovação do administrador.' };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, message: error instanceof Error ? `Erro: ${error.message}` : "Ocorreu um erro desconhecido." };
    }
  }, []);

  const registerEmployee = useCallback(async (name: string, phone: string, email: string, password: string, companyCode: string, photo: string | null, estado: string, cidade: string, bairro: string, birthDate: string): Promise<{ success: boolean; message?: string; }> => {
    try {
        const { data: companyData, error: companyError } = await supabase.from('empresas').select('id').eq('codigo_empresa', companyCode).single();
        if (companyError || !companyData) {
            return { success: false, message: 'Código da empresa inválido ou não encontrado.' };
        }

        let imageUrl: string;

        if (photo && photo.startsWith('data:image/')) {
            const base64Response = await fetch(photo);
            const photoBlob = await base64Response.blob();
            const fileExtension = photoBlob.type.split('/')[1] || 'jpg';
            const filePath = `funcionarios/${Date.now()}-${email.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExtension}`;

            const { data: uploadData, error: uploadError } = await supabase.storage.from('imagens').upload(filePath, photoBlob, { contentType: photoBlob.type });
            if (uploadError) throw new Error(`Falha ao carregar a foto: ${uploadError.message}`);

            const { data: urlData } = supabase.storage.from('imagens').getPublicUrl(uploadData.path);
            imageUrl = urlData.publicUrl;
        } else {
            imageUrl = 'https://aisfizoyfpcisykarrnt.supabase.co/storage/v1/object/public/prospectaifeedback/Screenshot%202025-08-25%20182827.png';
        }

        // ⚠️ AVISO DE SEGURANÇA: Armazenando senha em texto puro, conforme solicitado.
        const { error: insertError } = await supabase.from('usuarios').insert({
            nome_completo: name,
            telefone: phone,
            email: email,
            senha_hash: password,
            empresa_id: companyData.id,
            funcao: UserRole.EMPLOYEE,
            status_aprovacao: 'pendente',
            foto_url: imageUrl,
            estado: estado,
            cidade: cidade,
            bairro: bairro,
            data_nascimento: birthDate.split('/').reverse().join('-'),
        });
        if (insertError) throw insertError;

        return { success: true, message: 'Cadastro enviado para aprovação. Você será notificado quando sua conta for ativada.' };
    } catch (error) {
        console.error('Employee Registration error:', error);
        return { success: false, message: error instanceof Error ? `Erro: ${error.message}` : "Ocorreu um erro desconhecido." };
    }
  }, []);

  const updateUserStatus = useCallback(async (userId: string, status: UserStatus) => {
    const { error } = await supabase.from('usuarios').update({ status_aprovacao: status }).eq('id', userId);
    if (error) console.error('Error updating user status:', error);
  }, []);
  
  // Fix: Moved fetchPendingUsers before approveUser and rejectUser to fix block-scoped variable error.
  const fetchPendingUsers = useCallback(async () => {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*, empresas!fk_empresa(nome_empresa, codigo_empresa), criado_em')
            .eq('status_aprovacao', 'pendente');

        if (error) throw error;

        const pendingUsers: User[] = data.map((dbUser: any) => ({
            id: dbUser.id,
            name: dbUser.nome_completo,
            companyName: dbUser.empresas?.nome_empresa || 'N/A',
            email: dbUser.email,
            phone: dbUser.telefone,
            passwordHash: '',
            role: dbUser.funcao,
            status: UserStatus.PENDING,
            createdAt: dbUser.criado_em,
            photoUrl: dbUser.foto_url,
            position: dbUser.cargo,
            companyId: dbUser.empresa_id,
            state: dbUser.estado,
            city: dbUser.cidade,
            bairro: dbUser.bairro,
            birthDate: dbUser.data_nascimento,
            companyCode: dbUser.empresas?.codigo_empresa,
        }));
        setUsers(pendingUsers);
    } catch (error) {
        console.error('Error fetching pending users:', error);
    }
  }, []);

  const approveUser = useCallback(async (userToApprove: User): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) return { success: false, message: "Apenas administradores podem aprovar usuários." };

    try {
        const { error: updateError } = await supabase.from('usuarios').update({
            status_aprovacao: 'aprovado',
            aprovado_por_id: currentUser.id,
            aprovado_em: new Date().toISOString()
        }).eq('id', userToApprove.id);

        if (updateError) throw updateError;
        
        // Re-fetch the user's full data to ensure it's complete for the webhook
        const { data: fullUserData, error: fetchError } = await supabase
            .from('usuarios')
            .select('*, empresas!fk_empresa(nome_empresa, codigo_empresa)')
            .eq('id', userToApprove.id)
            .single();
        
        if (fetchError) {
            console.error("Failed to fetch user data for webhook:", fetchError);
            // Continue without webhook, as the user is already approved in DB.
        } else if (fullUserData) {
            try {
                // Construct a clean payload with all necessary user data
                const payload = {
                    id: fullUserData.id,
                    name: fullUserData.nome_completo,
                    companyName: fullUserData.empresas?.nome_empresa || 'N/A',
                    email: fullUserData.email,
                    phone: fullUserData.telefone,
                    role: fullUserData.funcao,
                    status: 'approved',
                    photoUrl: fullUserData.foto_url,
                    position: fullUserData.cargo,
                    companyId: fullUserData.empresa_id,
                    state: fullUserData.estado,
                    city: fullUserData.cidade,
                    bairro: fullUserData.bairro,
                    birthDate: fullUserData.data_nascimento,
                    // Explicitly add companyCode if the user is a company
                    companyCode: fullUserData.funcao === UserRole.COMPANY ? fullUserData.empresas?.codigo_empresa : undefined,
                };

                const webhookResponse = await fetch('https://webhook.triad3.io/webhook/notific-aproved', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (!webhookResponse.ok) {
                    console.error(`Webhook notification failed with status: ${webhookResponse.status}`, await webhookResponse.text());
                }
            } catch (webhookError) {
                console.error('Failed to send approval webhook notification:', webhookError);
            }
        }

        await addLogEntry(LogType.USER_APPROVAL, `Usuário "${userToApprove.name}" da empresa "${userToApprove.companyName}" foi aprovado.`, currentUser.id, userToApprove.id);
        await fetchPendingUsers();
        return { success: true, message: 'Usuário aprovado com sucesso!' };
    } catch(error) {
        console.error('Approve user error:', error);
        return { success: false, message: 'Falha ao aprovar usuário.' };
    }
  }, [currentUser, addLogEntry, fetchPendingUsers]);

  const rejectUser = useCallback(async (userToReject: User): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) return { success: false, message: "Apenas administradores podem rejeitar usuários." };

    try {
        const { error } = await supabase.from('usuarios').update({
            status_aprovacao: 'rejeitado'
        }).eq('id', userToReject.id);
        
        if (error) throw error;

        await fetchPendingUsers();
        return { success: true, message: 'Cadastro rejeitado com sucesso.' };
    } catch (error) {
        console.error('Reject user error:', error);
        return { success: false, message: 'Falha ao rejeitar usuário.' };
    }
  }, [currentUser, fetchPendingUsers]);

  const fetchApprovedUsersLogs = useCallback(async () => {
    const { data, error } = await supabase.from('logs_de_atividade').select('*, ator:ator_id(nome_completo)').eq('tipo_log', LogType.USER_APPROVAL);
    if (error) { console.error(error); return; }
    const approvalLogs: LogEntry[] = data.map((log: any) => ({
        id: log.id,
        timestamp: log.criado_em,
        type: LogType.USER_APPROVAL,
        message: log.mensagem,
        adminName: log.ator?.nome_completo || 'Admin',
    }));
    setLogs(prev => [...prev.filter(l => l.type !== LogType.USER_APPROVAL), ...approvalLogs]);
  }, []);

  const fetchLoginLogs = useCallback(async () => {
     const { data, error } = await supabase.from('logs_de_atividade').select('*').eq('tipo_log', LogType.USER_LOGIN);
    if (error) { console.error(error); return; }
    const loginLogs: LogEntry[] = data.map((log: any) => ({
        id: log.id,
        timestamp: log.criado_em,
        type: LogType.USER_LOGIN,
        message: log.mensagem,
    }));
    setLogs(prev => [...prev.filter(l => l.type !== LogType.USER_LOGIN), ...loginLogs]);
  }, []);
  
  // Placeholder for functions requiring AI/backend logic
  const addNeuroMapaSubmission = useCallback(async (submissionData: Omit<NeuroSubmission, 'id' | 'date'>): Promise<{ success: boolean; result?: string; message?: string; }> => {
    console.warn("addNeuroMapaSubmission: AI analysis is not implemented. Saving submission and returning placeholder analysis.");
    if(!currentUser) return { success: false, message: "Usuário não autenticado." };
    
    const { data: submissionResult, error: submissionError } = await supabase.from('neuromapa_envios').insert({
        usuario_id: submissionData.userId,
        categoria_id: submissionData.categoryId,
    }).select().single();
    
    if (submissionError || !submissionResult) return { success: false, message: 'Falha ao salvar o envio.' };

    const answersToInsert = submissionData.answers.map(ans => ({
        envio_id: submissionResult.id,
        pergunta_id: ans.questionId,
        texto_resposta: ans.answer,
    }));
    
    const { error: answersError } = await supabase.from('neuromapa_respostas_enviadas').insert(answersToInsert);
    if(answersError) return { success: false, message: 'Falha ao salvar as respostas.' };

    const placeholderResult = `Análise para ${submissionData.userName} na categoria "${submissionData.categoryName}":\n\nEsta é uma análise gerada automaticamente. A integração com o modelo de IA precisa ser configurada em uma Função de Borda do Supabase para gerar resultados reais.`;
    
    await supabase.from('neuromapa_analises').insert({
        envio_id: submissionResult.id,
        resultado_texto_completo: placeholderResult,
    });
    
    return { success: true, result: placeholderResult };
  }, [currentUser]);

  const startOralTest = useCallback(async (payload: any): Promise<{ success: boolean; message?: string; }> => {
     console.warn("startOralTest: AI question generation not implemented. Creating test with a placeholder question.");
     try {
         const { employee_data, oral_test_data } = payload;
         
         const { data: categoryData, error: catError } = await supabase.from('score_categorias').select('id').eq('nome', oral_test_data.selected_category).single();
         if(catError || !categoryData) throw new Error("Categoria não encontrada.");
         
         const { error } = await supabase.from('provas_orais').insert({
             funcionario_id: employee_data.userId,
             score_categoria_id: categoryData.id,
             status: 'iniciada',
             tempo_limite_segundos: oral_test_data.tempo_limite_resposta,
             pergunta_gerada: "Esta é uma pergunta placeholder. A IA para geração de perguntas precisa ser implementada em uma Função de Borda.",
             iniciado_em: new Date().toISOString()
         });
         
         if (error) throw error;
         return { success: true, message: 'Prova oral iniciada com placeholder.' };

     } catch(error) {
         return { success: false, message: error instanceof Error ? error.message : "Erro desconhecido." };
     }
  }, []);
  
  const fetchAdminQuestionnaireData = useCallback(async () => {
    try {
        const { data: categoriesData, error: categoriesError } = await supabase
            .from('score_categorias')
            .select('*');
        if (categoriesError) throw categoriesError;

        const { data: questionsData, error: questionsError } = await supabase
            .from('score_perguntas')
            .select('*, score_opcoes_resposta(*)');
        if (questionsError) throw questionsError;

        if (categoriesData) {
            const mappedCategories: Category[] = categoriesData.map((cat: any) => ({
                id: cat.id,
                name: cat.nome,
            }));
            setCategories(mappedCategories);
        }

        if (questionsData) {
            const mappedQuestions: Question[] = questionsData.map((q: any) => ({
                id: q.id,
                categoryId: q.categoria_id,
                text: q.texto_pergunta,
                targetRole: q.publico_alvo === 'empresa' ? UserRole.COMPANY : UserRole.EMPLOYEE,
                answers: (q.score_opcoes_resposta || []).map((ans: any) => ({
                    id: ans.id,
                    text: ans.texto_resposta,
                    score: ans.pontuacao,
                })),
            }));
            setQuestions(mappedQuestions);
        }
    } catch (error) {
        console.error('Error fetching admin questionnaire data:', error);
        setCategories([]);
        setQuestions([]);
    }
}, []);

  const fetchAdmins = useCallback(async () => {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('funcao', UserRole.ADMIN)
            .order('nome_completo', { ascending: true });

        if (error) throw error;

        const adminUsers: User[] = data.map((dbUser: any) => ({
            id: dbUser.id,
            name: dbUser.nome_completo,
            companyName: 'Triad3',
            email: dbUser.email,
            phone: dbUser.telefone,
            passwordHash: '',
            role: UserRole.ADMIN,
            status: dbUser.status_aprovacao as UserStatus,
        }));
        setAdmins(adminUsers);
    } catch (error) {
        console.error('Error fetching admins:', error);
        setAdmins([]);
    }
  }, []);

  const addAdmin = useCallback(async (name: string, email: string, password: string, phone: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const { error } = await supabase.from('usuarios').insert({
            nome_completo: name,
            email: email,
            senha_hash: password,
            telefone: phone,
            funcao: UserRole.ADMIN,
            status_aprovacao: 'aprovado',
            esta_ativo: true,
            aprovado_em: new Date().toISOString(),
            aprovado_por_id: currentUser?.id,
        });

        if (error) throw error;

        await fetchAdmins();
        return { success: true, message: 'Administrador adicionado com sucesso!' };
    } catch (error: any) {
        console.error('Error adding admin:', error);
        return { success: false, message: error.message || 'Falha ao adicionar administrador.' };
    }
  }, [fetchAdmins, currentUser]);

  const updateAdmin = useCallback(async (originalUser: User, updates: { name?: string; email?: string; phone?: string; password?: string }): Promise<{ success: boolean; message: string }> => {
    try {
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.nome_completo = updates.name;
        if (updates.email) dbUpdates.email = updates.email;
        if (updates.phone) dbUpdates.telefone = updates.phone;
        if (updates.password) dbUpdates.senha_hash = updates.password;

        if (Object.keys(dbUpdates).length === 0) {
            return { success: true, message: 'Nenhuma alteração detectada.' };
        }

        const { error } = await supabase
            .from('usuarios')
            .update(dbUpdates)
            .eq('id', originalUser.id);

        if (error) throw error;
        
        await fetchAdmins();
        return { success: true, message: 'Administrador atualizado com sucesso!' };
    } catch (error: any) {
        console.error('Error updating admin:', error);
        return { success: false, message: error.message || 'Falha ao atualizar administrador.' };
    }
  }, [fetchAdmins]);

  const deleteAdmin = useCallback(async (userToDelete: User): Promise<{ success: boolean; message: string }> => {
    if (currentUser?.id === userToDelete.id) {
        return { success: false, message: 'Você não pode se excluir.' };
    }
    try {
        const { error } = await supabase
            .from('usuarios')
            .delete()
            .eq('id', userToDelete.id);

        if (error) throw error;

        await fetchAdmins();
        return { success: true, message: 'Administrador excluído com sucesso!' };
    } catch (error: any) {
        console.error('Error deleting admin:', error);
        return { success: false, message: error.message || 'Falha ao excluir administrador.' };
    }
  }, [currentUser, fetchAdmins]);

  const fetchSegmentos = useCallback(async () => {
    try {
        const { data, error } = await supabase.from('segmentos').select('*').order('nome');
        if (error) throw error;
        setSegmentos((data || []).map((s: any) => ({ id: s.id, name: s.nome })));
    } catch(error) {
        console.error("Error fetching segmentos:", error);
        setSegmentos([]);
    }
  }, []);

  const addCategory = useCallback(async (name: string) => {
    const { error } = await supabase.from('score_categorias').insert({ nome: name });
    if (error) throw error;
  }, []);
  
  const updateCategory = useCallback(async (category: Category, newName: string): Promise<{ success: boolean; message?: string }> => {
      const { error } = await supabase.from('score_categorias').update({ nome: newName }).eq('id', category.id);
      if (error) {
          return { success: false, message: `Falha ao atualizar: ${error.message}` };
      }
      return { success: true, message: 'Categoria atualizada!' };
  }, []);
  
  const deleteCategory = useCallback(async (category: Category): Promise<{ success: boolean; message?: string }> => {
      const { data: questions, error: checkError } = await supabase.from('score_perguntas').select('id').eq('categoria_id', category.id).limit(1);
      if (checkError) return { success: false, message: `Erro ao verificar: ${checkError.message}` };
      if (questions && questions.length > 0) {
          return { success: false, message: 'Não é possível excluir. Existem perguntas nesta categoria.' };
      }
      const { error } = await supabase.from('score_categorias').delete().eq('id', category.id);
      if (error) return { success: false, message: `Falha ao excluir: ${error.message}` };
      return { success: true, message: 'Categoria excluída!' };
  }, []);
  
  const addSegmento = useCallback(async (name: string): Promise<{ success: boolean; message: string }> => {
      const { error } = await supabase.from('segmentos').insert({ nome: name });
      if (error) return { success: false, message: error.message };
      await fetchSegmentos();
      return { success: true, message: 'Segmento adicionado!' };
  }, [fetchSegmentos]);
  
  const updateSegmento = useCallback(async (segmento: Segmento, newName: string): Promise<{ success: boolean; message: string }> => {
      const { error } = await supabase.from('segmentos').update({ nome: newName }).eq('id', segmento.id);
      if (error) return { success: false, message: error.message };
      await fetchSegmentos();
      return { success: true, message: 'Segmento atualizado!' };
  }, [fetchSegmentos]);
  
  const deleteSegmento = useCallback(async (segmento: Segmento): Promise<{ success: boolean; message: string }> => {
      const { data, error: checkError } = await supabase.from('empresas').select('id').eq('segmento_id', segmento.id).limit(1);
      if (checkError) return { success: false, message: `Erro ao verificar: ${checkError.message}` };
      if (data && data.length > 0) return { success: false, message: 'Não é possível excluir. Segmento em uso por empresas.' };
      const { error } = await supabase.from('segmentos').delete().eq('id', segmento.id);
      if (error) return { success: false, message: error.message };
      await fetchSegmentos();
      return { success: true, message: 'Segmento excluído!' };
  }, [fetchSegmentos]);
  
  const addQuestion = useCallback(async (categoryId: string, text: string, answers: { text: string; score: number }[], targetRole: UserRole.COMPANY | UserRole.EMPLOYEE) => {
    const dbTargetRole = targetRole === UserRole.COMPANY ? 'empresa' : 'funcionario';
    const { data: qData, error: qError } = await supabase.from('score_perguntas').insert({ categoria_id: categoryId, texto_pergunta: text, publico_alvo: dbTargetRole }).select().single();
    if (qError) throw qError;
    const ansData = answers.map(a => ({ pergunta_id: qData.id, texto_resposta: a.text, pontuacao: a.score }));
    const { error: aError } = await supabase.from('score_opcoes_resposta').insert(ansData);
    if (aError) {
      await supabase.from('score_perguntas').delete().eq('id', qData.id); // Rollback
      throw aError;
    }
  }, []);
  
  const updateQuestion = useCallback(async (question: Question): Promise<{ success: boolean; message?: string }> => {
      const { error: qError } = await supabase.from('score_perguntas').update({ texto_pergunta: question.text, categoria_id: question.categoryId }).eq('id', question.id);
      if (qError) return { success: false, message: qError.message };
      
      const { error: delError } = await supabase.from('score_opcoes_resposta').delete().eq('pergunta_id', question.id);
      if (delError) return { success: false, message: `Falha ao limpar respostas antigas: ${delError.message}` };

      const ansData = question.answers.map(a => ({ pergunta_id: question.id, texto_resposta: a.text, pontuacao: a.score }));
      if (ansData.length > 0) {
        const { error: aError } = await supabase.from('score_opcoes_resposta').insert(ansData);
        if (aError) return { success: false, message: `Falha ao inserir novas respostas: ${aError.message}` };
      }
      return { success: true, message: 'Pergunta atualizada!' };
  }, []);
  
  const deleteQuestion = useCallback(async (question: Question): Promise<{ success: boolean; message?: string }> => {
      const { error } = await supabase.from('score_perguntas').delete().eq('id', question.id);
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Pergunta excluída!' };
  }, []);
  
  const fetchSubmissions = useCallback(async () => {
    if (!currentUser) return;

    try {
        let query = supabase
            .from('score_envios')
            .select(`
                *,
                score_categorias(nome),
                usuarios:usuario_id!inner(
                    nome_completo,
                    foto_url,
                    telefone,
                    funcao,
                    empresas!fk_empresa(nome_empresa)
                )
            `);

        if (currentUser.role === UserRole.EMPLOYEE) {
            query = query.eq('usuario_id', currentUser.id);
        } else {
            query = query.eq('usuarios.funcao', 'company');
            if (currentUser.role === UserRole.COMPANY) {
                query = query.eq('usuarios.empresas.nome_empresa', currentUser.companyName);
            } else if (currentUser.role === UserRole.GROUP) {
                query = query.in('usuarios.empresas.nome_empresa', currentUser.managedCompanies || []);
            }
        }
        
        const { data, error } = await query.order('criado_em', { ascending: false });
        if (error) throw error;
        
        const mappedSubmissions: Submission[] = (data || []).map((s: any) => ({
            id: s.id,
            userId: s.usuario_id,
            userName: s.usuarios.nome_completo,
            companyName: s.usuarios.empresas?.nome_empresa || 'N/A',
            categoryId: s.categoria_id,
            categoryName: s.score_categorias?.nome || 'N/A',
            answers: s.respostas_jsonb || [],
            totalScore: s.pontuacao_total,
            maxScore: s.pontuacao_maxima,
            date: s.criado_em,
            detailedAnswers: s.respostas_detalhadas,
            photoUrl: s.usuarios.foto_url,
            phone: s.usuarios.telefone
        }));
        setSubmissions(mappedSubmissions);
    } catch (error) {
        console.error("Error fetching submissions:", error);
    }
}, [currentUser]);

const fetchEmployeeScoresForAdmin = useCallback(async () => {
    if (!currentUser || currentUser.role === UserRole.EMPLOYEE) {
        setEmployeeSubmissions([]);
        return;
    };

    try {
        let query = supabase
            .from('score_envios')
            .select(`
                *,
                score_categorias(nome),
                usuarios:usuario_id!inner(
                    nome_completo,
                    foto_url,
                    telefone,
                    funcao,
                    empresas!fk_empresa(nome_empresa)
                )
            `)
            .eq('usuarios.funcao', 'employee');

        if (currentUser.role === UserRole.COMPANY) {
            query = query.eq('usuarios.empresas.nome_empresa', currentUser.companyName);
        } else if (currentUser.role === UserRole.GROUP) {
            query = query.in('usuarios.empresas.nome_empresa', currentUser.managedCompanies || []);
        }
        
        const { data, error } = await query.order('criado_em', { ascending: false });
        if (error) throw error;

        const mappedSubmissions: Submission[] = (data || []).map((s: any) => ({
            id: s.id,
            userId: s.usuario_id,
            userName: s.usuarios.nome_completo,
            companyName: s.usuarios.empresas?.nome_empresa || 'N/A',
            categoryId: s.categoria_id,
            categoryName: s.score_categorias?.nome || 'N/A',
            answers: s.respostas_jsonb || [],
            totalScore: s.pontuacao_total,
            maxScore: s.pontuacao_maxima,
            date: s.criado_em,
            detailedAnswers: s.respostas_detalhadas,
            photoUrl: s.usuarios.foto_url,
            phone: s.usuarios.telefone
        }));
        setEmployeeSubmissions(mappedSubmissions);
    } catch (error) {
        console.error("Error fetching employee submissions:", error);
    }
}, [currentUser]);

const addSubmission = useCallback(async (submission: Omit<Submission, 'id' | 'date'>) => {
    if (!currentUser || !questions.length) return;

    try {
        const detailedAnswersString = submission.answers.map(answer => {
            const question = questions.find(q => q.id === answer.questionId);
            if (!question) return `Pergunta ID ${answer.questionId} não encontrada.`;
            
            const selectedAnswer = question.answers.find(a => a.score === answer.score);
            const answerText = selectedAnswer ? selectedAnswer.text : `Resposta com score ${answer.score} não encontrada.`;

            return `Pergunta: ${question.text}\nResposta: ${answerText}`;
        }).join('\n\n');

        const submissionData = {
            usuario_id: submission.userId,
            categoria_id: submission.categoryId,
            empresa_id: currentUser.companyId,
            pontuacao_total: submission.totalScore,
            pontuacao_maxima: submission.maxScore,
            respostas_jsonb: submission.answers,
            respostas_detalhadas: detailedAnswersString,
        };

        const { error } = await supabase.from('score_envios').insert(submissionData);
        if (error) throw error;
        
        await Promise.all([fetchSubmissions(), fetchEmployeeScoresForAdmin()]);

    } catch (error) {
        console.error("Error adding submission:", error);
    }
}, [currentUser, questions, fetchSubmissions, fetchEmployeeScoresForAdmin]);
  
  const fetchAllRegisteredCompanies = useCallback(async () => {
    const { data, error } = await supabase.from('usuarios').select('*, empresas!fk_empresa(nome_empresa, codigo_empresa)').eq('funcao', UserRole.COMPANY).eq('status_aprovacao', 'aprovado').order('nome_completo');
    if (error) { console.error(error); return; }
    const companiesList: User[] = data.map((u: any) => ({
      id: u.id, name: u.nome_completo, companyName: u.empresas.nome_empresa, email: u.email, phone: u.telefone, passwordHash: '',
      role: UserRole.COMPANY, status: UserStatus.APPROVED, photoUrl: u.foto_url, companyCode: u.empresas.codigo_empresa, isActive: u.esta_ativo,
      state: u.estado,
    }));
    setAllRegisteredCompanies(companiesList);
  }, []);
  
  const deleteCompany = useCallback(async (companyToDelete: User): Promise<{ success: boolean; message: string; }> => {
      try {
          const { data: companyData, error: companyError } = await supabase.from('empresas').select('id').eq('proprietario_id', companyToDelete.id).single();
          if (companyError || !companyData) throw new Error('Empresa não encontrada.');
          
          const { data: employeeData, error: employeeError } = await supabase.from('usuarios').select('id').eq('empresa_id', companyData.id);
          if (employeeError) throw employeeError;
          
          const allUserIdsToDelete = [companyToDelete.id, ...(employeeData?.map(e => e.id) || [])];
          
          if (allUserIdsToDelete.length > 0) {
              const { error: deleteUsersError } = await supabase.from('usuarios').delete().in('id', allUserIdsToDelete);
              if (deleteUsersError) throw deleteUsersError;
          }
          
          const { error: deleteCompanyError } = await supabase.from('empresas').delete().eq('id', companyData.id);
          if (deleteCompanyError) throw deleteCompanyError;

          await fetchAllRegisteredCompanies();
          return { success: true, message: 'Empresa e todos os seus dados foram excluídos.' };
      } catch (error: any) {
          return { success: false, message: `Falha ao excluir empresa: ${error.message}` };
      }
  }, [fetchAllRegisteredCompanies]);

  const changePassword_internal = useCallback(async (userId: string, currentPassword: string, newPassword: string) => {
    const { data, error } = await supabase.from('usuarios').select('senha_hash').eq('id', userId).single();
    if (error || !data) return { success: false, message: 'Usuário não encontrado.' };
    if (data.senha_hash.trim() !== currentPassword.trim()) return { success: false, message: 'A senha atual está incorreta.' };
    const { error: updateError } = await supabase.from('usuarios').update({ senha_hash: newPassword }).eq('id', userId);
    if (updateError) return { success: false, message: 'Falha ao atualizar a senha.' };
    return { success: true, message: 'Senha alterada com sucesso!' };
  }, []);

  const changePassword = useCallback(async (user: User, currentPassword: string, newPassword: string) => {
      return changePassword_internal(user.id, currentPassword, newPassword);
  }, [changePassword_internal]);

  const changeAdminPassword = useCallback(async (userId: string, email: string, currentPassword: string, newPassword: string) => {
      return changePassword_internal(userId, currentPassword, newPassword);
  }, [changePassword_internal]);

  const changeGroupPassword = useCallback(async (user: User, currentPassword: string, newPassword: string) => {
      return changePassword_internal(user.id, currentPassword, newPassword);
  }, [changePassword_internal]);

  const updateUserProfilePhoto = useCallback(async (newPhotoBase64: string): Promise<{ success: boolean; message: string; }> => {
    if (!currentUser) {
        return { success: false, message: 'Usuário não autenticado.' };
    }

    try {
        if (!newPhotoBase64.startsWith('data:image/')) {
            return { success: false, message: 'Formato de imagem inválido.' };
        }

        const base64Response = await fetch(newPhotoBase64);
        const photoBlob = await base64Response.blob();
        
        const fileExtension = photoBlob.type.split('/')[1] || 'png';
        
        let folder = 'outros_usuarios';
        if (currentUser.role === UserRole.COMPANY) {
            folder = 'logos_empresas';
        } else if (currentUser.role === UserRole.EMPLOYEE) {
            folder = 'funcionarios';
        }

        const filePath = `${folder}/${currentUser.id}-${Date.now()}.${fileExtension}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('imagens')
            .upload(filePath, photoBlob, { contentType: photoBlob.type });

        if (uploadError) {
            throw new Error(`Falha ao carregar a foto: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage.from('imagens').getPublicUrl(uploadData.path);
        const newPhotoUrl = urlData.publicUrl;

        const { error: updateUserError } = await supabase
            .from('usuarios')
            .update({ foto_url: newPhotoUrl })
            .eq('id', currentUser.id);

        if (updateUserError) {
            throw new Error(`Falha ao atualizar o perfil: ${updateUserError.message}`);
        }

        const updatedUser = { ...currentUser, photoUrl: newPhotoUrl };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        return { success: true, message: 'Foto de perfil atualizada com sucesso!' };

    } catch (error) {
        console.error('Update profile photo error:', error);
        return { success: false, message: error instanceof Error ? `Erro: ${error.message}` : "Ocorreu um erro desconhecido." };
    }
  }, [currentUser]);

  const fetchGrupos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('grupos')
        .select(`
          id,
          nome_grupo,
          usuarios:responsavel_id (id, nome_completo, email),
          empresas_do_grupo ( empresas ( nome_empresa ) )
        `);

      if (error) throw error;

      const mappedGrupos: Grupo[] = data.map((g: any) => ({
        id: g.id,
        nome: g.nome_grupo,
        responsavel: {
          id: g.usuarios.id,
          nome: g.usuarios.nome_completo,
          email: g.usuarios.email,
        },
        empresas: g.empresas_do_grupo.map((e: any) => e.empresas.nome_empresa)
      }));
      setGrupos(mappedGrupos);
    } catch (error) {
      console.error('Error fetching grupos:', error);
      setGrupos([]);
    }
  }, []);

  const createGroup = useCallback(async (groupName: string, responsibleName: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
        return { success: false, message: 'Apenas administradores podem criar grupos.' };
    }
    try {
        const { data: existingUser, error: existingUserError } = await supabase.from('usuarios').select('id').eq('email', email).single();
        if (existingUser) {
            return { success: false, message: 'Já existe um usuário com este e-mail.' };
        }
        if (existingUserError && existingUserError.code !== 'PGRST116') throw existingUserError;

        const { data: newUserData, error: newUserError } = await supabase.from('usuarios').insert({
            nome_completo: responsibleName, email: email, senha_hash: password, funcao: UserRole.GROUP,
            status_aprovacao: 'aprovado', esta_ativo: true, aprovado_por_id: currentUser.id,
            aprovado_em: new Date().toISOString(),
        }).select('id').single();

        if (newUserError || !newUserData) throw newUserError || new Error("Falha ao criar o usuário responsável.");
        const responsibleId = newUserData.id;

        const { error: newGroupError } = await supabase.from('grupos').insert({ nome_grupo: groupName, responsavel_id: responsibleId });
        if (newGroupError) {
            await supabase.from('usuarios').delete().eq('id', responsibleId);
            throw newGroupError;
        }

        await fetchGrupos();
        return { success: true, message: 'Grupo criado com sucesso!' };
    } catch (error: any) {
        console.error("Error creating group:", error);
        return { success: false, message: `Falha ao criar grupo: ${error.message || 'Erro desconhecido.'}` };
    }
  }, [currentUser, fetchGrupos]);

  const updateGroup = useCallback(async (originalGroup: Grupo, newData: { nome: string; responsavelNome: string; responsavelEmail: string }): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) return { success: false, message: 'Apenas administradores podem editar grupos.' };
    try {
        if (originalGroup.nome !== newData.nome) {
            const { error } = await supabase.from('grupos').update({ nome_grupo: newData.nome }).eq('id', originalGroup.id);
            if (error) throw error;
        }
        if (originalGroup.responsavel.nome !== newData.responsavelNome || originalGroup.responsavel.email !== newData.responsavelEmail) {
             const { error } = await supabase.from('usuarios').update({ nome_completo: newData.responsavelNome, email: newData.responsavelEmail }).eq('id', originalGroup.responsavel.id);
             if (error) throw error;
        }
        await fetchGrupos();
        return { success: true, message: 'Grupo atualizado com sucesso!' };
    } catch (error: any) {
        console.error("Error updating group:", error);
        return { success: false, message: `Falha ao atualizar o grupo: ${error.message}` };
    }
  }, [currentUser, fetchGrupos]);

  const deleteGroup = useCallback(async (groupToDelete: Grupo): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) return { success: false, message: 'Apenas administradores podem excluir grupos.' };
    try {
        const { error: deleteGroupError } = await supabase.from('grupos').delete().eq('id', groupToDelete.id);
        if (deleteGroupError) throw deleteGroupError;
        const { error: deleteUserError } = await supabase.from('usuarios').delete().eq('id', groupToDelete.responsavel.id);
        if (deleteUserError) {
            console.error(`CRITICAL: Group ${groupToDelete.id} deleted, but failed to delete user ${groupToDelete.responsavel.id}. Error: ${deleteUserError.message}`);
            return { success: false, message: `Grupo excluído, mas falha ao remover usuário. Contate suporte. Erro: ${deleteUserError.message}` };
        }
        await fetchGrupos();
        return { success: true, message: 'Grupo e usuário responsável excluídos com sucesso!' };
    } catch (error: any) {
        console.error("Error deleting group:", error);
        return { success: false, message: `Falha ao excluir o grupo: ${error.message}` };
    }
  }, [currentUser, fetchGrupos]);

  const addCompaniesToGroup = useCallback(async (groupId: string, companyNames: string[]): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) return { success: false, message: 'Apenas administradores podem adicionar empresas.' };
    try {
        if (companyNames.length === 0) return { success: true, message: 'Nenhuma empresa selecionada.' };
        const { data: companiesData, error: companiesError } = await supabase.from('empresas').select('id, nome_empresa').in('nome_empresa', companyNames);
        if (companiesError) throw companiesError;
        if (!companiesData || companiesData.length === 0) return { success: false, message: 'Nenhuma das empresas selecionadas foi encontrada.' };
        const linksToCreate = companiesData.map(company => ({ grupo_id: groupId, empresa_id: company.id }));
        const { error: insertError } = await supabase.from('empresas_do_grupo').insert(linksToCreate);
        if (insertError) {
            if (insertError.code === '23505') return { success: false, message: 'Uma ou mais empresas já pertencem a este grupo.' };
            throw insertError;
        }
        await fetchGrupos();
        return { success: true, message: `${linksToCreate.length} empresa(s) adicionada(s) com sucesso!` };
    } catch (error: any) {
        console.error("Error adding companies to group:", error);
        return { success: false, message: `Falha ao adicionar empresas: ${error.message}` };
    }
  }, [currentUser, fetchGrupos]);

  const removeCompanyFromGroup = useCallback(async (groupId: string, companyName: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) return { success: false, message: 'Apenas administradores podem remover empresas.' };
    try {
        const { data: companyData, error: companyError } = await supabase.from('empresas').select('id').eq('nome_empresa', companyName).single();
        if (companyError || !companyData) throw new Error(`Empresa "${companyName}" não encontrada.`);
        const { error: deleteError } = await supabase.from('empresas_do_grupo').delete().match({ grupo_id: groupId, empresa_id: companyData.id });
        if (deleteError) throw deleteError;
        await fetchGrupos();
        return { success: true, message: `Empresa "${companyName}" removida do grupo com sucesso.` };
    } catch (error: any) {
        console.error("Error removing company from group:", error);
        return { success: false, message: `Falha ao remover empresa: ${error.message}` };
    }
  }, [currentUser, fetchGrupos]);


  // Placeholders for remaining functions to avoid breaking the app
  const fetchAllEmployees = useCallback(async () => {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*, empresas!fk_empresa(nome_empresa, codigo_empresa)')
            .eq('funcao', UserRole.EMPLOYEE)
            .eq('status_aprovacao', 'aprovado')
            .order('nome_completo', { ascending: true });

        if (error) throw error;

        const employees: User[] = (data || []).map((dbUser: any) => ({
            id: dbUser.id,
            name: dbUser.nome_completo,
            companyName: dbUser.empresas?.nome_empresa || 'N/A',
            companyCode: dbUser.empresas?.codigo_empresa || undefined,
            email: dbUser.email,
            phone: dbUser.telefone,
            passwordHash: '',
            role: UserRole.EMPLOYEE,
            status: dbUser.status_aprovacao as UserStatus,
            photoUrl: dbUser.foto_url,
            position: dbUser.cargo,
            companyId: dbUser.empresa_id,
            isActive: dbUser.esta_ativo,
            state: dbUser.estado,
        }));
        setAllEmployees(employees);
    } catch (error) {
        console.error('Error fetching all employees:', error);
        setAllEmployees([]);
    }
  }, []);
  const fetchNeuroData = useCallback(async () => {}, []);
  const fetchNeuroSubmissions = useCallback(async () => {}, []);
  const fetchNeuroAnalysisResults = useCallback(async () => {}, []);
  const fetchCompanyNeuroAnalysisResults = useCallback(async () => {}, []);
  const fetchOralTestResults = useCallback(async () => {}, []);
  
  const updateUserIsActive = useCallback(async (userId: string, isActive: boolean): Promise<{ success: boolean; message: string; }> => {
    try {
        const { error } = await supabase.from('usuarios').update({ esta_ativo: isActive }).eq('id', userId);
        if (error) throw error;

        await fetchAllRegisteredCompanies();
        await fetchAllEmployees();

        const statusText = isActive ? 'ativado(a)' : 'desativado(a)';
        return { success: true, message: `Usuário ${statusText} com sucesso.` };
    } catch (error: any) {
        return { success: false, message: `Falha ao atualizar status: ${error.message}` };
    }
  }, [fetchAllRegisteredCompanies, fetchAllEmployees]);

  const toggleEmployeeActiveStatus = useCallback(async (userToToggle: User, newIsActive: boolean): Promise<{ success: boolean; message: string; }> => {
      return updateUserIsActive(userToToggle.id, newIsActive);
  }, [updateUserIsActive]);


  const contextValue = React.useMemo(() => ({
    currentUser, users, admins, allEmployees, categories, segmentos, questions, submissions, employeeSubmissions, loading, logs,
    neuroQuestions, neuroCategories, neuroSubmissions, neuroAnalysisResults, companyNeuroAnalysisResults,
    oralTestResults, selectedCompany, allRegisteredCompanies, grupos, selectCompany,
    login, logout, register, registerEmployee, updateUserStatus, addCategory, updateCategory, deleteCategory,
    addSegmento, updateSegmento, deleteSegmento,
    addQuestion, updateQuestion, deleteQuestion, addSubmission, addAdmin, updateAdmin, deleteAdmin, deleteCompany,
    changePassword, changeAdminPassword, changeGroupPassword, fetchAdminQuestionnaireData, fetchAdmins, fetchPendingUsers, approveUser, rejectUser, fetchApprovedUsersLogs,
    updateUserProfilePhoto,
    fetchLoginLogs,
    fetchSubmissions,
    fetchEmployeeScoresForAdmin,
    fetchAllEmployees,
    fetchNeuroData,
    fetchSegmentos,
    fetchGrupos,
    addNeuroMapaSubmission,
    fetchNeuroSubmissions,
    fetchNeuroAnalysisResults,
    fetchCompanyNeuroAnalysisResults,
    fetchOralTestResults,
    startOralTest,
    fetchAllRegisteredCompanies,
    updateUserIsActive,
    toggleEmployeeActiveStatus,
    createGroup, updateGroup, deleteGroup, addCompaniesToGroup, removeCompanyFromGroup
  }), [
    currentUser, users, admins, allEmployees, categories, segmentos, questions, submissions, employeeSubmissions, loading, logs,
    neuroQuestions, neuroCategories, neuroSubmissions, neuroAnalysisResults, companyNeuroAnalysisResults,
    oralTestResults, selectedCompany, allRegisteredCompanies, grupos, selectCompany,
    login, logout, register, registerEmployee, updateUserStatus, addCategory, updateCategory, deleteCategory,
    addSegmento, updateSegmento, deleteSegmento,
    addQuestion, updateQuestion, deleteQuestion, addSubmission, addAdmin, updateAdmin, deleteAdmin, deleteCompany,
    changePassword, changeAdminPassword, changeGroupPassword, fetchAdminQuestionnaireData, fetchAdmins, fetchPendingUsers, approveUser, rejectUser, fetchApprovedUsersLogs,
    updateUserProfilePhoto,
    fetchLoginLogs,
    fetchSubmissions,
    fetchEmployeeScoresForAdmin,
    fetchAllEmployees,
    fetchNeuroData,
    fetchSegmentos,
    fetchGrupos,
    addNeuroMapaSubmission,
    fetchNeuroSubmissions,
    fetchNeuroAnalysisResults,
    fetchCompanyNeuroAnalysisResults,
    fetchOralTestResults,
    startOralTest,
    fetchAllRegisteredCompanies,
    updateUserIsActive,
    toggleEmployeeActiveStatus,
    createGroup, updateGroup, deleteGroup, addCompaniesToGroup, removeCompanyFromGroup
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};