

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../hooks/useApp';
import { User, UserStatus, Question, Category, UserRole, LogEntry, LogType, AnswerOption, Segmento, Grupo } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';

// Icons
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
const BuildingOfficeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
    </svg>
);
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);
const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m-2.14 2.14l-3.289-3.29" />
    </svg>
);
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);
const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);

const ApiMessageModal: React.FC<{
    message: { type: 'success' | 'error', text: string } | null;
    onClose: () => void;
}> = ({ message, onClose }) => {
    if (!message) return null;

    const isSuccess = message.type === 'success';
    const iconColor = isSuccess ? 'text-green-400' : 'text-red-400';
    const buttonClass = isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';
    const Icon = isSuccess ? CheckCircleIcon : XCircleIcon;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[70] flex justify-center items-center p-4">
            <div className="bg-dark-card rounded-xl shadow-2xl p-6 w-full max-w-md text-center border border-dark-border">
                <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Icon className={`h-8 w-8 ${iconColor}`} />
                </div>
                <h3 className="text-xl font-bold mt-4 mb-2 text-dark-text">{isSuccess ? 'Sucesso!' : 'Erro!'}</h3>
                <div className="mb-6 text-gray-300">
                    <p>{message.text}</p>
                </div>
                <div className="flex justify-center">
                    <button
                        onClick={onClose}
                        className={`px-6 py-2 rounded-md text-base font-medium text-white transition-colors ${buttonClass}`}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};


interface PendingApprovalsProps {
    onApproveRequest: (user: User) => void;
    onRejectRequest: (user: User) => void;
}

// Sub-component for pending approvals
const PendingApprovals: React.FC<PendingApprovalsProps> = ({ onApproveRequest, onRejectRequest }) => {
    const { users } = useApp();
    const [filter, setFilter] = useState<'company' | 'employee'>('company');

    const pendingUsers = useMemo(() => {
        return users.filter(u => {
            if (u.status !== UserStatus.PENDING) return false;
            if (filter === 'company') return u.role === UserRole.COMPANY;
            if (filter === 'employee') return u.role === UserRole.EMPLOYEE;
            return false;
        });
    }, [users, filter]);

    return (
        <div className="bg-light-card dark:bg-dark-card p-4 sm:p-6 rounded-xl shadow-md border border-light-border dark:border-dark-border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h3 className="text-xl font-semibold">Aprovações Pendentes</h3>
                 <div className="flex items-center gap-2">
                    <label htmlFor="approval-filter" className="text-sm font-medium shrink-0">Filtrar por:</label>
                    <select
                        id="approval-filter"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as 'company' | 'employee')}
                        className="p-2 border border-dark-border rounded-lg bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="company">Empresas</option>
                        <option value="employee">Funcionários</option>
                    </select>
                </div>
            </div>
            {pendingUsers.length > 0 ? (
                <ul className="space-y-4">
                    {pendingUsers.map(user => (
                        <li key={user.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-light-background dark:bg-dark-background rounded-lg border border-light-border dark:border-dark-border">
                            <div>
                                <p className="font-bold">{user.role === UserRole.COMPANY ? user.companyName : user.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 break-all">
                                    {user.role === UserRole.COMPANY
                                        ? `Contato: ${user.name} (${user.email} | ${user.phone})`
                                        : `Empresa: ${user.companyName} (${user.email} | ${user.phone})`
                                    }
                                </p>
                                {user.createdAt && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        Cadastrado em: {new Date(user.createdAt).toLocaleString('pt-BR')}
                                    </p>
                                )}
                            </div>
                            <div className="flex space-x-2 mt-2 sm:mt-0 shrink-0">
                                <button onClick={() => onApproveRequest(user)} className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors">Aprovar</button>
                                <button onClick={() => onRejectRequest(user)} className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">Rejeitar</button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">Nenhuma aprovação pendente para "{filter === 'company' ? 'Empresas' : 'Funcionários'}".</p>
            )}
        </div>
    );
};

interface AdminUserManagerProps {
    onAddRequest: (data: { name: string; email: string; password: string, phone: string }) => void;
    onUpdateRequest: (user: User, updates: { name?: string; email?: string; phone?: string; password?: string }) => void;
    onDeleteRequest: (user: User) => void;
}

const AdminUserManager: React.FC<AdminUserManagerProps> = ({ onAddRequest, onUpdateRequest, onDeleteRequest }) => {
    const { currentUser, admins } = useApp();
    const [formState, setFormState] = useState({ name: '', email: '', password: '', phone: '' });
    const [editingState, setEditingState] = useState<{ id: string, name: string, email: string, phone: string, password: '', confirmPassword: '' } | null>(null);
    const [editError, setEditError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddAdmin = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, email, password, phone } = formState;
        if (name.trim() && email.trim() && password.trim() && phone.trim()) {
            onAddRequest({ name: name.trim(), email: email.trim(), password: password.trim(), phone: phone.trim() });
            setFormState({ name: '', email: '', password: '', phone: '' });
        }
    };

    const handleEditClick = (user: User) => {
        setEditingState({ id: user.id, name: user.name, email: user.email, phone: user.phone || '', password: '', confirmPassword: '' });
        setEditError('');
    };

    const handleCancelEdit = () => {
        setEditingState(null);
        setEditError('');
    };

    const handleSaveEdit = () => {
        if (!editingState) return;

        const { id, name, email, phone, password, confirmPassword } = editingState;

        if (!name.trim() || !email.trim() || !phone.trim()) {
            setEditError('Nome, e-mail e telefone não podem estar vazios.');
            return;
        }

        if (password && password !== confirmPassword) {
            setEditError('As novas senhas não coincidem.');
            return;
        }

        const originalAdmin = admins.find(a => a.id === id);
        if (!originalAdmin) {
            setEditError('Administrador original não encontrado.');
            return;
        }

        const updates: { name?: string; email?: string; phone?: string; password?: string } = {};
        if (name.trim() && name.trim() !== originalAdmin.name) updates.name = name.trim();
        if (email.trim() && email.trim() !== originalAdmin.email) updates.email = email.trim();
        if (phone.trim() && phone.trim() !== originalAdmin.phone) updates.phone = phone.trim();
        if (password) updates.password = password;

        if (Object.keys(updates).length > 0) {
            onUpdateRequest(originalAdmin, updates);
        }
        
        handleCancelEdit();
    };

    const handleEditingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editingState) {
            setEditingState({ ...editingState, [e.target.name]: e.target.value });
        }
    };

    return (
        <div className="bg-light-card dark:bg-dark-card p-4 sm:p-6 rounded-xl shadow-md border border-light-border dark:border-dark-border">
            <h3 className="text-xl font-semibold mb-4">Gerenciar Administradores</h3>
            <form onSubmit={handleAddAdmin} className="space-y-3 mb-6 pb-4 border-b border-light-border dark:border-dark-border">
                <input type="text" name="name" value={formState.name} onChange={handleInputChange} placeholder="Nome do novo admin" className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                <input type="email" name="email" value={formState.email} onChange={handleInputChange} placeholder="E-mail do novo admin" className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                <input type="tel" name="phone" value={formState.phone} onChange={handleInputChange} placeholder="Telefone do novo admin" className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                <input type="password" name="password" value={formState.password} onChange={handleInputChange} placeholder="Senha temporária" className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all">Adicionar Administrador</button>
            </form>
            <h4 className="font-semibold mb-2">Administradores Atuais</h4>
            {admins.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">Carregando administradores...</p>
            ) : (
                <ul className="space-y-2">
                    {admins.map(user => (
                        <li key={user.id} className="p-3 bg-light-background dark:bg-dark-background rounded-lg border border-light-border dark:border-dark-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            {editingState?.id === user.id ? (
                                <div className="flex-grow space-y-2 w-full">
                                    <input type="text" name="name" value={editingState.name} onChange={handleEditingChange} className="w-full px-2 py-1 border border-light-border dark:border-dark-border rounded-md bg-light-card dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
                                    <input type="email" name="email" value={editingState.email} onChange={handleEditingChange} className="w-full px-2 py-1 border border-light-border dark:border-dark-border rounded-md bg-light-card dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <input type="tel" name="phone" value={editingState.phone} onChange={handleEditingChange} className="w-full px-2 py-1 border border-light-border dark:border-dark-border rounded-md bg-light-card dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <input type="password" name="password" value={editingState.password} onChange={handleEditingChange} placeholder="Nova senha (deixe em branco para manter)" className="w-full px-2 py-1 border border-light-border dark:border-dark-border rounded-md bg-light-card dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <input type="password" name="confirmPassword" value={editingState.confirmPassword} onChange={handleEditingChange} placeholder="Confirmar nova senha" className="w-full px-2 py-1 border border-light-border dark:border-dark-border rounded-md bg-light-card dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {editError && <p className="text-xs text-red-500 mt-1">{editError}</p>}
                                </div>
                            ) : (
                               <div className="flex-grow">
                                   <p className="font-medium">{user.name}</p>
                                   <p className="text-sm text-gray-500 dark:text-gray-400 break-all">{user.email} | {user.phone}</p>
                               </div>
                            )}
                            
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                               {editingState?.id === user.id ? (
                                    <>
                                        <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-800"><SaveIcon /></button>
                                        <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-800"><CancelIcon /></button>
                                    </>
                               ) : (
                                    <>
                                        <button onClick={() => handleEditClick(user)} className="text-blue-600 hover:text-blue-800"><EditIcon /></button>
                                        {currentUser?.id !== user.id && (
                                            <button onClick={() => onDeleteRequest(user)} className="text-red-600 hover:text-red-800"><DeleteIcon /></button>
                                        )}
                                    </>
                               )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// Sub-component for category management
const CategoryManager: React.FC<{
    onAddRequest: (name: string) => void;
    onUpdateRequest: (category: Category, newName: string) => void;
    onDeleteRequest: (category: Category) => void;
}> = ({ onAddRequest, onUpdateRequest, onDeleteRequest }) => {
    const { categories } = useApp();
    const [newCategory, setNewCategory] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategory.trim()) {
            onAddRequest(newCategory.trim());
            setNewCategory('');
        }
    };

    const handleEdit = (category: Category) => {
        setEditingId(category.id);
        setEditingName(category.name);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName('');
    };

    const handleSaveEdit = () => {
        if (editingId && editingName.trim()) {
            const originalCategory = categories.find(c => c.id === editingId);
            if(originalCategory) {
              onUpdateRequest(originalCategory, editingName.trim());
            }
            handleCancelEdit();
        }
    };


    return (
        <div className="bg-light-card dark:bg-dark-card p-4 sm:p-6 rounded-xl shadow-md border border-light-border dark:border-dark-border">
            <h3 className="text-xl font-semibold mb-4">Gerenciar Categorias</h3>
            <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2 mb-4">
                <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Nome da nova categoria" className="flex-grow px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="w-full sm:w-auto px-4 py-2 font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all">Adicionar</button>
            </form>
            <ul className="space-y-2">
                {categories.map(cat => (
                    <li key={cat.id} className="p-3 bg-light-background dark:bg-dark-background rounded-lg border border-light-border dark:border-dark-border flex items-center justify-between gap-2">
                        {editingId === cat.id ? (
                            <input type="text" value={editingName} onChange={e => setEditingName(e.target.value)} className="flex-grow px-2 py-1 border border-light-border dark:border-dark-border rounded-md bg-light-card dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
                        ) : (
                           <span className="flex-grow">{cat.name}</span>
                        )}
                        
                        <div className="flex items-center gap-2 shrink-0">
                           {editingId === cat.id ? (
                                <>
                                    <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-800"><SaveIcon /></button>
                                    <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-800"><CancelIcon /></button>
                                </>
                           ) : (
                                <>
                                    <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:text-blue-800"><EditIcon /></button>
                                    <button onClick={() => onDeleteRequest(cat)} className="text-red-600 hover:text-red-800"><DeleteIcon /></button>
                                </>
                           )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

interface QuestionManagerProps {
    onAddRequest: (data: { categoryId: string; text: string; answers: { text: string; score: number }[], targetRole: UserRole.COMPANY | UserRole.EMPLOYEE }) => void;
    onDeleteRequest: (question: Question) => void;
    onUpdateRequest: (question: Question) => void;
}


// Sub-component for question management
const QuestionManager: React.FC<QuestionManagerProps> = ({ onAddRequest, onDeleteRequest, onUpdateRequest }) => {
    const { categories, questions } = useApp();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [questionText, setQuestionText] = useState('');
    const [answers, setAnswers] = useState<{ text: string; score: number }[]>([{ text: '', score: 0 }]);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [questionTarget, setQuestionTarget] = useState<UserRole.COMPANY | UserRole.EMPLOYEE>(UserRole.COMPANY);

    const questionsForTarget = useMemo(() => {
        return questions.filter(q => q.targetRole === questionTarget);
    }, [questions, questionTarget]);
    
    useEffect(() => {
        if(editingQuestion) {
            setSelectedCategory(editingQuestion.categoryId);
            setQuestionText(editingQuestion.text);
            setAnswers(editingQuestion.answers.map(a => ({ text: a.text, score: a.score })));
            setQuestionTarget(editingQuestion.targetRole);
        } else {
            // When not editing, reset form fields but keep filters
            setQuestionText('');
            setAnswers([{ text: '', score: 0 }]);
        }
    }, [editingQuestion]);
    
    const resetForm = () => {
        setEditingQuestion(null);
    };

    const handleAddAnswer = () => setAnswers([...answers, { text: '', score: 0 }]);
    const handleAnswerChange = (index: number, field: 'text' | 'score', value: string | number) => {
        const newAnswers = [...answers];
        if(field === 'score') newAnswers[index][field] = Number(value);
        else newAnswers[index][field] = String(value);
        setAnswers(newAnswers);
    };
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!questionText.trim() || !answers.every(a => a.text.trim())) {
            return;
        }

        if (editingQuestion) {
            const updatedQuestion: Question = {
                ...editingQuestion,
                text: questionText,
                answers: answers.map((a, i) => ({
                    id: editingQuestion.answers[i]?.id || `new-ans-${Date.now()}-${i}`,
                    text: a.text,
                    score: a.score,
                })),
                categoryId: selectedCategory,
            };
            onUpdateRequest(updatedQuestion);
            resetForm();
        } else {
            if (selectedCategory === 'all') {
                alert('Por favor, selecione uma categoria para adicionar uma nova pergunta.');
                return;
            }
            onAddRequest({ categoryId: selectedCategory, text: questionText, answers, targetRole: questionTarget });
            setQuestionText('');
            setAnswers([{ text: '', score: 0 }]);
        }
    };

    const renderQuestionItem = (q: Question) => (
        <li key={q.id} className="p-3 bg-light-background dark:bg-dark-background rounded-lg border border-light-border dark:border-dark-border">
            <div className="flex justify-between items-start gap-2">
                <div className="flex-grow">
                    <p className="font-medium">{q.text}</p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc list-inside pl-2 mt-1">
                       {q.answers.map(a => <li key={a.id}>{a.text} <span className="font-semibold">({a.score} pts)</span></li>)}
                    </ul>
                </div>
                 <div className="flex items-center gap-2 shrink-0">
                     <button onClick={() => setEditingQuestion(q)} className="text-blue-600 hover:text-blue-800"><EditIcon /></button>
                     <button onClick={() => onDeleteRequest(q)} className="text-red-600 hover:text-red-800"><DeleteIcon /></button>
                </div>
            </div>
        </li>
    );

    const renderQuestionList = (questionsToRender: Question[], isLoading: boolean) => {
        if (isLoading) {
            return <div className="text-center py-8"><p className="text-gray-400">Carregando perguntas...</p></div>;
        }

        const titleTarget = questionTarget === UserRole.COMPANY ? 'Empresas' : 'Funcionários';
        
        if (selectedCategory === 'all') {
            const allCategoriesWithQuestions = categories.filter(cat => 
                questionsToRender.some(q => q.categoryId === cat.id)
            );

            return (
                <div className="space-y-6 border-t border-dark-border pt-4">
                    <h4 className="font-semibold text-lg mb-2">Perguntas Existentes ({titleTarget})</h4>
                    {questionsToRender.length > 0 && allCategoriesWithQuestions.length > 0 ? (
                        allCategoriesWithQuestions.map(category => {
                            const categoryQuestions = questionsToRender.filter(q => q.categoryId === category.id);
                            return (
                                <div key={category.id}>
                                    <h5 className="font-semibold text-cyan-400 mb-2">{category.name}</h5>
                                    <ul className="space-y-2 pl-4 border-l-2 border-dark-border">
                                        {categoryQuestions.map(q => renderQuestionItem(q))}
                                    </ul>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">Nenhuma pergunta cadastrada para "{titleTarget}".</p>
                    )}
                </div>
            );
        }

        const questionsForCategory = questionsToRender.filter(q => q.categoryId === selectedCategory);
        return (
            <>
                <h4 className="font-semibold mb-2 border-t border-dark-border pt-4">Perguntas em "{categories.find(c => c.id === selectedCategory)?.name || 'N/A'}"</h4>
                <ul className="space-y-2">
                    {questionsForCategory.length > 0 ? (
                        questionsForCategory.map(q => renderQuestionItem(q))
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma pergunta nesta categoria para "{titleTarget}".</p>
                    )}
                </ul>
            </>
        );
    };


    return (
        <div className="bg-light-card dark:bg-dark-card p-4 sm:p-6 rounded-xl shadow-md border border-light-border dark:border-dark-border">
            <h3 className="text-xl font-semibold mb-4">Gerenciar Perguntas</h3>
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Público-Alvo da Pergunta:</label>
                <div className="flex items-center justify-center bg-dark-background p-1 rounded-full border border-dark-border">
                    <button
                        type="button"
                        onClick={() => setQuestionTarget(UserRole.COMPANY)}
                        disabled={!!editingQuestion}
                        className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${questionTarget === UserRole.COMPANY ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:text-white'} disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed`}
                    >
                        Empresas
                    </button>
                    <button
                        type="button"
                        onClick={() => setQuestionTarget(UserRole.EMPLOYEE)}
                        disabled={!!editingQuestion}
                        className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${questionTarget === UserRole.EMPLOYEE ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:text-white'} disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed`}
                    >
                        Funcionários
                    </button>
                </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 mb-6">
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full p-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="all">-- Todas as Categorias --</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                <textarea value={questionText} onChange={e => setQuestionText(e.target.value)} placeholder="Texto da pergunta" className="w-full p-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2}></textarea>
                
                <h4 className="font-semibold pt-2">Respostas e Pontuações:</h4>
                {answers.map((ans, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                        <input type="text" value={ans.text} onChange={e => handleAnswerChange(i, 'text', e.target.value)} placeholder={`Opção de resposta ${i + 1}`} className="flex-grow w-full p-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        <input type="number" value={ans.score} onChange={e => handleAnswerChange(i, 'score', e.target.value)} placeholder="Pontos" className="w-full sm:w-24 p-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                ))}
                <div className="flex flex-col sm:flex-row justify-between items-center pt-2 gap-4">
                    <button type="button" onClick={handleAddAnswer} className="text-sm font-medium text-blue-600 dark:text-cyan-400 hover:underline self-start sm:self-center">Adicionar Resposta</button>
                    <div className="flex gap-2 self-end sm:self-center">
                        {editingQuestion && (
                            <button type="button" onClick={resetForm} className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all">Cancelar</button>
                        )}
                        <button type="submit" className="px-4 py-2 font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all">{editingQuestion ? 'Atualizar Pergunta' : 'Adicionar Pergunta'}</button>
                    </div>
                </div>
            </form>
            
            {renderQuestionList(questionsForTarget, false)}
        </div>
    );
}

const ActivityLog: React.FC = () => {
    const { logs } = useApp();

    return (
        <div className="bg-light-card dark:bg-dark-card p-4 sm:p-6 rounded-xl shadow-md border border-light-border dark:border-dark-border">
            <h3 className="text-xl font-semibold mb-4">Registro de Atividades</h3>
            {logs.length > 0 ? (
                <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {logs.map(log => (
                        <li key={log.id} className="text-sm p-3 bg-light-background dark:bg-dark-background rounded-lg border border-light-border dark:border-dark-border">
                            <p className="text-gray-800 dark:text-gray-200">{log.message}</p>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex flex-col items-start gap-1 sm:flex-row sm:justify-between sm:items-center">
                                <span>
                                    {log.type === LogType.USER_APPROVAL && log.adminName && (
                                        `Aprovado por: ${log.adminName}`
                                    )}
                                </span>
                                <span className="font-mono">{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">Nenhuma atividade registrada.</p>
            )}
        </div>
    );
};

const AddCompaniesToGroupModal: React.FC<{
  group: Grupo | null;
  onClose: () => void;
  onConfirm: (selectedCompanies: string[]) => void;
  isSubmitting: boolean;
}> = ({ group, onClose, onConfirm, isSubmitting }) => {
  const { allRegisteredCompanies, fetchAllRegisteredCompanies } = useApp();
  const [selectedCompanyNames, setSelectedCompanyNames] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (group) {
      fetchAllRegisteredCompanies();
    }
  }, [group, fetchAllRegisteredCompanies]);

  const companies = useMemo(() => {
    const existingCompanyNames = new Set(group?.empresas || []);
    
    return allRegisteredCompanies
      .filter(company => !existingCompanyNames.has(company.companyName))
      .sort((a, b) => a.companyName.localeCompare(b.companyName));
  }, [allRegisteredCompanies, group]);

  const filteredCompanies = useMemo(() =>
    companies.filter(c => c.companyName.toLowerCase().includes(searchTerm.toLowerCase())),
  [companies, searchTerm]);

  if (!group) return null;

  const handleToggleCompany = (companyName: string) => {
    setSelectedCompanyNames(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyName)) {
        newSet.delete(companyName);
      } else {
        newSet.add(companyName);
      }
      return newSet;
    });
  };

  const handleConfirmClick = () => {
    onConfirm(Array.from(selectedCompanyNames));
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-dark-card rounded-xl shadow-2xl w-full max-w-2xl h-full max-h-[90vh] flex flex-col border border-dark-border">
        <div className="p-6 flex-shrink-0 border-b border-dark-border flex justify-between items-center">
          <h3 className="text-xl font-bold text-dark-text">Adicionar Empresas a <span className="text-cyan-400">{group.nome}</span></h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
        </div>
        <div className="p-6 flex-grow overflow-y-auto">
          <input
            type="text"
            placeholder="Buscar empresa..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 mb-4 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="space-y-3">
            {filteredCompanies.length > 0 ? filteredCompanies.map(company => (
              <label key={company.id} className="flex items-center gap-3 p-3 rounded-lg bg-dark-background border border-dark-border hover:border-cyan-500/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={selectedCompanyNames.has(company.companyName)}
                  onChange={() => handleToggleCompany(company.companyName)}
                  className="h-5 w-5 rounded border-gray-300 bg-gray-700 text-cyan-600 focus:ring-cyan-500 shrink-0"
                />
                <span className="flex-grow">{company.companyName}</span>
              </label>
            )) : <p className="text-center text-gray-400 py-8">Nenhuma empresa encontrada ou todas já foram adicionadas.</p>}
          </div>
        </div>
        <div className="p-6 flex-shrink-0 border-t border-dark-border flex justify-end gap-4">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gray-600 text-gray-200 hover:bg-gray-700 transition-colors">Cancelar</button>
          <button onClick={handleConfirmClick} disabled={isSubmitting || selectedCompanyNames.size === 0} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Adicionando...' : `Adicionar ${selectedCompanyNames.size > 0 ? selectedCompanyNames.size : ''} Empresa(s)`}
          </button>
        </div>
      </div>
    </div>
  );
};

const GroupDetailModal: React.FC<{
  group: Grupo | null;
  onClose: () => void;
  onRemoveCompany: (companyName: string) => void;
}> = ({ group, onClose, onRemoveCompany }) => {
  if (!group) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-dark-card rounded-xl shadow-2xl w-full max-w-2xl border border-dark-border" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-dark-border flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400">{group.nome}</h2>
            <p className="text-gray-400 mt-1">Detalhes do Grupo Empresarial</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
        </div>
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <p className="text-sm font-semibold text-gray-400">Responsável</p>
            <p className="text-lg">{group.responsavel.nome}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-400">E-mail de Contato</p>
            <p className="text-lg">{group.responsavel.email}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-400">Empresas Associadas</p>
            {group.empresas && group.empresas.length > 0 ? (
              <ul className="mt-2 space-y-2 bg-dark-background p-3 rounded-lg border border-dark-border">
                {group.empresas.map((empresa, index) => (
                  <li key={index} className="flex justify-between items-center bg-dark-card p-2 rounded">
                    <span>{empresa}</span>
                    <button onClick={() => onRemoveCompany(empresa)} className="text-red-500 hover:text-red-400 p-1 rounded-full transition-colors" title={`Remover ${empresa}`}>
                      <DeleteIcon />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-gray-500 italic bg-dark-background p-3 rounded-lg border border-dark-border">Nenhuma empresa associada a este grupo.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EditGroupModal: React.FC<{
  group: Grupo | null;
  onClose: () => void;
  onSave: (originalGroup: Grupo, newData: { nome: string; responsavelNome: string; responsavelEmail: string }) => void;
  isSaving: boolean;
}> = ({ group, onClose, onSave, isSaving }) => {
    const [formData, setFormData] = useState({
        nome: '',
        responsavelNome: '',
        responsavelEmail: '',
    });

    useEffect(() => {
        if (group) {
            setFormData({
                nome: group.nome,
                responsavelNome: group.responsavel.nome,
                responsavelEmail: group.responsavel.email,
            });
        }
    }, [group]);

    if (!group) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!group) return;

        const hasChanged = formData.nome !== group.nome ||
                           formData.responsavelNome !== group.responsavel.nome ||
                           formData.responsavelEmail !== group.responsavel.email;

        if (hasChanged) {
            onSave(group, formData);
        } else {
            onClose(); // No changes, just close
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex justify-center items-center p-4">
            <div className="bg-dark-card rounded-xl shadow-2xl w-full max-w-lg border border-dark-border" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-dark-border flex justify-between items-center">
                    <h3 className="text-xl font-bold text-cyan-400">Editar Grupo: {group.nome}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Grupo</label>
                        <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="w-full px-3 py-2 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Responsável</label>
                        <input type="text" name="responsavelNome" value={formData.responsavelNome} onChange={handleChange} className="w-full px-3 py-2 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">E-mail</label>
                        <input type="email" name="responsavelEmail" value={formData.responsavelEmail} onChange={handleChange} className="w-full px-3 py-2 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                </div>
                <div className="p-6 flex-shrink-0 border-t border-dark-border flex justify-end gap-4">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gray-600 text-gray-200 hover:bg-gray-700 transition-colors">Cancelar</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const GruposEmpresariais = () => {
  const { fetchGrupos, grupos, createGroup, deleteGroup, updateGroup, addCompaniesToGroup, removeCompanyFromGroup } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    grupo: '',
    responsavel: '',
    email: '',
    senha: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [editingGroup, setEditingGroup] = useState<Grupo | null>(null);
  const [groupForAddingCompanies, setGroupForAddingCompanies] = useState<Grupo | null>(null);
  const [viewingGroup, setViewingGroup] = useState<Grupo | null>(null);
  const [companyToRemove, setCompanyToRemove] = useState<{ group: Grupo, companyName: string } | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<Grupo | null>(null);

  useEffect(() => {
    const loadGrupos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await fetchGrupos();
      } catch (err) {
        setError("Falha ao carregar os grupos.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadGrupos();
  }, [fetchGrupos]);

  const showApiMessage = (message: string, type: 'success' | 'error') => {
      setSaveMessage({ type, text: message });
      setTimeout(() => setSaveMessage(null), 4000);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveNewGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { grupo, responsavel, email, senha } = formState;

    if (!grupo || !responsavel || !email || !senha) {
        showApiMessage('Todos os campos são obrigatórios.', 'error');
        return;
    }

    setIsSaving(true);
    const result = await createGroup(grupo, responsavel, email, senha);
    showApiMessage(result.message, result.success ? 'success' : 'error');

    if (result.success) {
        setFormState({ grupo: '', responsavel: '', email: '', senha: '' });
    }
    setIsSaving(false);
  };

  const handleUpdateGroup = async (originalGroup: Grupo, newData: { nome: string; responsavelNome: string; responsavelEmail: string }) => {
    setIsSaving(true);
    const result = await updateGroup(originalGroup, newData);
    showApiMessage(result.message, result.success ? 'success' : 'error');
    if (result.success) {
        setEditingGroup(null);
    }
    setIsSaving(false);
  };
  
  const handleDeleteClick = (grupo: Grupo) => {
    setGroupToDelete(grupo);
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;
    setIsSaving(true);
    const result = await deleteGroup(groupToDelete);
    showApiMessage(result.message, result.success ? 'success' : 'error');
    setGroupToDelete(null);
    setIsSaving(false);
  };

  const handleAddCompaniesConfirm = async (selectedCompanyNames: string[]) => {
    if (!groupForAddingCompanies) return;
    setIsSaving(true);
    const result = await addCompaniesToGroup(groupForAddingCompanies.id, selectedCompanyNames);
    showApiMessage(result.message, result.success ? 'success' : 'error');
    if (result.success) {
        setGroupForAddingCompanies(null);
    }
    setIsSaving(false);
  };
  
  const handleConfirmRemoveCompany = async () => {
    if (!companyToRemove) return;
    setIsSaving(true);
    const result = await removeCompanyFromGroup(companyToRemove.group.id, companyToRemove.companyName);
    showApiMessage(result.message, result.success ? 'success' : 'error');
    if (result.success) {
        if (viewingGroup) {
            setViewingGroup(prev => prev ? {...prev, empresas: prev.empresas.filter(e => e !== companyToRemove.companyName)} : null);
        }
    }
    setCompanyToRemove(null);
    setIsSaving(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {companyToRemove && (
            <ConfirmationModal
                isOpen={true}
                onClose={() => setCompanyToRemove(null)}
                onConfirm={handleConfirmRemoveCompany}
                title="Confirmar Remoção"
                confirmButtonText="Remover"
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            >
                <p>Tem certeza que deseja remover a empresa <strong className="text-cyan-400">{companyToRemove.companyName}</strong> do grupo <strong className="text-cyan-400">{companyToRemove.group.nome}</strong>?</p>
            </ConfirmationModal>
        )}
        {groupToDelete && (
            <ConfirmationModal
                isOpen={!!groupToDelete}
                onClose={() => setGroupToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão de Grupo"
                confirmButtonText="Excluir Permanentemente"
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            >
                <p>Tem certeza que deseja excluir o grupo <strong className="text-cyan-400">{groupToDelete.nome}</strong>?</p>
                <p className="mt-2 text-sm text-yellow-400">Esta ação é irreversível.</p>
            </ConfirmationModal>
        )}
        <div className="lg:col-span-3 bg-dark-card p-4 sm:p-6 rounded-xl shadow-md border border-dark-border">
            <h3 className="text-xl font-semibold mb-4">Grupos Existentes</h3>
            {isLoading && <p className="text-gray-400">Carregando grupos...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && !error && (
                <ul className="space-y-3">
                    {grupos.length > 0 ? grupos.map(g => (
                        <li key={g.id} onClick={() => setViewingGroup(g)} className="p-3 bg-dark-background rounded-lg border border-dark-border flex items-center justify-between gap-2 cursor-pointer hover:border-cyan-400/50 transition-colors">
                            <span className="flex-grow font-medium">{g.nome}</span>
                            <div className="flex items-center gap-2 shrink-0">
                                <button onClick={(e) => { e.stopPropagation(); setEditingGroup(g);}} className="text-blue-500 hover:text-blue-700" title="Editar Grupo"><EditIcon /></button>
                                <button onClick={(e) => { e.stopPropagation(); setGroupForAddingCompanies(g);}} className="text-cyan-500 hover:text-cyan-700" title="Adicionar Empresas"><BuildingOfficeIcon /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(g);}} className="text-red-500 hover:text-red-700" title="Excluir Grupo"><DeleteIcon /></button>
                            </div>
                        </li>
                    )) : (<p className="text-gray-400 text-center py-4">Nenhum grupo encontrado.</p>)}
                </ul>
            )}
        </div>
        <div className="lg:col-span-2 bg-dark-card p-4 sm:p-6 rounded-xl shadow-md border border-dark-border">
            <h3 className="text-xl font-semibold mb-4">Adicionar Novo Grupo</h3>
            <form onSubmit={handleSaveNewGroup} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Grupo</label>
                    <input type="text" name="grupo" value={formState.grupo} onChange={handleFormChange} className="w-full px-3 py-2 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Responsável</label>
                    <input type="text" name="responsavel" value={formState.responsavel} onChange={handleFormChange} className="w-full px-3 py-2 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">E-mail de Acesso</label>
                    <input type="email" name="email" value={formState.email} onChange={handleFormChange} className="w-full px-3 py-2 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Senha de Acesso</label>
                    <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} name="senha" value={formState.senha} onChange={handleFormChange} className="w-full px-3 py-2 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center" aria-label="Toggle password visibility">
                           {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>

                {saveMessage && (<p className={`text-sm text-center ${saveMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{saveMessage.text}</p>)}

                <button type="submit" disabled={isSaving} className="w-full px-4 py-3 font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-wait">
                    {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
            </form>
        </div>
        <AddCompaniesToGroupModal
            group={groupForAddingCompanies}
            onClose={() => setGroupForAddingCompanies(null)}
            onConfirm={handleAddCompaniesConfirm}
            isSubmitting={isSaving}
        />
        <GroupDetailModal 
            group={viewingGroup} 
            onClose={() => setViewingGroup(null)} 
            onRemoveCompany={(companyName) => {
                if(viewingGroup) {
                    setCompanyToRemove({ group: viewingGroup, companyName });
                }
            }}
        />
        <EditGroupModal
            group={editingGroup}
            onClose={() => setEditingGroup(null)}
            onSave={handleUpdateGroup}
            isSaving={isSaving}
        />
    </div>
  );
};

// Main Admin Page Component
const AdminPage: React.FC = () => {
    const { addAdmin, addCategory, deleteCategory, addQuestion, deleteQuestion, deleteAdmin, categories, fetchAdminQuestionnaireData, fetchApprovedUsersLogs, approveUser, rejectUser, updateCategory, updateQuestion, updateAdmin, addSegmento, updateSegmento, deleteSegmento, fetchSegmentos, segmentos, questions, fetchAdmins } = useApp();
    const [activeView, setActiveView] = useState<'painel' | 'grupos' | 'segmentos'>('painel');
    const [apiMessage, setApiMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    
    type QuestionDataType = { categoryId: string; text: string; answers: { text: string; score: number }[], targetRole: UserRole.COMPANY | UserRole.EMPLOYEE };
    type AdminDataType = { name: string, email: string, password: string, phone: string };
    type AdminUpdateType = { name?: string; email?: string; phone?: string; password?: string };

    type ModalStateType =
        { isOpen: false } | 
        { isOpen: true, type: 'delete-category', category: Category } |
        { isOpen: true, type: 'edit-category', category: Category, newName: string } |
        { isOpen: true, type: 'delete-question', question: Question } |
        { isOpen: true, type: 'edit-question', question: Question } |
        { isOpen: true, type: 'user', user: User } |
        { isOpen: true, type: 'add-admin', data: AdminDataType } |
        { isOpen: true, type: 'edit-admin', user: User, updates: AdminUpdateType } |
        { isOpen: true, type: 'add-category', name: string } |
        { isOpen: true, type: 'add-question', data: QuestionDataType } |
        { isOpen: true, type: 'approve-user', user: User } |
        { isOpen: true, type: 'reject-user', user: User } |
        { isOpen: true, type: 'add-segmento', name: string } |
        { isOpen: true, type: 'edit-segmento', segmento: Segmento, newName: string } |
        { isOpen: true, type: 'delete-segmento', segmento: Segmento };

    const [modalState, setModalState] = useState<ModalStateType>({ isOpen: false });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        if (activeView === 'segmentos') {
          fetchSegmentos();
        }
    }, [activeView, fetchSegmentos]);

    useEffect(() => {
        const initialFetch = async () => {
            // fetchPendingUsers is now called globally in App.tsx for admins
            if (fetchApprovedUsersLogs) {
                await fetchApprovedUsersLogs();
            }
            if (fetchAdminQuestionnaireData) {
                await fetchAdminQuestionnaireData();
            }
            if (fetchAdmins) {
                await fetchAdmins();
            }
        }
        
        initialFetch();
    }, [fetchAdminQuestionnaireData, fetchApprovedUsersLogs, fetchAdmins]);

    const openDeleteCategoryModal = (category: Category) => {
        setModalState({ isOpen: true, type: 'delete-category', category });
    };

    const openUpdateCategoryModal = (category: Category, newName: string) => {
        setModalState({ isOpen: true, type: 'edit-category', category, newName });
    };
    
    const openDeleteQuestionModal = (question: Question) => {
        setModalState({ isOpen: true, type: 'delete-question', question });
    };

    const openUpdateQuestionModal = (question: Question) => {
        setModalState({ isOpen: true, type: 'edit-question', question });
    };

    const openDeleteUserModal = (user: User) => {
        setModalState({ isOpen: true, type: 'user', user });
    };

    const openAddAdminModal = (data: AdminDataType) => {
        setModalState({ isOpen: true, type: 'add-admin', data });
    };

    const openUpdateAdminModal = (user: User, updates: AdminUpdateType) => {
        setModalState({ isOpen: true, type: 'edit-admin', user, updates });
    };
    
    const openAddCategoryModal = (name: string) => {
        setModalState({ isOpen: true, type: 'add-category', name });
    };

    const openAddQuestionModal = (data: QuestionDataType) => {
        setModalState({ isOpen: true, type: 'add-question', data });
    };

    const handleApproveRequest = (user: User) => {
        setModalState({ isOpen: true, type: 'approve-user', user });
    };

    const handleRejectRequest = (user: User) => {
        setModalState({ isOpen: true, type: 'reject-user', user });
    };
    
    // Segment Modals
    const openAddSegmentoModal = (name: string) => setModalState({ isOpen: true, type: 'add-segmento', name });
    const openUpdateSegmentoModal = (segmento: Segmento, newName: string) => setModalState({ isOpen: true, type: 'edit-segmento', segmento, newName });
    const openDeleteSegmentoModal = (segmento: Segmento) => setModalState({ isOpen: true, type: 'delete-segmento', segmento });

    const closeModal = () => {
        setModalState({ isOpen: false });
    };

    const handleConfirm = async () => {
        if (!modalState.isOpen) return;

        const commonAction = async (action: () => Promise<any>) => {
            closeModal();
            setIsSubmitting(true);
            let resultMessage = '';
            let resultType: 'success' | 'error' = 'success';

            try {
                const result = await action();
                if (result && result.success === false) {
                    throw new Error(result.message || "A operação falhou.");
                }
                resultMessage = result?.message || "Operação concluída com sucesso!";
                resultType = 'success';
            } catch (error) {
                console.error("Action failed:", error);
                resultMessage = `Ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
                resultType = 'error';
            } finally {
                setIsSubmitting(false);
                setApiMessage({ text: resultMessage, type: resultType });
            }
        };

        switch (modalState.type) {
            case 'add-admin':
                 await commonAction(async () => {
                    return await addAdmin(modalState.data.name, modalState.data.email, modalState.data.password, modalState.data.phone);
                });
                break;
            case 'edit-admin':
                 await commonAction(async () => {
                    return await updateAdmin(modalState.user, modalState.updates);
                });
                break;
            case 'add-category':
                await commonAction(async () => {
                    await addCategory(modalState.name);
                    await fetchAdminQuestionnaireData();
                });
                break;
            case 'add-question':
                await commonAction(async () => {
                    await addQuestion(modalState.data.categoryId, modalState.data.text, modalState.data.answers, modalState.data.targetRole);
                    await fetchAdminQuestionnaireData();
                });
                break;
             case 'approve-user':
                await commonAction(async () => {
                    const result = await approveUser(modalState.user);
                    if (result.success && fetchApprovedUsersLogs) {
                        await fetchApprovedUsersLogs();
                        // fetchPendingUsers is now handled by the context after the action
                    }
                    return result;
                });
                break;
            case 'reject-user':
                await commonAction(async () => {
                    const result = await rejectUser(modalState.user);
                    // fetchPendingUsers is now handled by the context after the action
                    return result;
                });
                break;
            case 'delete-category':
                await commonAction(async () => {
                    const result = await deleteCategory(modalState.category);
                    if (result.success) {
                        await fetchAdminQuestionnaireData();
                    }
                    return result;
                });
                break;
            case 'edit-category':
                await commonAction(async () => {
                    const result = await updateCategory(modalState.category, modalState.newName);
                    if (result.success) {
                        await fetchAdminQuestionnaireData();
                    }
                    return result;
                });
                break;
            case 'delete-question':
                await commonAction(async () => {
                    const result = await deleteQuestion(modalState.question);
                    if (result.success) {
                        await fetchAdminQuestionnaireData();
                    }
                    return result;
                });
                break;
            case 'edit-question':
                 await commonAction(async () => {
                    const result = await updateQuestion(modalState.question);
                    if (result.success) {
                        await fetchAdminQuestionnaireData();
                    }
                    return result;
                });
                break;
            case 'user':
                await commonAction(async () => {
                    return await deleteAdmin(modalState.user);
                });
                break;
            case 'add-segmento':
                await commonAction(() => addSegmento(modalState.name));
                break;
            case 'edit-segmento':
                await commonAction(() => updateSegmento(modalState.segmento, modalState.newName));
                break;
            case 'delete-segmento':
                await commonAction(() => deleteSegmento(modalState.segmento));
                break;
        }
    };
    
    const modalContent = useMemo(() => {
        if (!modalState.isOpen) return { title: '', children: null, confirmButtonText: undefined, confirmButtonClass: undefined };

        switch (modalState.type) {
            case 'delete-category': {
                const categoryBeingDeleted = modalState.category;
                return {
                    title: 'Confirmar Exclusão de Categoria',
                    children: (
                        <>
                            <p>Você tem certeza que deseja excluir a categoria?</p>
                            <span className="font-bold text-red-500 block mt-2">
                                Atenção: As perguntas dentro da categoria "{categoryBeingDeleted?.name}" NÃO serão excluídas.
                            </span>
                             <p className="mt-2">Esta ação não pode ser desfeita.</p>
                        </>
                    ),
                    confirmButtonText: 'Confirmar Exclusão',
                    confirmButtonClass: 'bg-red-600 hover:bg-red-700'
                };
            }
            case 'edit-category': {
                return {
                    title: 'Confirmar Atualização de Categoria',
                    children: (
                        <>
                           <p>Você tem certeza que deseja renomear a categoria</p>
                           <p className="font-bold my-2">"{modalState.category.name}"</p>
                           <p>para</p>
                           <p className="font-bold my-2">"{modalState.newName}"?</p>
                        </>
                    ),
                    confirmButtonText: 'Confirmar Atualização',
                    confirmButtonClass: 'bg-green-600 hover:bg-green-700'
                };
            }
            case 'delete-question':
                return {
                    title: 'Confirmar Exclusão de Pergunta',
                    children: <p>Você tem certeza que deseja excluir a pergunta "<strong>{modalState.question.text}</strong>"? Esta ação não pode ser desfeita.</p>,
                    confirmButtonText: 'Confirmar Exclusão',
                    confirmButtonClass: 'bg-red-600 hover:bg-red-700'
                };
             case 'edit-question': {
                return {
                    title: 'Confirmar Atualização de Pergunta',
                    children: (
                        <p>Você tem certeza que deseja salvar as alterações para a pergunta "<strong>{modalState.question.text}</strong>"?</p>
                    ),
                    confirmButtonText: 'Confirmar Atualização',
                    confirmButtonClass: 'bg-green-600 hover:bg-green-700'
                };
            }
            case 'user': {
                return {
                    title: 'Confirmar Exclusão de Administrador',
                    children: <p>Você tem certeza que deseja excluir o administrador "<strong>{modalState.user.name}</strong>"? Esta ação não pode ser desfeita.</p>,
                    confirmButtonText: 'Confirmar Exclusão',
                    confirmButtonClass: 'bg-red-600 hover:bg-red-700'
                };
            }
             case 'add-admin':
                return {
                    title: 'Confirmar Adição de Administrador',
                    children: <p>Você tem certeza que deseja adicionar <strong>{modalState.data.name}</strong> como um novo administrador?</p>,
                    confirmButtonText: 'Confirmar Adição',
                    confirmButtonClass: 'bg-green-600 hover:bg-green-700'
                };
            case 'edit-admin':
                 return {
                    title: 'Confirmar Atualização de Administrador',
                    children: <p>Você tem certeza que deseja salvar as alterações para o administrador <strong>{modalState.user.name}</strong>?</p>,
                    confirmButtonText: 'Confirmar Atualização',
                    confirmButtonClass: 'bg-green-600 hover:bg-green-700'
                };
            case 'add-category':
                return {
                    title: 'Confirmar Adição de Categoria',
                    children: <p>Você tem certeza que deseja adicionar a nova categoria: <strong>"{modalState.name}"</strong>?</p>,
                    confirmButtonText: 'Confirmar Adição',
                    confirmButtonClass: 'bg-green-600 hover:bg-green-700'
                };
            case 'add-question':
                return {
                    title: 'Confirmar Adição de Pergunta',
                    children: <p>Você tem certeza que deseja adicionar a nova pergunta?</p>,
                    confirmButtonText: 'Confirmar Adição',
                    confirmButtonClass: 'bg-green-600 hover:bg-green-700'
                };
            case 'approve-user':
                 return {
                    title: 'Confirmar Aprovação de Usuário',
                    children: <p>Você tem certeza que deseja aprovar o usuário <strong>{modalState.user.name}</strong> da empresa <strong>{modalState.user.companyName}</strong>?</p>,
                    confirmButtonText: 'Confirmar Aprovação',
                    confirmButtonClass: 'bg-green-600 hover:bg-green-700'
                };
            case 'reject-user':
                 return {
                    title: 'Confirmar Rejeição de Cadastro',
                    children: <p>Tem certeza que deseja rejeitar o cadastro de <strong>{modalState.user.name}</strong> da empresa <strong>{modalState.user.companyName}</strong>? Esta ação é irreversível.</p>,
                    confirmButtonText: 'Confirmar Rejeição',
                    confirmButtonClass: 'bg-red-600 hover:bg-red-700'
                };
            case 'add-segmento':
                return {
                    title: 'Confirmar Adição de Segmento',
                    children: <p>Deseja adicionar o novo segmento: <strong>"{modalState.name}"</strong>?</p>,
                    confirmButtonText: 'Confirmar Adição',
                    confirmButtonClass: 'bg-green-600 hover:bg-green-700'
                };
            case 'edit-segmento':
                return {
                    title: 'Confirmar Atualização de Segmento',
                    children: <p>Deseja renomear o segmento "<strong>{modalState.segmento.name}</strong>" para "<strong>{modalState.newName}</strong>"?</p>,
                    confirmButtonText: 'Confirmar Atualização',
                    confirmButtonClass: 'bg-green-600 hover:bg-green-700'
                };
            case 'delete-segmento':
                return {
                    title: 'Confirmar Exclusão de Segmento',
                    children: <p>Tem certeza que deseja excluir o segmento "<strong>{modalState.segmento.name}</strong>"? Esta ação é irreversível.</p>,
                    confirmButtonText: 'Confirmar Exclusão',
                    confirmButtonClass: 'bg-red-600 hover:bg-red-700'
                };
            default:
                return { title: '', children: null, confirmButtonText: undefined, confirmButtonClass: undefined };
        }
    }, [modalState, categories]);

    const FullScreenLoader = () => (
        <div className="fixed inset-0 bg-dark-background bg-opacity-90 z-50 flex flex-col justify-center items-center p-4">
            <div className="loader-container">
                <div className="loader triangle">
                    <svg viewBox="0 0 86 80">
                        <polygon points="43 8 79 72 7 72"></polygon>
                    </svg>
                </div>
                <div className="loadingtext">
                    <p>Processando</p>
                </div>
            </div>
        </div>
    );
    
    // Novo componente para gerenciar Segmentos
    const SegmentoManager: React.FC = () => {
        const { segmentos } = useApp();
        const [newSegmento, setNewSegmento] = useState('');
        const [editingState, setEditingState] = useState<{ id: string; name: string } | null>(null);

        const handleAdd = (e: React.FormEvent) => {
            e.preventDefault();
            if (newSegmento.trim()) {
                openAddSegmentoModal(newSegmento.trim());
                setNewSegmento('');
            }
        };
        
        const handleSaveEdit = () => {
            if (editingState && editingState.name.trim()) {
                const originalSegmento = segmentos.find(s => s.id === editingState.id);
                if (originalSegmento && originalSegmento.name !== editingState.name.trim()) {
                    openUpdateSegmentoModal(originalSegmento, editingState.name.trim());
                }
                setEditingState(null);
            }
        };

        return (
            <div className="bg-dark-card p-4 sm:p-6 rounded-xl shadow-md border border-dark-border">
                <h3 className="text-xl font-semibold mb-4">Gerenciar Segmentos de Mercado</h3>
                <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2 mb-4">
                    <input type="text" value={newSegmento} onChange={e => setNewSegmento(e.target.value)} placeholder="Nome do novo segmento" className="flex-grow px-3 py-2 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="submit" className="w-full sm:w-auto px-4 py-2 font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all">Adicionar Segmento</button>
                </form>
                <ul className="space-y-2">
                    {segmentos.map(seg => (
                        <li key={seg.id} className="p-3 bg-dark-background rounded-lg border border-dark-border flex items-center justify-between gap-2">
                            {editingState?.id === seg.id ? (
                                <input type="text" value={editingState.name} onChange={e => setEditingState({ ...editingState, name: e.target.value })} className="flex-grow px-2 py-1 border border-dark-border rounded-md bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
                            ) : (
                               <span className="flex-grow">{seg.name}</span>
                            )}
                            
                            <div className="flex items-center gap-2 shrink-0">
                               {editingState?.id === seg.id ? (
                                    <>
                                        <button onClick={handleSaveEdit} className="text-green-500 hover:text-green-700"><SaveIcon /></button>
                                        <button onClick={() => setEditingState(null)} className="text-red-500 hover:text-red-700"><CancelIcon /></button>
                                    </>
                               ) : (
                                    <>
                                        <button onClick={() => setEditingState({id: seg.id, name: seg.name})} className="text-blue-500 hover:text-blue-700"><EditIcon /></button>
                                        <button onClick={() => openDeleteSegmentoModal(seg)} className="text-red-500 hover:text-red-700"><DeleteIcon /></button>
                                    </>
                               )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <>
            {isSubmitting && <FullScreenLoader />}
            <ApiMessageModal message={apiMessage} onClose={() => setApiMessage(null)} />
            <div className="container mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold">Painel do Administrador</h1>
                    <div className="flex items-center bg-dark-card p-1 rounded-full border border-dark-border self-start sm:self-center">
                        <button onClick={() => setActiveView('painel')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${activeView === 'painel' ? 'bg-cyan-500 text-white' : 'text-gray-300'}`}>
                            Painel
                        </button>
                         <button onClick={() => setActiveView('segmentos')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${activeView === 'segmentos' ? 'bg-cyan-500 text-white' : 'text-gray-300'}`}>
                            Segmentos
                        </button>
                        <button onClick={() => setActiveView('grupos')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${activeView === 'grupos' ? 'bg-cyan-500 text-white' : 'text-gray-300'}`}>
                            Grupos Empresariais
                        </button>
                    </div>
                </div>

                {activeView === 'painel' ? (
                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                        <div className="space-y-8">
                            <PendingApprovals onApproveRequest={handleApproveRequest} onRejectRequest={handleRejectRequest} />
                            <AdminUserManager 
                               onAddRequest={openAddAdminModal}
                               onUpdateRequest={openUpdateAdminModal}
                               onDeleteRequest={openDeleteUserModal} />
                        </div>
                        <div className="space-y-8">
                            <CategoryManager 
                                onAddRequest={openAddCategoryModal}
                                onUpdateRequest={openUpdateCategoryModal}
                                onDeleteRequest={openDeleteCategoryModal} 
                            />
                            <QuestionManager 
                                onAddRequest={openAddQuestionModal} 
                                onDeleteRequest={openDeleteQuestionModal}
                                onUpdateRequest={openUpdateQuestionModal}
                            />
                        </div>
                         <div className="xl:col-span-2">
                           <ActivityLog />
                         </div>
                    </div>
                ) : activeView === 'grupos' ? (
                    <GruposEmpresariais />
                ) : (
                    <SegmentoManager />
                )}
            </div>
            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                onConfirm={handleConfirm}
                title={modalContent.title}
                confirmButtonText={modalContent.confirmButtonText}
                confirmButtonClass={modalContent.confirmButtonClass}
            >
                {modalContent.children}
            </ConfirmationModal>
        </>
    );
};

export default AdminPage;