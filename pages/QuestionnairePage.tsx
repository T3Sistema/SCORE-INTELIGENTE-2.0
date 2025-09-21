
import React, { useState, useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import { Category, Question, UserRole } from '../types';

const QuestionnairePage: React.FC = () => {
    const { currentUser, categories, questions, addSubmission, submissions } = useApp();
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    // Store selected answer ID for each question to ensure unique selection
    const [currentAnswers, setCurrentAnswers] = useState<{ [questionId: string]: string }>({});
    const [message, setMessage] = useState('');

    // State for Admin view
    const [adminViewTarget, setAdminViewTarget] = useState<UserRole.COMPANY | UserRole.EMPLOYEE>(UserRole.COMPANY);
    const [adminViewingCategory, setAdminViewingCategory] = useState<Category | null>(null);

    if (!currentUser) return <p>Por favor, faça login para responder a um questionário.</p>;
    
    // --- ADMIN VIEW ---
    if (currentUser.role === UserRole.ADMIN) {
        const categoriesForAdminView = useMemo(() => {
            return categories.filter(cat =>
                questions.some(q => q.categoryId === cat.id && q.targetRole === adminViewTarget)
            );
        }, [categories, questions, adminViewTarget]);

        const questionsForAdminView = useMemo(() => {
            if (!adminViewingCategory) return [];
            return questions.filter(q => q.categoryId === adminViewingCategory.id && q.targetRole === adminViewTarget);
        }, [adminViewingCategory, questions, adminViewTarget]);

        if (adminViewingCategory) {
            return (
                <div className="max-w-4xl mx-auto">
                    <button onClick={() => setAdminViewingCategory(null)} className="mb-6 text-sm font-medium text-cyan-400 hover:underline">&larr; Voltar para as categorias</button>
                    <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">{adminViewingCategory.name}</h1>
                    <p className="mb-8 text-gray-400">Visualizando perguntas para: <span className="font-semibold">{adminViewTarget === UserRole.COMPANY ? 'Empresas' : 'Funcionários'}</span></p>
                    
                    <div className="space-y-8">
                        {questionsForAdminView.length > 0 ? questionsForAdminView.map((q, index) => (
                            <div key={q.id} className="p-4 sm:p-6 bg-dark-card rounded-xl shadow-md border border-dark-border">
                                <p className="font-semibold text-lg mb-4">({index + 1}) {q.text}</p>
                                <div className="space-y-3 pl-4 border-l-2 border-dark-border">
                                    {q.answers.map(ans => (
                                        <div key={ans.id} className="block p-3 rounded-lg bg-dark-background/50">
                                            <span>{ans.text}</span>
                                            <span className="font-bold text-cyan-400 float-right">{ans.score} pts</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )) : <p className="text-center py-8 text-gray-500">Nenhuma pergunta encontrada nesta categoria.</p>}
                    </div>
                </div>
            );
        }

        return (
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Visualizador de Questionários</h1>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2 text-center">Visualizar questionários para:</label>
                    <div className="flex items-center justify-center bg-dark-background p-1 rounded-full border border-dark-border max-w-sm mx-auto">
                        <button
                            type="button"
                            onClick={() => setAdminViewTarget(UserRole.COMPANY)}
                            className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${adminViewTarget === UserRole.COMPANY ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            Empresas
                        </button>
                        <button
                            type="button"
                            onClick={() => setAdminViewTarget(UserRole.EMPLOYEE)}
                            className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${adminViewTarget === UserRole.EMPLOYEE ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            Funcionários
                        </button>
                    </div>
                </div>
                
                {categoriesForAdminView.length > 0 ? (
                    <div className="space-y-4">
                        {categoriesForAdminView.map(cat => (
                            <button key={cat.id} onClick={() => setAdminViewingCategory(cat)} className="w-full text-left p-4 sm:p-6 bg-dark-card rounded-xl shadow-md border border-dark-border hover:shadow-xl hover:border-cyan-400 hover:-translate-y-1 transition-all duration-300 ease-in-out">
                                <h2 className="text-xl font-semibold text-cyan-400">{cat.name}</h2>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-center p-6 sm:p-8 bg-dark-card rounded-xl shadow-md border border-dark-border">
                        Nenhum questionário encontrado para {adminViewTarget === UserRole.COMPANY ? 'Empresas' : 'Funcionários'}.
                    </p>
                )}
            </div>
        );
    }

    // --- NON-ADMIN VIEW (Existing code) ---

    const availableCategories = useMemo(() => {
        if (!currentUser) return [];
        
        const completedCategoryIds = submissions
            .filter(s => s.userId === currentUser.id)
            .map(s => s.categoryId);

        // Filter out completed categories AND categories with no questions for the user's role
        return categories.filter(category => {
            const isCompleted = completedCategoryIds.includes(category.id);
            const hasQuestionsForRole = questions.some(q => q.categoryId === category.id && q.targetRole === currentUser.role);
            return !isCompleted && hasQuestionsForRole;
        });
    }, [categories, questions, submissions, currentUser]);

    const questionsForCategory = useMemo(() => {
        if (!selectedCategory || !currentUser) return [];
        return questions.filter(q => q.categoryId === selectedCategory.id && q.targetRole === currentUser.role);
    }, [selectedCategory, questions, currentUser]);

    const handleSelectCategory = (categoryId: string) => {
        const category = categories.find(c => c.id === categoryId);
        setSelectedCategory(category || null);
        setCurrentAnswers({});
        setMessage('');
    };
    
    // Store the ID of the answer, not the score, to handle unique selections
    const handleAnswerSelect = (questionId: string, answerId: string) => {
        setCurrentAnswers(prev => ({ ...prev, [questionId]: answerId }));
    };

    const handleSubmit = () => {
        if (!currentUser || !selectedCategory) return;

        const answersWithScores: { questionId: string; score: number }[] = [];
        let totalScore = 0;

        // Calculate total score based on the selected answer IDs
        for (const questionId in currentAnswers) {
            const selectedAnswerId = currentAnswers[questionId];
            const question = questionsForCategory.find(q => q.id === questionId);
            const answer = question?.answers.find(a => a.id === selectedAnswerId);

            if (answer) {
                answersWithScores.push({ questionId, score: answer.score });
                totalScore += answer.score;
            }
        }
        
        const maxScore = questionsForCategory.reduce((sum, q) => {
             const questionMaxScore = q.answers.length > 0 ? Math.max(...q.answers.map(a => a.score)) : 0;
             return sum + questionMaxScore;
        }, 0);


        addSubmission({
            userId: currentUser.id,
            companyName: currentUser.companyName,
            categoryId: selectedCategory.id,
            categoryName: selectedCategory.name,
            answers: answersWithScores,
            totalScore,
            maxScore,
        });

        setMessage('Questionário enviado com sucesso! Veja seus resultados no painel.');
        setSelectedCategory(null);
    };

    if (message) {
        return (
             <div className="max-w-2xl mx-auto text-center bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-xl shadow-lg border border-light-border dark:border-dark-border">
                <p className="text-xl text-green-600 dark:text-green-400">{message}</p>
                <button onClick={() => window.location.hash = '#dashboard'} className="mt-6 px-6 py-2 font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all">Ir para o Painel</button>
             </div>
        );
    }
    
    if (!selectedCategory) {
        return (
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Selecione um Questionário</h1>
                {availableCategories.length > 0 ? (
                    <div className="space-y-4">
                        {availableCategories.map(cat => (
                            <button key={cat.id} onClick={() => handleSelectCategory(cat.id)} className="w-full text-left p-4 sm:p-6 bg-light-card dark:bg-dark-card rounded-xl shadow-md border border-light-border dark:border-dark-border hover:shadow-xl hover:border-blue-500 dark:hover:border-cyan-400 hover:-translate-y-1 transition-all duration-300 ease-in-out">
                                <h2 className="text-xl font-semibold text-blue-600 dark:text-cyan-400">{cat.name}</h2>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-center p-6 sm:p-8 bg-light-card dark:bg-dark-card rounded-xl shadow-md border border-light-border dark:border-dark-border">Você completou todos os questionários disponíveis.</p>
                )}
            </div>
        );
    }

    const allQuestionsAnswered = Object.keys(currentAnswers).length === questionsForCategory.length;

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => setSelectedCategory(null)} className="mb-6 text-sm font-medium text-blue-600 dark:text-cyan-400 hover:underline">&larr; Voltar para as categorias</button>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">{selectedCategory.name}</h1>
            <p className="mb-8 text-gray-600 dark:text-gray-400">Por favor, responda a todas as perguntas da melhor maneira possível.</p>
            
            <div className="space-y-8">
                {questionsForCategory.map((q, index) => (
                    <div key={q.id} className="p-4 sm:p-6 bg-light-card dark:bg-dark-card rounded-xl shadow-md border border-light-border dark:border-dark-border">
                        <p className="font-semibold text-lg mb-4">({index + 1}) {q.text}</p>
                        <div className="space-y-3">
                            {q.answers.map(ans => (
                                <label key={ans.id} className={`block p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer ${currentAnswers[q.id] === ans.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 dark:border-cyan-400' : 'border-light-border dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-blue-400'}`}>
                                    <input type="radio" name={q.id} value={ans.id} checked={currentAnswers[q.id] === ans.id} onChange={() => handleAnswerSelect(q.id, ans.id)} className="hidden" />
                                    <span>{ans.text}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 text-center">
                <button 
                    onClick={handleSubmit} 
                    disabled={!allQuestionsAnswered}
                    className="w-full sm:w-auto px-8 py-3 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:shadow-none transition-all"
                >
                    Enviar Questionário
                </button>
                 {!allQuestionsAnswered && <p className="text-xs text-red-500 mt-2">Por favor, responda todas as perguntas antes de enviar.</p>}
            </div>
        </div>
    );
};

export default QuestionnairePage;