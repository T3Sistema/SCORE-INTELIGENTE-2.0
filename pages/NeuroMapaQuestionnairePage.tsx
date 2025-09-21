import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { UserRole, NeuroCategory, NeuroQuestion, NeuroSubmission } from '../types';

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

const AnalysisResultDisplay = ({ text, onReset }: { text: string, onReset: () => void }) => {
    const sections = useMemo(() => {
        if (!text) return [];

        const headersRegex = /(ANÁLISE TRIAD3:.*|NOME DA PERSONA \(TÉCNICO E SIMBÓLICO\)|NÚCLEO MOTIVADOR PRIMÁRIO|ESTRUTURA DE DEFESA \/ FRICÇÃO MAIOR|MAPA DE LINGUAGEM FUNCIONAL \/ ESTILO DE ABORDAGEM|ZONA DE BLOQUEIO OCULTO OU AUTOCENSURA|RECOMENDAÇÃO TRIAD3 PARA EXPANSÃO OU TREINAMENTO|CONCLUSÃO|INSIGHT PARA CRIAÇÃO DE AGENTE PERSONIFICADO BASEADO NESSA MENTE|🧠 IDENTIDADE DO AGENTE)/;

        const parts = text.split(headersRegex).filter(part => part && part.trim() !== '');
        const result = [];
        for (let i = 0; i < parts.length; i += 2) {
            if (parts[i+1]) {
                 result.push({ 
                    title: parts[i].trim(), 
                    content: parts[i+1].trim(),
                    icon: getIconForSection(parts[i].trim()),
                });
            } else {
                 result.push({ 
                    title: "Resultado", 
                    content: parts[i].trim(),
                    icon: getIconForSection("Resultado"),
                });
            }
        }
        return result.length > 0 ? result : [{ title: "Resultado da Análise", content: text, icon: getIconForSection("Resultado da Análise") }];
    }, [text]);

    const renderContent = (content: string) => {
        const processedContent = content.replace(/^([A-Za-z\s()ÁÉÍÓÚÇ/]+:)/gm, '<strong>$1</strong>');
        return <div className="analysis-content" dangerouslySetInnerHTML={{ __html: processedContent.replace(/\n/g, '<p></p>') }} />;
    };

    const mainTitleSection = sections.find(s => s.title.startsWith("ANÁLISE TRIAD3"));
    const otherSections = sections.filter(s => s !== mainTitleSection);

    return (
        <div className="max-w-4xl mx-auto analysis-container">
             <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
             `}</style>
            <div className="animate-fade-in">
                {mainTitleSection && <h1 className="text-2xl sm:text-3xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{mainTitleSection.content}</h1>}
                
                <div className="space-y-6">
                    {otherSections.map((section, index) => (
                        <div key={index} className="analysis-card">
                            <h3 className="analysis-title">
                                {section.icon}
                                <span className="flex-grow">{section.title}</span>
                            </h3>
                            {renderContent(section.content)}
                        </div>
                    ))}
                </div>
                <div className="mt-8 text-center">
                    <button onClick={onReset} className="px-6 py-2 font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all">
                        Voltar para os Questionários
                    </button>
                </div>
            </div>
        </div>
    );
};

const NeuroMapaQuestionnairePage: React.FC = () => {
    const { currentUser, neuroCategories, neuroQuestions, addNeuroMapaSubmission, neuroAnalysisResults, companyNeuroAnalysisResults, fetchNeuroData } = useApp();
    
    const [selectedCategory, setSelectedCategory] = useState<NeuroCategory | null>(null);
    const [currentAnswers, setCurrentAnswers] = useState<{ [questionId: string]: string }>({});
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await fetchNeuroData();
            setIsLoading(false);
        };
        loadData();
    }, [fetchNeuroData]);

    const filterQuestionsForUser = useCallback((questionsToFilter: NeuroQuestion[]) => {
        if (!currentUser) return [];
        return questionsToFilter.filter(q => {
            if (q.targetRole !== currentUser.role) return false;
            switch (q.targetScope) {
                case 'all':
                    return true;
                case 'company_all_employees':
                    if (currentUser.role === UserRole.EMPLOYEE) {
                        return q.targetName === currentUser.companyName;
                    }
                    return false;
                case 'specific':
                    if (currentUser.role === UserRole.COMPANY) {
                        return q.targetName === currentUser.companyName;
                    }
                    if (currentUser.role === UserRole.EMPLOYEE) {
                        return q.targetEmployee?.email === currentUser.email;
                    }
                    return false;
                case 'multiple':
                    if (currentUser.role === UserRole.COMPANY) {
                        return q.targetNames?.includes(currentUser.companyName);
                    }
                    if (currentUser.role === UserRole.EMPLOYEE) {
                        return q.targetEmployees?.some(e => e.email === currentUser.email);
                    }
                    return false;
                default:
                    return false;
            }
        });
    }, [currentUser]);
    
    const availableCategories = useMemo(() => {
        if (!currentUser || neuroQuestions.length === 0 || neuroCategories.length === 0) return [];

        return neuroCategories.filter(category => {
            const hasAlreadyAnswered = currentUser.role === UserRole.EMPLOYEE
              ? neuroAnalysisResults.some(r => r.email === currentUser.email && r.categoria === category.name)
              : companyNeuroAnalysisResults.some(r => r.empresa === currentUser.companyName && r.categoria === category.name);
              
            if (hasAlreadyAnswered) {
                return false;
            }

            const isForRole = category.targetRole === 'ambos' || category.targetRole === currentUser.role;
            if (!isForRole) return false;
            
            const relevantQuestions = neuroQuestions.filter(q => q.categoryId === category.id);
            return filterQuestionsForUser(relevantQuestions).length > 0;
        });
    }, [currentUser, neuroQuestions, neuroCategories, neuroAnalysisResults, companyNeuroAnalysisResults, filterQuestionsForUser]);

    const questionsForCategory = useMemo(() => {
        if (!selectedCategory) return [];
        const categoryQuestions = neuroQuestions.filter(q => q.categoryId === selectedCategory.id);
        return filterQuestionsForUser(categoryQuestions);
    }, [selectedCategory, neuroQuestions, filterQuestionsForUser]);

    const handleSelectCategory = (categoryId: string) => {
        const category = neuroCategories.find(c => c.id === categoryId);
        setSelectedCategory(category || null);
        setCurrentAnswers({});
        setMessage('');
        setAnalysisResult(null);
    };
    
    const resetViewState = () => {
        setSelectedCategory(null);
        setAnalysisResult(null);
        setMessage('');
    }

    const handleAnswerChange = (questionId: string, answer: string) => {
        setCurrentAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = async () => {
        if (!currentUser || !selectedCategory) return;
        setIsSubmitting(true);
        
        const answersPayload = questionsForCategory.map(q => ({
            questionId: q.id,
            questionText: q.text,
            answer: currentAnswers[q.id] || '',
        }));

        const result = await addNeuroMapaSubmission({
            userId: currentUser.id,
            userName: currentUser.name,
            companyName: currentUser.companyName,
            categoryId: selectedCategory.id,
            categoryName: selectedCategory.name,
            answers: answersPayload
        });

        if (result.success && result.result) {
            setAnalysisResult(result.result);
            setSelectedCategory(null);
        } else {
            setMessage(`Erro: ${result.message || 'Não foi possível enviar suas respostas. Tente novamente.'}`);
        }
        setIsSubmitting(false);
    };

    if (!currentUser) return <p>Por favor, faça login para responder ao NeuroMapa.</p>;
    
    if (isLoading) {
        return (
            <div className="bg-dark-background text-dark-text min-h-screen font-sans flex flex-col justify-center items-center p-4">
                <div className="loader-container">
                    <div className="loader triangle">
                        <svg viewBox="0 0 86 80">
                            <polygon points="43 8 79 72 7 72"></polygon>
                        </svg>
                    </div>
                    <div className="loadingtext"><p>Carregando Questionários</p></div>
                </div>
            </div>
        );
    }

    if (isSubmitting) {
        return (
            <div className="bg-dark-background text-dark-text min-h-screen font-sans flex flex-col justify-center items-center p-4">
                <div className="loader-container">
                    <div className="loader triangle">
                        <svg viewBox="0 0 86 80">
                            <polygon points="43 8 79 72 7 72"></polygon>
                        </svg>
                    </div>
                    <div className="loadingtext"><p>Processando suas respostas</p></div>
                </div>
            </div>
        );
    }

    if (analysisResult) {
        return <AnalysisResultDisplay text={analysisResult} onReset={resetViewState} />;
    }

    if (message) {
        return (
             <div className="max-w-2xl mx-auto text-center bg-dark-card p-8 rounded-xl shadow-lg border border-dark-border">
                <p className={`text-xl ${message.startsWith('Erro') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>
                <button onClick={() => window.location.hash = '#dashboard'} className="mt-6 px-6 py-2 font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all">
                    Voltar ao Painel
                </button>
             </div>
        );
    }
    
    if (!selectedCategory) {
        return (
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">NeuroMapa</h1>
                <p className="text-center text-gray-400 mb-8">Selecione um dos questionários abaixo para começar.</p>
                {availableCategories.length > 0 ? (
                    <div className="space-y-4">
                        {availableCategories.map(cat => (
                            <button key={cat.id} onClick={() => handleSelectCategory(cat.id)} className="w-full text-left p-6 bg-dark-card rounded-xl shadow-md border border-dark-border hover:shadow-xl hover:border-cyan-400 hover:-translate-y-1 transition-all duration-300 ease-in-out">
                                <h2 className="text-xl font-semibold text-cyan-400">{cat.name}</h2>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-center p-8 bg-dark-card rounded-xl shadow-md border border-dark-border">
                        {neuroCategories.length > 0 
                            ? "Você completou todos os questionários do NeuroMapa disponíveis para você. Obrigado!" 
                            : "Nenhum questionário do NeuroMapa disponível no momento."
                        }
                    </p>
                )}
            </div>
        );
    }

    const allQuestionsAnswered = questionsForCategory.every(q => currentAnswers[q.id] && currentAnswers[q.id].trim() !== '');

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => setSelectedCategory(null)} className="mb-6 text-sm font-medium text-cyan-400 hover:underline">&larr; Voltar para as categorias</button>
            <h1 className="text-4xl font-extrabold mb-2">{selectedCategory.name}</h1>
            <p className="mb-8 text-gray-400">Suas respostas são valiosas. Por favor, responda com atenção.</p>
            
            <div className="space-y-8">
                {questionsForCategory.map((q, index) => (
                    <div key={q.id} className="p-6 bg-dark-card rounded-xl shadow-md border border-dark-border">
                        <p className="font-semibold text-lg mb-4">({index + 1}) {q.text}</p>
                        <div className="space-y-3">
                            {q.isOpenEnded ? (
                                <textarea
                                    value={currentAnswers[q.id] || ''}
                                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                                    placeholder="Sua resposta..."
                                    className="w-full p-3 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                />
                            ) : (
                                q.answers.map(ans => (
                                    <label key={ans.id} className={`block p-4 rounded-lg border-2 transition-all cursor-pointer ${currentAnswers[q.id] === ans.text ? 'border-cyan-400 bg-blue-900/50' : 'border-dark-border hover:bg-gray-800/50 hover:border-blue-400'}`}>
                                        <input
                                            type="radio"
                                            name={q.id}
                                            value={ans.text}
                                            checked={currentAnswers[q.id] === ans.text}
                                            onChange={() => handleAnswerChange(q.id, ans.text)}
                                            className="hidden"
                                        />
                                        <span>{ans.text}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 text-center">
                <button 
                    onClick={handleSubmit} 
                    disabled={!allQuestionsAnswered || isSubmitting}
                    className="w-full sm:w-auto px-8 py-3 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:shadow-none transition-all"
                >
                    {isSubmitting ? 'Enviando...' : 'Enviar NeuroMapa'}
                </button>
                 {!allQuestionsAnswered && <p className="text-xs text-red-500 mt-2">Por favor, responda todas as perguntas antes de enviar.</p>}
            </div>
        </div>
    );
};

export default NeuroMapaQuestionnairePage;