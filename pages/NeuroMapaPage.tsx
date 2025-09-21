

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Question, UserRole, AnswerOption, User, Submission, UserStatus, Category, NeuroAnalysisResult } from '../types';
import { useApp } from '../hooks/useApp';
import ConfirmationModal from '../components/ConfirmationModal';

// Icons for local use, ensuring no other files are touched.
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);
const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);
const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);
const CancelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const getIconForSection = (title: string): React.ReactNode => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('persona')) return <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-300 analysis-icon" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg>;
    if (lowerTitle.includes('motivador')) return <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-amber-300 analysis-icon" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>;
    if (lowerTitle.includes('fricção')) return <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-400 analysis-icon" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>;
    if (lowerTitle.includes('linguagem')) return <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-emerald-300 analysis-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1z" /></svg>;
    if (lowerTitle.includes('bloqueio')) return <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-fuchsia-300 analysis-icon" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>;
    if (lowerTitle.includes('recomendação')) return <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-300 analysis-icon" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" /></svg>;
    if (lowerTitle.includes('conclusão')) return <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-400 analysis-icon" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 18.5a11.954 11.954 0 007.834-13.501l-4.95-4.95a1.5 1.5 0 00-2.122 0l-4.95 4.95zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>;
    if (lowerTitle.includes('insight')) return <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-violet-300 analysis-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>;
    if (lowerTitle.includes('agente') || lowerTitle.includes('identidade')) return <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-400 analysis-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0114.5 16c1.255 0 2.443-.29 3.5.804v-10A7.968 7.968 0 0014.5 4z" /></svg>;
    return <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-400 analysis-icon" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" /></svg>;
};

const AnalysisResultModal: React.FC<{ analysis: NeuroAnalysisResult | null; onClose: () => void }> = ({ analysis, onClose }) => {
    const sections = useMemo(() => {
        if (!analysis?.resultado) return [];
        const text = analysis.resultado;
        const headersRegex = /(ANÁLISE TRIAD3:.*|NOME DA PERSONA \(TÉCNICO E SIMBÓLICO\)|NÚCLEO MOTIVADOR PRIMÁRIO|ESTRUTURA DE DEFESA \/ FRICÇÃO MAIOR|MAPA DE LINGUAGEM FUNCIONAL \/ ESTILO DE ABORDAGEM|ZONA DE BLOQUEIO OCULTO OU AUTOCENSURA|RECOMENDAÇÃO TRIAD3 PARA EXPANSÃO OU TREINAMENTO|CONCLUSÃO|INSIGHT PARA CRIAÇÃO DE AGENTE PERSONIFICADO BASEADO NESSA MENTE|🧠 IDENTIDADE DO AGENTE)/;
        const parts = text.split(headersRegex).filter(part => part && part.trim() !== '');
        const result = [];
        for (let i = 0; i < parts.length; i += 2) {
            if (parts[i+1]) {
                // Correctly pair content (parts[i]) with its following title (parts[i+1])
                result.push({ title: parts[i+1].trim(), content: parts[i].trim(), icon: getIconForSection(parts[i+1].trim()) });
            } else {
                // Handle any trailing content without a title
                result.push({ title: "Conclusão", content: parts[i].trim(), icon: getIconForSection("Conclusão") });
            }
        }
        return result.length > 0 ? result : [{ title: "Resultado da Análise", content: text, icon: getIconForSection("Resultado da Análise") }];
    }, [analysis]);

    const renderContent = (content: string) => {
        const processedContent = content.replace(/^([A-Za-z\s()ÁÉÍÓÚÇ/]+:)/gm, '<strong>$1</strong>');
        return <div className="analysis-content" dangerouslySetInnerHTML={{ __html: processedContent.replace(/\n/g, '<p></p>') }} />;
    };
    
    if (!analysis) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-dark-card rounded-xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col border border-dark-border" onClick={e => e.stopPropagation()}>
                <div className="p-6 flex-shrink-0 border-b border-dark-border flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        {analysis.foto && <img src={analysis.foto} alt={analysis.nome} className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400" />}
                        <div>
                            <h2 className="text-2xl font-bold text-cyan-400">{analysis.nome}</h2>
                            <p className="text-gray-400">{analysis.empresa}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                    <div className="analysis-container">
                        <div className="space-y-6">
                            {sections.map((section, index) => (
                                <div key={index} className="analysis-card">
                                    <h3 className="analysis-title">{section.icon}<span className="flex-grow">{section.title}</span></h3>
                                    {renderContent(section.content)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// We need to define a local Question type that includes our new properties.
interface NeuroQuestion extends Question {
    isOpenEnded?: boolean;
    targetScope?: 'all' | 'specific' | 'multiple' | 'company_all_employees';
    targetId?: string | null;
    targetIds?: string[];
    targetName?: string | null;
    targetNames?: string[];
    targetEmployee?: User | null;
    targetEmployees?: User[];
}

type NeuroCategoryTarget = UserRole.COMPANY | UserRole.EMPLOYEE | 'ambos';

interface NeuroCategory extends Category {
    targetRole: NeuroCategoryTarget;
}

const CategoryManager = ({
    categories,
    isLoading,
    onAddRequest,
    onUpdateRequest,
    onDeleteRequest,
}: {
    categories: NeuroCategory[];
    isLoading: boolean;
    onAddRequest: (name: string, targetRole: NeuroCategoryTarget) => void;
    onUpdateRequest: (id: string, updates: { newName: string; newTargetRole: NeuroCategoryTarget; }) => void;
    onDeleteRequest: (id: string) => void;
}) => {
    const [categoryTarget, setCategoryTarget] = useState<NeuroCategoryTarget>(UserRole.COMPANY);
    const [newCategory, setNewCategory] = useState('');
    const [editingState, setEditingState] = useState<{ id: string; name: string; targetRole: NeuroCategoryTarget; } | null>(null);

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = newCategory.trim();
        if (trimmedName) {
            if (categories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase() && c.targetRole === categoryTarget)) {
                alert('A categoria já existe para este público-alvo.');
                return;
            }
            onAddRequest(trimmedName, categoryTarget);
            setNewCategory('');
        } else {
            alert('O nome da categoria não pode estar vazio.');
        }
    };

    const handleEdit = (category: NeuroCategory) => {
        setEditingState({ id: category.id, name: category.name, targetRole: category.targetRole });
    };

    const handleCancelEdit = () => {
        setEditingState(null);
    };

    const handleSaveEdit = () => {
        if (editingState && editingState.name.trim()) {
            onUpdateRequest(editingState.id, { newName: editingState.name.trim(), newTargetRole: editingState.targetRole });
            handleCancelEdit();
        }
    };
    
    const handleDelete = (id: string) => {
        onDeleteRequest(id);
    };

    const filteredCategories = useMemo(() => {
        return categories.filter(c => c.targetRole === categoryTarget);
    }, [categories, categoryTarget]);


    return (
        <div className="bg-dark-card p-6 rounded-xl shadow-md border border-dark-border">
            <h3 className="text-xl font-semibold mb-4">Gerenciar Categorias do NeuroMapa</h3>
            
             <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Público-Alvo da Categoria:</label>
                <div className="grid grid-cols-3 bg-dark-background p-1 rounded-full border border-dark-border">
                    <button
                        type="button"
                        onClick={() => setCategoryTarget(UserRole.COMPANY)}
                        disabled={!!editingState}
                        className={`py-2 text-sm font-semibold rounded-full transition-all duration-300 ${categoryTarget === UserRole.COMPANY ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:text-white'} disabled:opacity-50`}
                    >
                        Empresas
                    </button>
                    <button
                        type="button"
                        onClick={() => setCategoryTarget(UserRole.EMPLOYEE)}
                        disabled={!!editingState}
                        className={`py-2 text-sm font-semibold rounded-full transition-all duration-300 ${categoryTarget === UserRole.EMPLOYEE ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:text-white'} disabled:opacity-50`}
                    >
                        Funcionários
                    </button>
                    <button
                        type="button"
                        onClick={() => setCategoryTarget('ambos')}
                        disabled={!!editingState}
                        className={`py-2 text-sm font-semibold rounded-full transition-all duration-300 ${categoryTarget === 'ambos' ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:text-white'} disabled:opacity-50`}
                    >
                        Ambos
                    </button>
                </div>
            </div>

            <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2 mb-6 pb-6 border-b border-dark-border">
                <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Nome da nova categoria" className="flex-grow px-3 py-2 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="w-full sm:w-auto px-4 py-2 font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all">Adicionar</button>
            </form>
            <h4 className="font-semibold mb-3">Categorias para {categoryTarget === UserRole.COMPANY ? 'Empresas' : (categoryTarget === UserRole.EMPLOYEE ? 'Funcionários' : 'Ambos')}</h4>
            {isLoading ? (
                 <p className="text-gray-400 text-center py-4">Carregando categorias...</p>
            ) : (
                <ul className="space-y-2">
                    {filteredCategories.length > 0 ? filteredCategories.map(cat => (
                        <li key={cat.id} className="p-3 bg-dark-background rounded-lg border border-dark-border flex items-center justify-between gap-2">
                            {editingState?.id === cat.id ? (
                                <div className="flex-grow space-y-2">
                                    <input type="text" value={editingState.name} onChange={e => setEditingState(s => s ? {...s, name: e.target.value} : null)} className="w-full px-2 py-1 border border-dark-border rounded-md bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
                                    <select value={editingState.targetRole} onChange={e => setEditingState(s => s ? {...s, targetRole: e.target.value as NeuroCategoryTarget} : null)} className="w-full p-2 border border-dark-border rounded-lg bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value={UserRole.COMPANY}>Empresas</option>
                                        <option value={UserRole.EMPLOYEE}>Funcionários</option>
                                        <option value="ambos">Ambos</option>
                                    </select>
                                </div>
                            ) : (
                               <span className="flex-grow">{cat.name}</span>
                            )}
                            
                            <div className="flex items-center gap-2 shrink-0">
                               {editingState?.id === cat.id ? (
                                    <>
                                        <button onClick={handleSaveEdit} className="text-green-500 hover:text-green-700"><SaveIcon /></button>
                                        <button onClick={handleCancelEdit} className="text-red-500 hover:text-red-700"><CancelIcon /></button>
                                    </>
                               ) : (
                                    <>
                                        <button onClick={() => handleEdit(cat)} className="text-blue-500 hover:text-blue-700"><EditIcon /></button>
                                        <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700"><DeleteIcon /></button>
                                    </>
                               )}
                            </div>
                        </li>
                    )) : <p className="text-gray-400 text-center py-4">Nenhuma categoria criada para este público.</p>}
                </ul>
            )}
        </div>
    );
};

const QuestionManager = ({ 
    questions, 
    categories,
    isLoadingCategories,
    isLoadingQuestions,
    allEmployees,
    companies,
    questionQueue,
    setQuestionQueue,
    onBatchSubmit,
    onUpdateRequest,
    onDeleteRequest,
    onViewRequest
}: { 
    questions: NeuroQuestion[], 
    categories: NeuroCategory[],
    isLoadingCategories: boolean,
    isLoadingQuestions: boolean,
    allEmployees: User[],
    companies: User[],
    questionQueue: any[],
    setQuestionQueue: React.Dispatch<React.SetStateAction<any[]>>,
    onBatchSubmit: () => void,
    onUpdateRequest: (payload: any) => void,
    onDeleteRequest: (payload: any) => void,
    onViewRequest: (question: NeuroQuestion) => void
}) => {
    const [questionTarget, setQuestionTarget] = useState<UserRole.COMPANY | UserRole.EMPLOYEE>(UserRole.COMPANY);
    const [editingQuestion, setEditingQuestion] = useState<NeuroQuestion | null>(null);

    // Form state
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [questionText, setQuestionText] = useState('');
    const [isQuestionOpenEnded, setIsQuestionOpenEnded] = useState(false);
    const [answers, setAnswers] = useState<{ text: string }[]>([{ text: '' }]);
    const [targetScope, setTargetScope] = useState<'all' | 'specific' | 'multiple' | 'company_all_employees'>('all');
    const [specificTargetId, setSpecificTargetId] = useState<string>('');
    const [specificTargetIds, setSpecificTargetIds] = useState<string[]>([]);
    const [selectedCompanyForFilter, setSelectedCompanyForFilter] = useState('');
    const [selectedEmployeePhoto, setSelectedEmployeePhoto] = useState<string | null>(null);
    
    const filteredEmployees = useMemo(() => {
        if (!selectedCompanyForFilter) return [];
        const companyData = companies.find(c => c.id === selectedCompanyForFilter);
        const selectedCompanyName = companyData?.companyName;
        if (!selectedCompanyName) return [];
        return allEmployees.filter(emp => emp.companyName === selectedCompanyName);
    }, [allEmployees, companies, selectedCompanyForFilter]);
    
    const employeesByCompany = useMemo(() => {
        return allEmployees.reduce((acc, employee) => {
            const companyName = employee.companyName || 'Sem Empresa';
            if (!acc[companyName]) {
                acc[companyName] = [];
            }
            acc[companyName].push(employee);
            return acc;
        }, {} as Record<string, User[]>);
    }, [allEmployees]);
    
    const companiesWithEmployees = useMemo(() => {
      const companyNamesWithEmployees = new Set(allEmployees.map(e => e.companyName));
      return companies.filter(c => companyNamesWithEmployees.has(c.companyName));
    }, [allEmployees, companies]);


    const resetQuestionFields = () => {
        setQuestionText('');
        setIsQuestionOpenEnded(false);
        setAnswers([{ text: '' }]);
    };
    
    const resetFullForm = () => {
        setEditingQuestion(null);
        setSelectedCategoryId('');
        setQuestionText('');
        setIsQuestionOpenEnded(false);
        setAnswers([{ text: '' }]);
        setTargetScope('all');
        setSpecificTargetId('');
        setSpecificTargetIds([]);
        setSelectedCompanyForFilter('');
        setSelectedEmployeePhoto(null);
    };

    useEffect(() => {
        if (editingQuestion) {
            const employeeTarget = allEmployees.find(e => e.id === editingQuestion.targetId);
            
            setSelectedCategoryId(editingQuestion.categoryId);
            setQuestionText(editingQuestion.text);
            setIsQuestionOpenEnded(!!editingQuestion.isOpenEnded);
            setAnswers(editingQuestion.isOpenEnded ? [{ text: '' }] : editingQuestion.answers.map(a => ({ text: a.text })));
            setQuestionTarget(editingQuestion.targetRole);
            setTargetScope(editingQuestion.targetScope || 'all');
            
            if (editingQuestion.targetScope === 'company_all_employees') {
                setSpecificTargetId(editingQuestion.targetId || '');
            } else {
                setSpecificTargetId(editingQuestion.targetId || '');
                setSpecificTargetIds(editingQuestion.targetIds || []);
            }
            
            if (editingQuestion.targetRole === UserRole.EMPLOYEE && employeeTarget) {
                 const companyOfEmployee = companiesWithEmployees.find(c => c.companyName === employeeTarget.companyName);
                 setSelectedCompanyForFilter(companyOfEmployee?.id || '');
                 setSelectedEmployeePhoto(employeeTarget.photoUrl || null);
            } else {
                 setSelectedCompanyForFilter('');
                 setSelectedEmployeePhoto(null);
            }

        } else {
            resetFullForm();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingQuestion]);
    
    useEffect(() => {
        setTargetScope('all');
        setSpecificTargetId('');
        setSpecificTargetIds([]);
        setSelectedCategoryId('');
        setSelectedCompanyForFilter('');
        setSelectedEmployeePhoto(null);
    }, [questionTarget]);

    const handleAddAnswer = () => setAnswers([...answers, { text: '' }]);

    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...answers];
        newAnswers[index].text = value;
        setAnswers(newAnswers);
    };
    
    const handleRemoveAnswer = (indexToRemove: number) => {
        setAnswers(prev => prev.filter((_, index) => index !== indexToRemove));
    };
    
    const handleMultiSelectChange = (targetId: string) => {
        setSpecificTargetIds(prev =>
            prev.includes(targetId)
                ? prev.filter(id => id !== targetId)
                : [...prev, targetId]
        );
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedCategoryId) {
            alert('Por favor, selecione uma categoria.');
            return;
        }
        if (!questionText.trim()) {
            alert('Por favor, preencha o texto da pergunta.');
            return;
        }
        if (!isQuestionOpenEnded && !answers.every(a => a.text.trim())) {
             alert('Por favor, preencha todas as opções de resposta.');
            return;
        }
        if ((targetScope === 'specific' || targetScope === 'company_all_employees') && !specificTargetId) {
            alert('Por favor, selecione um alvo específico.');
            return;
        }
        if (targetScope === 'multiple' && specificTargetIds.length === 0) {
            alert('Por favor, selecione pelo menos um alvo.');
            return;
        }

        let targetIdForState: string | null = null;
        let targetNameForState: string | null = null;
        let targetEmployee: User | undefined;
        let targetEmployees: User[] | undefined;
        let targetNamesForState: string[] | undefined;

        if (targetScope === 'specific' || targetScope === 'company_all_employees') {
            targetIdForState = specificTargetId;
            let target;
            if (targetScope === 'company_all_employees') {
                target = companies.find(c => c.id === specificTargetId);
                targetNameForState = target?.companyName || null;
            } else { // 'specific' logic
                const targetList = questionTarget === UserRole.COMPANY ? companies : allEmployees;
                target = targetList.find(u => u.id === specificTargetId);
                targetNameForState = questionTarget === UserRole.COMPANY ? target?.companyName || null : target?.name || null;
                if (questionTarget === UserRole.EMPLOYEE) {
                    targetEmployee = target;
                }
            }
        } else if (targetScope === 'multiple') {
            const targetList = questionTarget === UserRole.COMPANY ? companies : allEmployees;
            const selectedTargets = targetList.filter(u => specificTargetIds.includes(u.id));
            targetNamesForState = selectedTargets.map(t => questionTarget === UserRole.COMPANY ? t.companyName : t.name);
            if(questionTarget === UserRole.EMPLOYEE) {
                targetEmployees = selectedTargets;
            }
        }
        
        const category = categories.find(c => c.id === selectedCategoryId);

        const commonPayload = {
            categoryId: selectedCategoryId,
            categoryName: category?.name || 'N/A',
            text: questionText,
            isOpenEnded: isQuestionOpenEnded,
            answers: isQuestionOpenEnded ? [] : answers.map((a, i) => ({ id: `ans-${Date.now()}-${i}`, text: a.text, score: 0 })),
            targetRole: questionTarget,
            targetScope,
            targetId: targetIdForState,
            targetIds: specificTargetIds,
            targetName: targetNameForState,
            targetNames: targetNamesForState,
            targetEmployee,
            targetEmployees,
        };

        if (editingQuestion) {
            onUpdateRequest({
                ...commonPayload,
                id: editingQuestion.id, // Important: pass the original ID
                type: 'edit-question'
            });
            resetFullForm();
        } else {
            setQuestionQueue(prev => [...prev, commonPayload]);
            resetQuestionFields();
        }
    };
    
    const handleRemoveFromQueue = (indexToRemove: number) => {
        setQuestionQueue(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const filteredQuestions = useMemo(() => {
        return questions.filter(q => q.targetRole === questionTarget);
    }, [questions, questionTarget]);

    const availableCategories = useMemo(() => {
        return categories.filter(c => c.targetRole === questionTarget || c.targetRole === 'ambos');
    }, [categories, questionTarget]);

    const getTargetDisplay = (q: NeuroQuestion) => {
        if (q.targetScope === 'company_all_employees') {
            return `Todos da ${q.targetName || 'Empresa Específica'}`;
        }
        if (q.targetScope === 'multiple') return `Múltiplos (${q.targetIds?.length || 0})`;
        if (q.targetScope === 'all') return 'Todos(as)';
        if (q.targetRole === UserRole.EMPLOYEE) {
            const employeeName = q.targetEmployee?.name || q.targetName || 'Específico';
            const companyName = q.targetEmployee?.companyName || 'Empresa Desconhecida';
            return `${employeeName} (${companyName})`;
        }
        return q.targetName || 'Específico';
    };

    return (
        <div className="space-y-8">
            <div className="bg-dark-card p-6 rounded-xl shadow-md border border-dark-border">
                <h3 className="text-xl font-semibold mb-4">{editingQuestion ? 'Editando Pergunta' : 'Adicionar Perguntas'}</h3>
                
                <form onSubmit={handleFormSubmit} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Público-Alvo:</label>
                            <div className="flex items-center justify-center bg-dark-background p-1 rounded-full border border-dark-border">
                                <button
                                    type="button"
                                    onClick={() => setQuestionTarget(UserRole.COMPANY)}
                                    disabled={!!editingQuestion || questionQueue.length > 0}
                                    className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${questionTarget === UserRole.COMPANY ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:text-white'} disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed`}
                                >
                                    Empresas
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setQuestionTarget(UserRole.EMPLOYEE)}
                                    disabled={!!editingQuestion || questionQueue.length > 0}
                                    className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${questionTarget === UserRole.EMPLOYEE ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:text-white'} disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed`}
                                >
                                    Funcionários
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Categoria:</label>
                            <select 
                                value={selectedCategoryId}
                                onChange={e => setSelectedCategoryId(e.target.value)}
                                className="w-full p-2.5 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={isLoadingCategories || !!editingQuestion || questionQueue.length > 0}
                            >
                                <option value="" disabled>
                                    {isLoadingCategories ? "Carregando categorias..." : "-- Selecione uma categoria --"}
                                </option>
                                {!isLoadingCategories && availableCategories.length > 0 ? (
                                    availableCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)
                                ) : !isLoadingCategories ? (
                                    <option disabled>Nenhuma categoria para este público</option>
                                ) : null}
                            </select>
                        </div>
                    </div>

                     <div className="pt-2">
                           <label className="block text-sm font-medium text-gray-300 mb-2">Direcionamento:</label>
                            <select 
                                value={targetScope} 
                                onChange={(e) => setTargetScope(e.target.value as any)}
                                className="w-full p-2.5 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!!editingQuestion || questionQueue.length > 0}
                            >
                                <option value="all">Todos(as) os(as) {questionTarget === UserRole.COMPANY ? 'Empresas' : 'Funcionários'}</option>
                                <option value="specific">{questionTarget === UserRole.COMPANY ? 'Empresa' : 'Funcionário'} Específico(a)</option>
                                <option value="multiple">{questionTarget === UserRole.COMPANY ? 'Múltiplas Empresas' : 'Múltiplos Funcionários'}</option>
                                {questionTarget === UserRole.EMPLOYEE && (
                                    <option value="company_all_employees">Todos os funcionários de uma empresa específica</option>
                                )}
                            </select>
                        </div>
                    
                    {targetScope === 'company_all_employees' && questionTarget === UserRole.EMPLOYEE && (
                        <div className="space-y-4 p-4 bg-dark-background/50 rounded-lg border border-dark-border">
                             <label className="block text-sm font-medium text-gray-300">Selecione a Empresa:</label>
                             <select 
                                value={specificTargetId} 
                                onChange={(e) => setSpecificTargetId(e.target.value)}
                                className="w-full p-2 border border-dark-border rounded-lg bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={!!editingQuestion || questionQueue.length > 0}
                            >
                                <option value="" disabled>-- Selecione uma empresa --</option>
                                {companies.map(company => (
                                    <option key={company.id} value={company.id}>{company.companyName}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    {targetScope === 'specific' && (
                        <div className="space-y-4 p-4 bg-dark-background/50 rounded-lg border border-dark-border">
                            {questionTarget === UserRole.EMPLOYEE && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">1. Selecione a Empresa:</label>
                                    <select 
                                        value={selectedCompanyForFilter} 
                                        onChange={(e) => {
                                            setSelectedCompanyForFilter(e.target.value);
                                            setSpecificTargetId('');
                                            setSelectedEmployeePhoto(null);
                                        }}
                                        className="w-full p-2 border border-dark-border rounded-lg bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        disabled={!!editingQuestion || questionQueue.length > 0}
                                    >
                                        <option value="" disabled>-- Selecione uma empresa --</option>
                                        {companiesWithEmployees.map(item => (
                                            <option key={item.id} value={item.id}>{item.companyName}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {(questionTarget === UserRole.COMPANY || (questionTarget === UserRole.EMPLOYEE && selectedCompanyForFilter)) && (
                                <div>
                                   <label className="block text-sm font-medium text-gray-300 mb-2">
                                       {questionTarget === UserRole.EMPLOYEE ? '2. Selecione o Funcionário:' : 'Selecione a Empresa:'}
                                   </label>
                                   <select 
                                        value={specificTargetId} 
                                        onChange={(e) => {
                                            const newId = e.target.value;
                                            setSpecificTargetId(newId);
                                            if (questionTarget === UserRole.EMPLOYEE) {
                                                const photoUrl = allEmployees.find(emp => emp.id === newId)?.photoUrl;
                                                setSelectedEmployeePhoto(photoUrl || null);
                                            }
                                        }}
                                        className="w-full p-2 border border-dark-border rounded-lg bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        disabled={!!editingQuestion || questionQueue.length > 0}
                                    >
                                        <option value="" disabled>-- Selecione --</option>
                                        {(questionTarget === UserRole.COMPANY ? companies : filteredEmployees).map(item => (
                                            <option key={item.id} value={item.id}>
                                              {item.role === UserRole.COMPANY ? item.companyName : item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                             {selectedEmployeePhoto && (
                                <div className="flex justify-center pt-2">
                                    <img src={selectedEmployeePhoto} alt="Foto do funcionário" className="w-24 h-24 rounded-full object-cover border-2 border-cyan-400" />
                                </div>
                            )}
                        </div>
                    )}
                    
                     {targetScope === 'multiple' && (
                        <div className="space-y-4 p-4 bg-dark-background/50 rounded-lg border border-dark-border">
                           <h4 className="font-semibold text-gray-300">Selecione os Alvos:</h4>
                           <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                              {questionTarget === UserRole.COMPANY ? (
                                companies.map(company => (
                                    <label key={company.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-dark-border/50 cursor-pointer">
                                        <input type="checkbox" checked={specificTargetIds.includes(company.id)} onChange={() => handleMultiSelectChange(company.id)} className="h-4 w-4 rounded border-gray-300 bg-gray-700 text-cyan-600 focus:ring-cyan-500 shrink-0"/>
                                        <span>{company.companyName}</span>
                                    </label>
                                ))
                              ) : (
                                Object.entries(employeesByCompany).map(([companyName, employees]) => (
                                    <div key={companyName}>
                                        <h5 className="font-semibold text-cyan-400 mb-2 sticky top-0 bg-dark-background/50 py-1">{companyName}</h5>
                                        <div className="pl-4 space-y-2">
                                           {employees.map(employee => (
                                              <label key={employee.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-dark-border/50 cursor-pointer">
                                                 <input type="checkbox" checked={specificTargetIds.includes(employee.id)} onChange={() => handleMultiSelectChange(employee.id)} className="h-4 w-4 rounded border-gray-300 bg-gray-700 text-cyan-600 focus:ring-cyan-500 shrink-0"/>
                                                  {employee.photoUrl && <img src={employee.photoUrl} alt={employee.name} className="w-8 h-8 rounded-full object-cover shrink-0"/>}
                                                 <span>{employee.name}</span>
                                              </label>
                                           ))}
                                        </div>
                                    </div>
                                ))
                              )}
                           </div>
                        </div>
                    )}

                    <textarea value={questionText} onChange={e => setQuestionText(e.target.value)} placeholder="Texto da pergunta" className="w-full p-2 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} required></textarea>
                    
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox"
                        id="open-ended-checkbox"
                        checked={isQuestionOpenEnded}
                        onChange={(e) => setIsQuestionOpenEnded(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 bg-gray-700 text-cyan-600 focus:ring-cyan-500"
                      />
                      <label htmlFor="open-ended-checkbox" className="text-sm font-medium text-gray-300">
                        Pergunta de Resposta Aberta
                      </label>
                    </div>
                    
                    {!isQuestionOpenEnded && (
                      <div className="space-y-3 pt-2 border-t border-dark-border">
                        <h4 className="font-semibold text-gray-300">Opções de Resposta:</h4>
                        {answers.map((ans, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <input type="text" value={ans.text} onChange={e => handleAnswerChange(i, e.target.value)} placeholder={`Opção de resposta ${i + 1}`} className="flex-grow w-full p-2 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                                {answers.length > 1 && (
                                    <button type="button" onClick={() => handleRemoveAnswer(i)} className="text-red-500 hover:text-red-700 p-2 rounded-full transition-colors shrink-0">
                                        <DeleteIcon />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={handleAddAnswer} className="text-sm font-medium text-cyan-400 hover:underline">Adicionar Outra Resposta</button>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-end items-center pt-4 gap-4 border-t border-dark-border">
                        <div className="flex gap-2 self-end sm:self-center">
                            {editingQuestion && (
                                <button type="button" onClick={() => setEditingQuestion(null)} className="px-4 py-2 font-semibold text-gray-200 bg-gray-600 rounded-lg hover:bg-gray-700 transition-all">Cancelar</button>
                            )}
                            <button 
                                type="submit" 
                                className="px-4 py-2 font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                               {editingQuestion ? 'Atualizar Pergunta' : 'Adicionar à Lista'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            
            {!editingQuestion && questionQueue.length > 0 && (
                <div className="mt-8 bg-dark-card p-6 rounded-xl shadow-md border border-dark-border">
                    <h3 className="text-xl font-semibold mb-4">Perguntas na Lista ({questionQueue.length})</h3>
                    <ul className="space-y-2 mb-6 max-h-80 overflow-y-auto pr-2">
                        {questionQueue.map((q, index) => (
                            <li key={index} className="p-3 bg-dark-background rounded-lg border border-dark-border flex items-center justify-between gap-2">
                                <p className="flex-grow truncate" title={q.text}>
                                  {q.text}
                                </p>
                                <button type="button" onClick={() => handleRemoveFromQueue(index)} className="text-red-500 hover:text-red-700 p-1 rounded-full transition-colors shrink-0">
                                    <DeleteIcon />
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-end gap-4">
                         <button onClick={() => setQuestionQueue([])} className="px-4 py-2 font-semibold text-gray-200 bg-gray-600 rounded-lg hover:bg-gray-700 transition-all">Limpar Lista</button>
                         <button onClick={onBatchSubmit} className="px-4 py-2 font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg transition-all">
                             Enviar Todas as Perguntas da Lista
                         </button>
                    </div>
                </div>
            )}


            <div className="mt-8 bg-dark-card p-6 rounded-xl shadow-md border border-dark-border">
                <h3 className="text-xl font-semibold mb-4">Perguntas Existentes ({questionTarget === UserRole.COMPANY ? 'Empresas' : 'Funcionários'})</h3>
                {isLoadingQuestions ? (
                    <p className="text-center text-gray-500 py-4">Carregando perguntas...</p>
                ) : (
                    <ul className="space-y-3">
                        {filteredQuestions.length > 0 ? filteredQuestions.map(q => (
                            <li key={q.id} className="p-4 bg-dark-background rounded-lg border border-dark-border">
                                <button onClick={() => onViewRequest(q)} className="w-full text-left">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-grow">
                                            <p className="font-medium">{q.text}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className={`bg-cyan-500/20 text-cyan-300 text-xs font-semibold px-2.5 py-0.5 rounded-full`}>
                                                    {q.isOpenEnded ? 'Resposta Aberta' : 'Múltipla Escolha'}
                                                </span>
                                                <span className="bg-gray-600/50 text-gray-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                                    Alvo: {getTargetDisplay(q)}
                                                </span>
                                                 <span className="bg-purple-500/20 text-purple-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                                    Categoria: {categories.find(c=>c.id === q.categoryId)?.name || 'N/A'}
                                                </span>
                                             </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button onClick={(e) => { e.stopPropagation(); setEditingQuestion(q); }} className="text-blue-500 hover:text-blue-700 p-1"><EditIcon /></button>
                                            <button onClick={(e) => { e.stopPropagation(); onDeleteRequest({ type: 'delete-question', ...q }); }} className="text-red-500 hover:text-red-700 p-1"><DeleteIcon /></button>
                                        </div>
                                    </div>
                                </button>
                            </li>
                        )) : <p className="text-center text-gray-500 py-4">Nenhuma pergunta encontrada para este público-alvo.</p>}
                    </ul>
                )}
            </div>
        </div>
    );
};

const QuestionViewer = ({ questions, categories, isLoading, onViewRequest }: { questions: NeuroQuestion[], categories: NeuroCategory[], isLoading: boolean, onViewRequest: (question: NeuroQuestion) => void }) => {
    const [questionTarget, setQuestionTarget] = useState<UserRole.COMPANY | UserRole.EMPLOYEE>(UserRole.COMPANY);

    const filteredQuestions = useMemo(() => {
        return questions.filter(q => q.targetRole === questionTarget);
    }, [questions, questionTarget]);
    
    const getTargetDisplay = (q: NeuroQuestion) => {
        if (q.targetScope === 'company_all_employees') {
            return `Todos da ${q.targetName || 'Empresa Específica'}`;
        }
        if (q.targetScope === 'multiple') return `Múltiplos (${q.targetIds?.length || 0})`;
        if (q.targetScope === 'all') return 'Todos(as)';
        if (q.targetRole === UserRole.EMPLOYEE) {
            const employeeName = q.targetEmployee?.name || q.targetName || 'Específico';
            const companyName = q.targetEmployee?.companyName || 'Empresa Desconhecida';
            return `${employeeName} (${companyName})`;
        }
        return q.targetName || 'Específico';
    };

    return (
        <div className="bg-dark-card p-6 rounded-xl shadow-md border border-dark-border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-xl font-semibold">Visualizar Perguntas do NeuroMapa</h3>
                <div className="flex items-center bg-dark-background p-1 rounded-full border border-dark-border">
                    <button
                        type="button"
                        onClick={() => setQuestionTarget(UserRole.COMPANY)}
                        className={`w-full sm:w-auto px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${questionTarget === UserRole.COMPANY ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                    >
                        Empresas
                    </button>
                    <button
                        type="button"
                        onClick={() => setQuestionTarget(UserRole.EMPLOYEE)}
                        className={`w-full sm:w-auto px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${questionTarget === UserRole.EMPLOYEE ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                    >
                        Funcionários
                    </button>
                </div>
            </div>

            {isLoading ? (
                <p className="text-center text-gray-500 py-8">Carregando perguntas...</p>
            ) : (
                <div className="space-y-6">
                    {filteredQuestions.length > 0 ? filteredQuestions.map((q, index) => (
                        <button key={q.id} onClick={() => onViewRequest(q)} className="w-full text-left p-4 bg-dark-background rounded-xl border border-dark-border hover:bg-dark-border/40 transition-colors">
                            <p className="font-semibold text-lg mb-3">({index + 1}) {q.text}</p>
                            <div className="flex flex-wrap gap-2 items-center mb-3">
                                <span className="bg-cyan-500/20 text-cyan-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                  {q.isOpenEnded ? 'Resposta Aberta' : 'Múltipla Escolha'}
                                </span>
                                <span className="bg-gray-600/50 text-gray-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                    Direcionado para: {getTargetDisplay(q)}
                                </span>
                                 <span className="bg-purple-500/20 text-purple-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                    Categoria: {categories.find(c=>c.id === q.categoryId)?.name || 'N/A'}
                                </span>
                            </div>
                        </button>
                    )) : <p className="text-center py-8 text-gray-500">Nenhuma pergunta encontrada para "{questionTarget === UserRole.COMPANY ? 'Empresas' : 'Funcionários'}".</p>}
                </div>
            )}
        </div>
    );
};

const QuestionDetailModal = ({ question, categories, onClose }: { question: NeuroQuestion | null, categories: NeuroCategory[], onClose: () => void }) => {
    if (!question) return null;

    const categoryName = categories.find(c => c.id === question.categoryId)?.name || 'N/A';

    const renderTargetDetails = () => {
        if (question.targetScope === 'company_all_employees') {
            return <p>Todos os funcionários da empresa: {question.targetName || 'N/A'}</p>;
        }
        if (question.targetScope === 'multiple') {
            const targets = question.targetEmployees && question.targetEmployees.length > 0 
                ? question.targetEmployees.map(e => `${e.name} (${e.companyName})`)
                : question.targetNames;
            
            if (!targets || targets.length === 0) return <p>Nenhum alvo específico listado.</p>;
            
            return (
                <ul className="list-disc list-inside space-y-1">
                    {targets.map((name, i) => <li key={i}>{name}</li>)}
                </ul>
            );
        }

        let targetDisplay = '';
        if (question.targetScope === 'specific') {
            if (question.targetRole === UserRole.COMPANY) {
                targetDisplay = `Empresa: ${question.targetName || 'Não especificado'}`;
            } else {
                targetDisplay = `Funcionário: ${question.targetEmployee?.name || 'Não especificado'} (${question.targetEmployee?.companyName || 'N/A'})`;
            }
        } else {
            targetDisplay = `Todos(as) os(as) ${question.targetRole === UserRole.COMPANY ? 'Empresas' : 'Funcionários'}`;
        }
        return <p>{targetDisplay}</p>;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-dark-card rounded-xl shadow-2xl p-6 w-full max-w-2xl border border-dark-border" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-cyan-400">Detalhes da Pergunta</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-3">
                    <div>
                        <p className="text-sm font-semibold text-gray-400">Pergunta:</p>
                        <p className="text-lg">{question.text}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-400">Categoria:</p>
                            <p>{categoryName}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-400">Tipo:</p>
                            <p>{question.isOpenEnded ? 'Resposta Aberta' : 'Múltipla Escolha'}</p>
                        </div>
                    </div>
                     <div>
                        <p className="text-sm font-semibold text-gray-400">Direcionamento:</p>
                        {renderTargetDetails()}
                    </div>
                    {!question.isOpenEnded && (
                        <div>
                            <p className="text-sm font-semibold text-gray-400">Opções de Resposta:</p>
                             <ul className="list-disc list-inside space-y-1 mt-1">
                                {question.answers.map(ans => <li key={ans.id}>{ans.text}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
                 <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-600 text-gray-200 hover:bg-gray-700 transition-colors">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ResultsPanelProps {
    title: string;
    results: NeuroAnalysisResult[];
    isLoading: boolean;
    onViewResult: (result: NeuroAnalysisResult) => void;
    companies?: User[];
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ title, results, isLoading, onViewResult, companies = [] }) => {
    if (isLoading) {
        return (
            <div className="text-center py-16">
                <div className="loader-container">
                    <div className="loader triangle"><svg viewBox="0 0 86 80"><polygon points="43 8 79 72 7 72"></polygon></svg></div>
                    <div className="loadingtext"><p>Carregando Resultados</p></div>
                </div>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="bg-dark-card p-8 rounded-xl shadow-md border border-dark-border text-center mt-6">
                <h3 className="text-xl font-semibold mb-4">{title}</h3>
                <p className="text-lg text-gray-400">Nenhum resultado de NeuroMapa encontrado para esta seleção.</p>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {results.map(result => {
                    const company = companies.find(c => c.companyName === result.empresa);
                    const logoUrl = company?.photoUrl;

                    return (
                        <div 
                            key={result.id} 
                            className="bg-dark-card rounded-xl shadow-lg border border-dark-border flex flex-col text-left transition-all duration-300 hover:shadow-cyan-500/20 hover:-translate-y-1"
                        >
                            <div className="p-5 flex-grow">
                                <div className="flex items-center gap-4 mb-4">
                                    {result.foto ? ( // Employee has a specific photo in the result
                                        <img src={result.foto} alt={result.nome} className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400 flex-shrink-0" />
                                    ) : logoUrl ? ( // Company result: use logo
                                        <img src={logoUrl} alt={result.empresa} className="w-16 h-16 rounded-full object-contain bg-dark-background p-1 border-2 border-cyan-400 flex-shrink-0" />
                                    ) : ( // Fallback for company without logo
                                        <div className="w-16 h-16 rounded-full bg-dark-background flex items-center justify-center text-cyan-400 text-2xl font-bold flex-shrink-0 border-2 border-dark-border">
                                            {result.empresa.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-lg truncate" title={result.empresa}>{result.empresa}</h3>
                                        {result.nome !== result.empresa ? (
                                             <p className="text-sm text-gray-400">Enviado por: {result.nome}</p>
                                        ) : (
                                            <p className="text-sm text-gray-400">Resultado da Empresa</p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-400 space-y-1">
                                    <p><strong>Categoria:</strong> {result.categoria || 'N/A'}</p>
                                    <p><strong>Data:</strong> {result.data} às {result.horario}</p>
                                </div>
                            </div>
                            <div className="bg-dark-border/30 rounded-b-xl mt-auto">
                                <button 
                                    onClick={() => onViewResult(result)}
                                    className="w-full text-center px-5 py-3 text-sm font-semibold text-cyan-400 hover:text-white hover:bg-cyan-500/20 transition-colors"
                                >
                                    Ver Análise Completa
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const NeuroMapaPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'manage' | 'view' | 'categories' | 'company_results' | 'employee_results'>('manage');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalState, setModalState] = useState<{isOpen: boolean; payload: any}>({ isOpen: false, payload: null });
    const [viewingQuestion, setViewingQuestion] = useState<NeuroQuestion | null>(null);
    const [questionQueue, setQuestionQueue] = useState<any[]>([]);
    const { 
        neuroQuestions,
        neuroCategories,
        allEmployees,
        allRegisteredCompanies,
        fetchNeuroData,
        neuroAnalysisResults,
        companyNeuroAnalysisResults,
        fetchNeuroAnalysisResults,
        fetchCompanyNeuroAnalysisResults,
        fetchAllRegisteredCompanies
    } = useApp();
    const [isLoadingResults, setIsLoadingResults] = useState(false);
    const [viewingAnalysis, setViewingAnalysis] = useState<NeuroAnalysisResult | null>(null);
    const [companyFilter, setCompanyFilter] = useState<string>('all');
    const [employeeCompanyFilter, setEmployeeCompanyFilter] = useState<string>('all');
    const [employeeNameFilter, setEmployeeNameFilter] = useState<string>('all');

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            await Promise.all([
                fetchNeuroData(),
                fetchAllRegisteredCompanies()
            ]);
            setIsLoading(false);
        };
        loadInitialData();
    }, [fetchNeuroData, fetchAllRegisteredCompanies]);
    
    useEffect(() => {
        const fetchResults = async () => {
            setIsLoadingResults(true);
            try {
                if (activeTab === 'company_results') {
                    await fetchCompanyNeuroAnalysisResults();
                } else if (activeTab === 'employee_results') {
                    await fetchNeuroAnalysisResults();
                }
            } catch (error) {
                console.error("Erro ao buscar resultados do NeuroMapa:", error);
            } finally {
                setIsLoadingResults(false);
            }
        };

        if (activeTab === 'company_results' || activeTab === 'employee_results') {
            fetchResults();
        }
    }, [activeTab, fetchCompanyNeuroAnalysisResults, fetchNeuroAnalysisResults]);

    const handleRequest = (payload: any) => {
        setModalState({ isOpen: true, payload });
    };

    const handleBatchSubmit = () => {
        if (questionQueue.length === 0) {
            alert("A lista de perguntas está vazia.");
            return;
        }
        handleRequest({ type: 'add-batch-question', queue: questionQueue });
    };

    const handleConfirm = async () => {
        // This logic is now handled by the context
    };
    
    const handleUpdateCategory = (id: string, updates: { newName: string, newTargetRole: NeuroCategoryTarget }) => {
        handleRequest({ type: 'edit-category', id, updates });
    };

    const handleDeleteCategory = (id: string) => {
        handleRequest({ type: 'delete-category', id });
    };

    const modalContent = useMemo(() => {
        // This is now just for display, the logic is in the context
        if (!modalState.isOpen || !modalState.payload) return { title: '', children: null };
        const { payload } = modalState;
        switch (payload.type) {
            case 'add-batch-question': return { title: 'Confirmar Adição de Perguntas' };
            case 'edit-question': return { title: 'Confirmar Edição' };
            case 'delete-question': return { title: 'Confirmar Exclusão' };
            default: return { title: 'Confirmar Ação' };
        }
    }, [modalState]);

    const companyResultCompanies = useMemo(() => {
        return [...new Set(companyNeuroAnalysisResults.map(r => r.empresa))].sort((a,b) => a.localeCompare(b));
    }, [companyNeuroAnalysisResults]);

    const filteredCompanyResults = useMemo(() => {
        if (companyFilter === 'all') {
            return companyNeuroAnalysisResults;
        }
        return companyNeuroAnalysisResults.filter(result => result.empresa === companyFilter);
    }, [companyNeuroAnalysisResults, companyFilter]);

    const employeeResultCompanies = useMemo(() => {
        return [...new Set(neuroAnalysisResults.map(r => r.empresa))].sort((a,b) => a.localeCompare(b));
    }, [neuroAnalysisResults]);

    const employeesInSelectedCompany = useMemo(() => {
        if (employeeCompanyFilter === 'all') {
            return [...new Set(neuroAnalysisResults.map(r => r.nome))].sort((a,b) => a.localeCompare(b));
        }
        return [...new Set(neuroAnalysisResults.filter(r => r.empresa === employeeCompanyFilter).map(r => r.nome))].sort((a,b) => a.localeCompare(b));
    }, [neuroAnalysisResults, employeeCompanyFilter]);
    
    const handleEmployeeCompanyFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEmployeeCompanyFilter(e.target.value);
        setEmployeeNameFilter('all');
    };

    const filteredEmployeeResults = useMemo(() => {
        return neuroAnalysisResults.filter(result => {
            const companyMatch = employeeCompanyFilter === 'all' || result.empresa === employeeCompanyFilter;
            const employeeMatch = employeeNameFilter === 'all' || result.nome === employeeNameFilter;
            return companyMatch && employeeMatch;
        });
    }, [neuroAnalysisResults, employeeCompanyFilter, employeeNameFilter]);
    
    return (
        <div className="container mx-auto">
            {isSubmitting && (
                <div className="fixed inset-0 bg-dark-background bg-opacity-90 z-50 flex flex-col justify-center items-center p-4">
                    <div className="loader-container">
                        <div className="loader triangle"><svg viewBox="0 0 86 80"><polygon points="43 8 79 72 7 72"></polygon></svg></div>
                        <div className="loadingtext"><p>Processando...</p></div>
                    </div>
                </div>
            )}
            <QuestionDetailModal question={viewingQuestion} categories={neuroCategories} onClose={() => setViewingQuestion(null)} />
            <AnalysisResultModal analysis={viewingAnalysis} onClose={() => setViewingAnalysis(null)} />
            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, payload: null })}
                onConfirm={handleConfirm}
                title={modalContent.title}
                confirmButtonText="Confirmar"
            >
                {modalContent.children}
            </ConfirmationModal>

            <h1 className="text-2xl sm:text-3xl font-bold mb-8">Painel - NeuroMapa</h1>

            <div className="mb-8 flex flex-wrap border-b border-dark-border">
                <button onClick={() => setActiveTab('manage')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'manage' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400 hover:text-white'}`}>Gerenciar Perguntas</button>
                <button onClick={() => setActiveTab('categories')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'categories' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400 hover:text-white'}`}>Gerenciar Categorias</button>
                <button onClick={() => setActiveTab('view')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'view' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400 hover:text-white'}`}>Visualizar Perguntas</button>
                <button onClick={() => setActiveTab('company_results')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'company_results' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400 hover:text-white'}`}>Resultados (Empresas)</button>
                <button onClick={() => setActiveTab('employee_results')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'employee_results' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400 hover:text-white'}`}>Resultados (Funcionários)</button>
            </div>

            {activeTab === 'manage' && (
                <QuestionManager 
                    questions={neuroQuestions} 
                    categories={neuroCategories}
                    isLoadingCategories={isLoading}
                    isLoadingQuestions={isLoading}
                    allEmployees={allEmployees}
                    companies={allRegisteredCompanies}
                    questionQueue={questionQueue}
                    setQuestionQueue={setQuestionQueue}
                    onBatchSubmit={handleBatchSubmit}
                    onUpdateRequest={(payload) => handleRequest(payload)}
                    onDeleteRequest={(payload) => handleRequest(payload)}
                    onViewRequest={setViewingQuestion}
                />
            )}

            {activeTab === 'categories' && (
                <CategoryManager
                    categories={neuroCategories}
                    isLoading={isLoading}
                    onAddRequest={(name, targetRole) => handleRequest({ type: 'add-category', name, targetRole })}
                    onUpdateRequest={handleUpdateCategory}
                    onDeleteRequest={handleDeleteCategory}
                />
            )}

            {activeTab === 'view' && (
                <QuestionViewer 
                    questions={neuroQuestions} 
                    categories={neuroCategories} 
                    isLoading={isLoading} 
                    onViewRequest={setViewingQuestion}
                />
            )}
            
            {activeTab === 'company_results' && (
                <div>
                    <div className="mb-6">
                        <label htmlFor="company-filter" className="block text-sm font-medium text-gray-300 mb-2">Filtrar por Empresa:</label>
                        <select
                            id="company-filter"
                            value={companyFilter}
                            onChange={(e) => setCompanyFilter(e.target.value)}
                            className="w-full max-w-sm p-2 border border-dark-border rounded-lg bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Todas as Empresas</option>
                            {companyResultCompanies.map(company => <option key={company} value={company}>{company}</option>)}
                        </select>
                    </div>
                    <ResultsPanel 
                        title="Resultados das Empresas"
                        results={filteredCompanyResults} 
                        isLoading={isLoadingResults} 
                        onViewResult={setViewingAnalysis} 
                        companies={allRegisteredCompanies}
                    />
                </div>
            )}
            
            {activeTab === 'employee_results' && (
                <div>
                     <div className="flex flex-wrap items-center gap-4 mb-6">
                        <div>
                            <label htmlFor="employee-company-filter" className="block text-sm font-medium text-gray-300 mb-2">Filtrar por Empresa:</label>
                            <select
                                id="employee-company-filter"
                                value={employeeCompanyFilter}
                                onChange={handleEmployeeCompanyFilterChange}
                                className="w-full max-w-xs p-2 border border-dark-border rounded-lg bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Todas as Empresas</option>
                                {employeeResultCompanies.map(company => <option key={company} value={company}>{company}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="employee-name-filter" className="block text-sm font-medium text-gray-300 mb-2">Filtrar por Funcionário:</label>
                            <select
                                id="employee-name-filter"
                                value={employeeNameFilter}
                                onChange={(e) => setEmployeeNameFilter(e.target.value)}
                                className="w-full max-w-xs p-2 border border-dark-border rounded-lg bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Todos os Funcionários</option>
                                {employeesInSelectedCompany.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>
                    </div>
                    <ResultsPanel 
                        title="Resultados dos Funcionários"
                        results={filteredEmployeeResults} 
                        isLoading={isLoadingResults} 
                        onViewResult={setViewingAnalysis} 
                    />
                </div>
            )}

        </div>
    );
};

export default NeuroMapaPage;