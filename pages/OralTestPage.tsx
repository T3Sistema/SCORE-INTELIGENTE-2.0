

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../hooks/useApp';
import { UserRole, OralTestResult, User } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


interface EligibleSeller {
    userId: string;
    userName: string;
    companyName: string;
    email: string;
    phone: string;
    photoUrl?: string;
    highScores: {
        categoryName: string;
        percentage: number;
        detailedAnswers?: any;
    }[];
    allScores: {
        categoryName: string;
        percentage: number;
        score: number;
        maxScore: number;
        detailedAnswers?: any;
    }[];
}

interface TrackedProof {
    Id: number;
    Nome: string;
    Telefone: string;
    'E-mail': string;
    Empresa: string;
    Pergunta: string;
    'Data de envio': string;
    'Horário de envio': string;
    Categoria: string;
    'Tempo Limite': string;
    Status: 'Em andamento' | 'Respondida' | 'Anulada';
}


const maturityLevels = [
    { level: 'Crítico', range: '0 - 30%', color: '#EF4444' },
    { level: 'Precário', range: '31 - 50%', color: '#F97316' },
    { level: 'Mediano', range: '51 - 70%', color: '#EAB308' },
    { level: 'Avançado', range: '71 - 100%', color: '#22C55E' },
];

const getMaturityLevel = (percentage: number) => {
    if (percentage <= 30) return maturityLevels[0];
    if (percentage <= 50) return maturityLevels[1];
    if (percentage <= 70) return maturityLevels[2];
    return maturityLevels[3];
};

// Icons
const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);
const ListBulletIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);
const MagnifyingGlassIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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
const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
);
const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
);
const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0a5 5 0 01-5 5v2.93zM3 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17a1 1 0 102 0v-2.07A7.001 7.001 0 003 8z" clipRule="evenodd" /></svg>
);
const DocumentTextIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
);
const TrendingUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
);
const QuestionMarkCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
);
const BrainIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a5.5 5.5 0 00-5.5 5.5c0 1.954 1.135 3.653 2.76 4.582A3.502 3.502 0 015.5 16.5a1.5 1.5 0 01-3 0 5.002 5.002 0 00-2.5-4.07A6.502 6.502 0 013.5 9a6.5 6.5 0 0113 0c0 1.593-.57 3.042-1.5 4.148V13.5a1.5 1.5 0 01-3 0 3.5 3.5 0 01-1.76-2.918A5.5 5.5 0 0010 3.5z" /><path d="M13.5 14.5a2 2 0 100-4 2 2 0 000 4zM6.5 14.5a2 2 0 100-4 2 2 0 000 4z" /></svg>
);

type ParsedPrompt = {
    id: number;
    agentName: string;
    originalFullText: string;
};

const SettingsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onApiMessage: (message: { type: 'success' | 'error', text: string }) => void;
}> = ({ isOpen, onClose, onApiMessage }) => {
    const [prompts, setPrompts] = useState<ParsedPrompt[]>([]);
    const [editedTexts, setEditedTexts] = useState<Record<number, string>>({});
    const [activeAgentId, setActiveAgentId] = useState<number | null>(null);
    const [viewModes, setViewModes] = useState<Record<number, 'edit' | 'view'>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState<Record<number, boolean>>({});
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const fetchPrompts = async () => {
                setIsLoading(true);
                setError('');
                try {
                    const response = await fetch('https://webhook.triad3.io/webhook/config-provaoral');
                    if (!response.ok) {
                        throw new Error(`Erro na rede: ${response.statusText}`);
                    }
                    const text = await response.text();
                    const data = text ? JSON.parse(text) : [];
                    
                    if (Array.isArray(data) && data.length > 0) {
                        const parsedPrompts: ParsedPrompt[] = [];
                        const initialTexts: Record<number, string> = {};
                        const initialViewModes: Record<number, 'edit' | 'view'> = {};

                        data.forEach((item: { Id: number, Agentes: string }) => {
                            const match = item.Agentes.match(/^(.*?):(.*)$/s);
                            if (match) {
                                const agentName = match[1].trim();
                                const text = match[2].trim();
                                parsedPrompts.push({ id: item.Id, agentName, originalFullText: item.Agentes });
                                initialTexts[item.Id] = text;
                                initialViewModes[item.Id] = 'view';
                            }
                        });
                        
                        setPrompts(parsedPrompts);
                        setEditedTexts(initialTexts);
                        setViewModes(initialViewModes);
                        if(parsedPrompts.length > 0) {
                            setActiveAgentId(parsedPrompts[0].id);
                        }

                    } else {
                        setError('Nenhum prompt de configuração encontrado.');
                        setPrompts([]);
                    }
                } catch (err) {
                    console.error('Falha ao buscar prompts:', err);
                    setError('Não foi possível carregar os prompts. Verifique a conexão e tente novamente.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPrompts();
        }
    }, [isOpen]);

    const handleSavePrompt = async (promptId: number) => {
        setIsSaving(prev => ({ ...prev, [promptId]: true }));
        const promptToSave = prompts.find(p => p.id === promptId);
        if(!promptToSave) {
            onApiMessage({ type: 'error', text: 'Prompt original não encontrado.' });
            setIsSaving(prev => ({ ...prev, [promptId]: false }));
            return;
        }

        const newAgentesString = `${promptToSave.agentName}: ${editedTexts[promptId]}`;

        try {
            const response = await fetch('https://webhook.triad3.io/webhook/editarprompt-provaoral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Id: promptId,
                    Agentes: newAgentesString
                }),
            });
            const data = await response.json();
            if (response.ok && data.resposta === "Prompt atualizado com sucesso!") {
                onApiMessage({ type: 'success', text: data.resposta });
                
                // Update original text in state to reflect the save
                setPrompts(prev => prev.map(p => p.id === promptId ? {...p, originalFullText: newAgentesString } : p));
                
            } else {
                throw new Error(data.resposta || 'Falha ao atualizar o prompt.');
            }
        } catch (err) {
             const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
             onApiMessage({ type: 'error', text: errorMessage });
        } finally {
            setIsSaving(prev => ({ ...prev, [promptId]: false }));
        }
    };
    
    const handleViewToggle = (promptId: number) => {
        setViewModes(prev => ({...prev, [promptId]: prev[promptId] === 'edit' ? 'view' : 'edit'}));
    };

    if (!isOpen) return null;

    const activePrompt = prompts.find(p => p.id === activeAgentId);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex justify-center items-center p-2 sm:p-4" onClick={onClose}>
            <div 
                className="bg-dark-card font-sans rounded-xl shadow-2xl w-full max-w-5xl h-full max-h-[95vh] flex flex-col border border-dark-border" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 sm:p-6 flex-shrink-0 border-b border-dark-border flex justify-between items-center">
                    <h2 className="text-xl sm:text-2xl font-bold font-montserrat text-cyan-400">Configurações da Prova Oral</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                </div>

                {isLoading ? (
                    <div className="flex-grow flex flex-col justify-center items-center p-4">
                        <div className="loader triangle mx-auto"><svg viewBox="0 0 86 80"><polygon points="43 8 79 72 7 72"></polygon></svg></div>
                        <p className="text-gray-400 mt-4">Carregando configurações...</p>
                    </div>
                ) : error ? (
                    <div className="flex-grow flex justify-center items-center p-4 text-center text-red-400">
                        <p>{error}</p>
                    </div>
                ) : prompts.length === 0 ? (
                     <div className="flex-grow flex justify-center items-center p-4 text-center text-gray-400">
                        <p>Nenhum prompt disponível.</p>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row flex-grow min-h-0">
                        <div className="flex-shrink-0 md:w-64 border-b md:border-b-0 md:border-r border-dark-border p-3 space-y-2">
                             {prompts.map(prompt => (
                                <button
                                    key={prompt.id}
                                    onClick={() => setActiveAgentId(prompt.id)}
                                    className={`w-full text-left p-3 rounded-lg text-sm font-semibold transition-colors ${activeAgentId === prompt.id ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300 hover:bg-dark-border/50'}`}
                                >
                                    {prompt.agentName}
                                </button>
                            ))}
                        </div>
                        <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
                            {activePrompt && (
                                <div key={activePrompt.id}>
                                    <div className="flex justify-between items-center mb-4">
                                         <h3 className="text-xl font-bold font-montserrat text-gray-200">{activePrompt.agentName}</h3>
                                        <div className="flex items-center bg-dark-background p-1 rounded-full border border-dark-border">
                                            <button onClick={() => handleViewToggle(activePrompt.id)} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${viewModes[activePrompt.id] === 'view' ? 'bg-cyan-500 text-white' : 'text-gray-400'}`}>Visualizar</button>
                                            <button onClick={() => handleViewToggle(activePrompt.id)} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${viewModes[activePrompt.id] === 'edit' ? 'bg-cyan-500 text-white' : 'text-gray-400'}`}>Editar</button>
                                        </div>
                                    </div>

                                    {viewModes[activePrompt.id] === 'view' ? (
                                        <div className="prose prose-invert prose-sm max-w-none bg-dark-background p-4 rounded-lg border border-dark-border">
                                            <ReactMarkdown
                                              remarkPlugins={[remarkGfm]}
                                              components={{
                                                h3: ({node, ...props}) => <h3 className="font-montserrat text-lg font-bold mb-2 pb-1 border-b border-dark-border" {...props} />,
                                                p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                                                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-1" {...props} />,
                                                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />,
                                                strong: ({node, ...props}) => <strong className="font-semibold text-cyan-300" {...props} />,
                                                pre: ({node, ...props}) => <pre className="bg-dark-card p-3 rounded-md my-4 overflow-x-auto" {...props} />,
                                                code: ({node, ...props}) => <code className="bg-dark-action px-1 py-0.5 rounded" {...props} />,
                                              }}
                                            >
                                                {editedTexts[activePrompt.id]}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <textarea
                                            value={editedTexts[activePrompt.id] || ''}
                                            onChange={(e) => setEditedTexts(prev => ({...prev, [activePrompt.id]: e.target.value}))}
                                            className="w-full p-3 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[400px] text-sm font-mono leading-relaxed"
                                            placeholder={`Digite o prompt para o agente "${activePrompt.agentName}" aqui...`}
                                        />
                                    )}
                                    
                                    <div className="mt-4 flex justify-end">
                                        <button 
                                            onClick={() => handleSavePrompt(activePrompt.id)}
                                            disabled={isSaving[activePrompt.id]}
                                            className="px-5 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-green-500 disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            {isSaving[activePrompt.id] ? 'Salvando...' : 'Salvar Alterações'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


const SellerDetailModal: React.FC<{ seller: EligibleSeller | null; onClose: () => void; }> = ({ seller, onClose }) => {
    if (!seller) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div 
                className="bg-dark-card rounded-xl shadow-2xl w-full max-w-2xl h-full max-h-[90vh] flex flex-col border border-dark-border" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 flex-shrink-0 border-b border-dark-border flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        {seller.photoUrl && (
                            <img src={seller.photoUrl} alt={seller.userName} className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400" />
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-cyan-400">{seller.userName}</h2>
                            <p className="text-gray-400">{seller.companyName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                    <h3 className="text-xl font-semibold mb-6 text-dark-text">Relatório de Desempenho Completo</h3>
                    <div className="space-y-5">
                        {seller.allScores.map(score => {
                            const maturity = getMaturityLevel(score.percentage);
                            return (
                                <div key={score.categoryName}>
                                    <div className="flex justify-between items-baseline text-sm mb-1.5">
                                        <span className="font-medium text-gray-200">{score.categoryName}</span>
                                        <span className="font-bold text-lg" style={{ color: maturity.color }}>
                                            {score.percentage}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-dark-background rounded-full h-2.5">
                                        <div 
                                            className="h-2.5 rounded-full transition-all duration-500" 
                                            style={{ width: `${score.percentage}%`, backgroundColor: maturity.color }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-gray-400 text-right mt-1">
                                        Nível {maturity.level}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ApplyTestModal: React.FC<{ 
    seller: EligibleSeller | null; 
    onClose: () => void; 
    onConfirm: (payload: {
        seller: EligibleSeller;
        selectedCategories: { categoryName: string, timeLimit: number }[];
    }) => void;
}> = ({ seller, onClose, onConfirm }) => {
    const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({});
    const [timeLimitMode, setTimeLimitMode] = useState<'general' | 'individual'>('general');
    const [generalMinutes, setGeneralMinutes] = useState('5');
    const [generalSeconds, setGeneralSeconds] = useState('0');
    const [individualTimes, setIndividualTimes] = useState<Record<string, { min: string, sec: string }>>({});

    useEffect(() => {
        if (seller) {
            const initialSelection = seller.highScores.reduce((acc, score) => {
                acc[score.categoryName] = true; // Pre-select all high-score categories
                return acc;
            }, {} as Record<string, boolean>);
            setSelectedCategories(initialSelection);
            setTimeLimitMode('general');
            setGeneralMinutes('5');
            setGeneralSeconds('0');
            setIndividualTimes({});
        }
    }, [seller]);

    if (!seller) return null;

    const handleCategoryToggle = (categoryName: string) => {
        setSelectedCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }));
    };
    
    const handleIndividualTimeChange = (categoryName: string, type: 'min' | 'sec', value: string) => {
        setIndividualTimes(prev => ({
            ...prev,
            [categoryName]: {
                ...(prev[categoryName] || { min: '', sec: '' }),
                [type]: value.replace(/[^0-9]/g, '')
            }
        }));
    };

    const handleSubmit = () => {
        const categoriesToSubmit = Object.entries(selectedCategories)
            .filter(([, isSelected]) => isSelected)
            .map(([categoryName]) => {
                let timeLimit = 0;
                if (timeLimitMode === 'general') {
                    timeLimit = (parseInt(generalMinutes, 10) || 0) * 60 + (parseInt(generalSeconds, 10) || 0);
                } else {
                    const times = individualTimes[categoryName] || { min: '', sec: '' };
                    timeLimit = (parseInt(times.min, 10) || 0) * 60 + (parseInt(times.sec, 10) || 0);
                }
                return { categoryName, timeLimit };
            });

        if (categoriesToSubmit.length === 0) {
            alert("Selecione pelo menos uma categoria.");
            return;
        }

        const invalidTime = categoriesToSubmit.some(c => c.timeLimit <= 0);
        if (invalidTime) {
            alert("Todos os tempos limites devem ser maiores que zero.");
            return;
        }
        
        onConfirm({ seller, selectedCategories: categoriesToSubmit });
    };

    const selectedCategoryCount = Object.values(selectedCategories).filter(Boolean).length;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div
                className="bg-dark-card rounded-xl shadow-2xl w-full max-w-2xl h-full max-h-[90vh] flex flex-col border border-dark-border"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 flex-shrink-0 border-b border-dark-border">
                    <h3 className="text-xl font-bold text-dark-text">Aplicar Prova Oral para <span className="text-cyan-400">{seller.userName}</span></h3>
                </div>
                
                <div className="p-6 flex-grow overflow-y-auto space-y-6">
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-3">1. Selecione as Categorias</h4>
                        <div className="space-y-2">
                            {seller.highScores.map(score => (
                                <label key={score.categoryName} className="flex items-center gap-3 p-3 rounded-lg border-2 bg-dark-background border-dark-border hover:border-cyan-500/50 cursor-pointer transition-colors">
                                    <input type="checkbox" checked={selectedCategories[score.categoryName] || false} onChange={() => handleCategoryToggle(score.categoryName)} className="h-5 w-5 rounded border-gray-300 bg-gray-700 text-cyan-600 focus:ring-cyan-500 shrink-0"/>
                                    <span className="flex-grow">{score.categoryName}</span>
                                    <span className="font-bold text-yellow-400">{score.percentage}%</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                         <h4 className="font-semibold text-gray-300 mb-3">2. Defina o Tempo Limite</h4>
                         <div className="flex items-center justify-center bg-dark-background p-1 rounded-full border border-dark-border mb-4">
                            <button onClick={() => setTimeLimitMode('general')} className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-all ${timeLimitMode === 'general' ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>Geral</button>
                            <button onClick={() => setTimeLimitMode('individual')} className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-all ${timeLimitMode === 'individual' ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>Individual</button>
                        </div>
                        
                        {timeLimitMode === 'general' ? (
                             <div className="flex items-center gap-4 justify-center">
                                <input type="number" min="0" value={generalMinutes} onChange={e => setGeneralMinutes(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Min" className="w-24 p-2 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"/>
                                <span className="text-xl font-bold text-gray-400">:</span>
                                <input type="number" min="0" max="59" value={generalSeconds} onChange={e => setGeneralSeconds(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Seg" className="w-24 p-2 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"/>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {Object.entries(selectedCategories).filter(([,isSelected]) => isSelected).map(([categoryName]) => (
                                    <div key={categoryName} className="flex items-center justify-between p-3 bg-dark-background rounded-lg border border-dark-border">
                                        <span className="text-gray-300 text-sm truncate pr-2">{categoryName}</span>
                                        <div className="flex items-center gap-2">
                                            <input type="number" min="0" value={individualTimes[categoryName]?.min || ''} onChange={e => handleIndividualTimeChange(categoryName, 'min', e.target.value)} placeholder="Min" className="w-16 p-1 border border-dark-border rounded-md bg-dark-card focus:outline-none focus:ring-1 focus:ring-blue-500 text-center text-sm"/>
                                            <span className="text-gray-400">:</span>
                                            <input type="number" min="0" max="59" value={individualTimes[categoryName]?.sec || ''} onChange={e => handleIndividualTimeChange(categoryName, 'sec', e.target.value)} placeholder="Seg" className="w-16 p-1 border border-dark-border rounded-md bg-dark-card focus:outline-none focus:ring-1 focus:ring-blue-500 text-center text-sm"/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 flex-shrink-0 border-t border-dark-border flex justify-end gap-4">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gray-600 text-gray-200 hover:bg-gray-700 transition-colors">Cancelar</button>
                    <button onClick={handleSubmit} disabled={selectedCategoryCount === 0} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        Aplicar {selectedCategoryCount > 0 ? `${selectedCategoryCount} Prova(s)` : ''}
                    </button>
                </div>
            </div>
        </div>
    );
};


const ResultDetailModal: React.FC<{
    result: OralTestResult | null;
    onClose: () => void;
}> = ({ result, onClose }) => {
    if (!result) return null;

    const formatSeconds = (seconds: string): string => {
        const totalSeconds = parseInt(seconds, 10);
        if (isNaN(totalSeconds)) return "00:00";
        const min = Math.floor(totalSeconds / 60);
        const sec = totalSeconds % 60;
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    const scoreAnterior = parseInt(result.score_anterior, 10);
    const scoreAtual = parseInt(result.score_atual, 10);
    const scoreDiff = scoreAtual - scoreAnterior;

    const FormattedDetailedResult: React.FC<{ text: string }> = ({ text }) => {
        const parts = text.split('```');
        return (
            <div className="text-sm">
                {parts.map((part, index) => {
                    if (index % 2 === 1) { // This is a code block
                        return (
                            <pre key={index} className="bg-dark-background p-3 rounded-md text-gray-300 font-mono text-xs leading-relaxed overflow-x-auto">
                                {part}
                            </pre>
                        );
                    } else { // This is regular text
                        const formattedPart = part.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-cyan-400">$1</strong>');
                        return <div key={index} className="my-2" dangerouslySetInnerHTML={{ __html: formattedPart.replace(/\n/g, '<br/>') }} />;
                    }
                })}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div 
                className="bg-dark-card rounded-xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col border border-dark-border" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-5 flex-shrink-0 border-b border-dark-border flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <img src={result.foto} alt={result.nome} className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400" />
                        <div className="min-w-0">
                            <h2 className="text-2xl font-bold text-cyan-400 truncate" title={result.categoria || 'Prova Oral'}>{result.categoria || 'Prova Oral'}</h2>
                            <p className="text-lg font-semibold text-gray-300 mt-1">{result.nome}</p>
                            <p className="text-gray-400 mt-1">{result.empresa}</p>
                            <p className="text-sm text-gray-500 mt-1 break-all">{result.email} | {result.telefone}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                </div>
                <div className="p-5 overflow-y-auto flex-grow space-y-5">
                    
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
                        <div className="flex items-center gap-2 bg-dark-background p-2.5 rounded-lg"><CalendarIcon className="h-5 w-5 text-cyan-400 flex-shrink-0" /> <span>{result.data}</span></div>
                        <div className="flex items-center gap-2 bg-dark-background p-2.5 rounded-lg"><ClockIcon className="h-5 w-5 text-cyan-400 flex-shrink-0" /> <span>Início: {result.horario_inicio}</span></div>
                        <div className="flex items-center gap-2 bg-dark-background p-2.5 rounded-lg"><ClockIcon className="h-5 w-5 text-cyan-400 flex-shrink-0" /> <span>Resposta: {result.horario_resposta}</span></div>
                        <div className="flex items-center gap-2 bg-dark-background p-2.5 rounded-lg"><ClockIcon className="h-5 w-5 text-cyan-400 flex-shrink-0" /> <span>Limite: {formatSeconds(result.tempo_limite)}</span></div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                            <StarIcon />
                            <span>Análise de Score</span>
                        </div>
                        <div className="bg-dark-background p-4 rounded-lg flex items-center justify-around text-center border border-dark-border">
                            <div>
                                <p className="text-xs text-gray-400">Anterior</p>
                                <p className="text-2xl font-bold text-gray-400">{scoreAnterior}</p>
                            </div>
                            <TrendingUpIcon className={`h-8 w-8 ${scoreDiff > 0 ? 'text-green-500' : (scoreDiff < 0 ? 'text-red-500 rotate-90' : 'text-gray-500')}`} />
                            <div>
                                <p className="text-xs text-green-400">Atual</p>
                                <p className="text-2xl font-bold text-green-400">{scoreAtual}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                            <QuestionMarkCircleIcon className="h-5 w-5 text-cyan-400" />
                            <span>Pergunta Gerada</span>
                        </div>
                        <div className="text-sm bg-dark-background p-3 rounded-lg border border-dark-border">
                            <p className="whitespace-pre-wrap text-gray-300">{result.pergunta || "Pergunta não disponível."}</p>
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                            <MicrophoneIcon className="h-5 w-5 text-cyan-400" />
                            <span>Áudio da Resposta</span>
                        </div>
                        <audio controls src={result.resposta_funcionario} className="w-full h-14">Seu navegador não suporta o elemento de áudio.</audio>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                            <DocumentTextIcon className="h-5 w-5 text-cyan-400" />
                            <span>Transcrição</span>
                        </div>
                        <div className="text-sm bg-dark-background p-3 rounded-lg max-h-32 overflow-y-auto border border-dark-border">
                            <p className="whitespace-pre-wrap text-gray-300">{result.transcricao || "Transcrição não disponível."}</p>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                            <BrainIcon className="h-5 w-5 text-cyan-400" />
                            <span>Resultado Detalhado</span>
                        </div>
                        <div className="bg-dark-background p-3 rounded-lg border border-dark-border">
                           <FormattedDetailedResult text={result.resultado_detalhado || "Resultado detalhado não disponível."}/>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};


const ResultsPanel: React.FC<{
    results: OralTestResult[];
    isLoading: boolean;
    onViewResult: (result: OralTestResult) => void;
}> = ({ results, isLoading, onViewResult }) => {

    const sortedResults = useMemo(() => {
        return [...results].sort((a, b) => {
            const dateA = a.data.split('/').reverse().join('-');
            const dateB = b.data.split('/').reverse().join('-');
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
    }, [results]);
    
    if (isLoading) {
        return (
             <div className="text-center py-16 bg-dark-card rounded-xl shadow-md border border-dark-border">
                <div className="loader triangle mx-auto"><svg viewBox="0 0 86 80"><polygon points="43 8 79 72 7 72"></polygon></svg></div>
                <p className="text-gray-400 mt-4">Carregando resultados...</p>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="text-center py-16 bg-dark-card rounded-xl shadow-md border border-dark-border">
                <h2 className="text-2xl font-semibold text-dark-text">Nenhum Resultado Disponível</h2>
                <p className="text-gray-400 mt-2">No momento, não há resultados de provas orais para a seleção atual.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedResults.map(result => {
                const scoreAnterior = parseInt(result.score_anterior, 10);
                const scoreAtual = parseInt(result.score_atual, 10);

                return (
                    <div 
                        key={result.id} 
                        className="bg-dark-card rounded-xl shadow-lg border border-dark-border flex flex-col text-left transition-all duration-300 hover:shadow-cyan-500/20 hover:-translate-y-1 cursor-pointer"
                        onClick={() => onViewResult(result)}
                    >
                        <div className="p-5 flex-grow">
                             <div className="flex items-center gap-4 mb-4">
                                <img src={result.foto} alt={result.nome} className="w-16 h-16 rounded-full object-cover border-4 border-cyan-400 flex-shrink-0" />
                                <div className="min-w-0">
                                    <h2 className="text-xl font-bold text-dark-text truncate" title={result.nome}>{result.nome}</h2>
                                    <p className="text-sm font-semibold text-cyan-400">{result.categoria || 'Prova Oral'}</p>
                                    <p className="text-xs text-gray-400 mt-1">{result.empresa}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-400 mb-4 bg-dark-background p-2 rounded-lg">
                                <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> <span>{result.data}</span></div>
                                <div className="font-semibold text-base text-gray-300">
                                    {scoreAnterior} &rarr; <span className="text-green-400">{scoreAtual}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-center bg-dark-border/30 px-5 py-3 text-sm font-semibold text-cyan-400 rounded-b-xl">
                            Ver Detalhes
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const ProofDetailModal: React.FC<{ proof: TrackedProof | null; onClose: () => void; }> = ({ proof, onClose }) => {
    if (!proof) return null;
    
    const formatSeconds = (seconds: string): string => {
        const totalSeconds = parseInt(seconds, 10);
        if (isNaN(totalSeconds)) return "00:00";
        const min = Math.floor(totalSeconds / 60);
        const sec = totalSeconds % 60;
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    const statusClasses = proof.Status === 'Respondida'
        ? 'bg-green-500/20 text-green-300'
        : proof.Status === 'Anulada'
        ? 'bg-gray-500/20 text-gray-300'
        : 'bg-yellow-500/20 text-yellow-300';
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[80] flex justify-center items-center p-4" onClick={onClose}>
            <div 
                className="bg-dark-card rounded-xl shadow-2xl w-full max-w-2xl h-full max-h-[90vh] flex flex-col border border-dark-border" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-5 flex-shrink-0 border-b border-dark-border flex justify-between items-start">
                    <h2 className="text-xl font-bold text-cyan-400">Detalhes da Prova #{proof.Id}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                </div>
                <div className="p-5 overflow-y-auto flex-grow space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><p className="text-sm text-gray-400">Nome:</p><p className="font-semibold">{proof.Nome}</p></div>
                        <div><p className="text-sm text-gray-400">Empresa:</p><p className="font-semibold">{proof.Empresa}</p></div>
                        <div><p className="text-sm text-gray-400">Telefone:</p><p className="font-semibold">{proof.Telefone}</p></div>
                        <div><p className="text-sm text-gray-400">E-mail:</p><p className="font-semibold">{proof['E-mail']}</p></div>
                        <div><p className="text-sm text-gray-400">Enviado em:</p><p className="font-semibold">{proof['Data de envio']} às {proof['Horário de envio']}</p></div>
                        <div><p className="text-sm text-gray-400">Tempo Limite:</p><p className="font-semibold">{formatSeconds(proof['Tempo Limite'])}</p></div>
                    </div>
                     <div><p className="text-sm text-gray-400">Categoria:</p><p className="font-semibold">{proof.Categoria}</p></div>
                     <div><p className="text-sm text-gray-400">Status:</p><p className={`font-semibold inline-block px-3 py-1 rounded-full text-sm ${statusClasses}`}>{proof.Status}</p></div>
                     <div>
                        <p className="text-sm text-gray-400">Pergunta:</p>
                        <p className="font-mono text-sm bg-dark-background p-3 rounded-lg mt-1 whitespace-pre-wrap">{proof.Pergunta}</p>
                    </div>
                </div>
                 <div className="p-5 border-t border-dark-border">
                    <button onClick={onClose} className="w-full px-4 py-2 font-semibold text-white bg-dark-action rounded-lg hover:bg-dark-accent transition-colors">Fechar</button>
                </div>
            </div>
        </div>
    );
};

const ProofTrackingModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    proofs: TrackedProof[];
    isLoading: boolean;
    error: string | null;
}> = ({ isOpen, onClose, proofs, isLoading, error }) => {
    const [filters, setFilters] = useState({ employee: '', company: '', category: '', status: '' });
    const [viewingProof, setViewingProof] = useState<TrackedProof | null>(null);

    const { uniqueCompanies, uniqueCategories, uniqueEmployees } = useMemo(() => {
        if (!proofs) return { uniqueCompanies: [], uniqueCategories: [], uniqueEmployees: [] };
        const companies = [...new Set(proofs.map(p => p.Empresa))].sort((a, b) => a.localeCompare(b));
        const categories = [...new Set(proofs.map(p => p.Categoria))].sort((a, b) => a.localeCompare(b));
        const employees = [...new Set(proofs.map(p => p.Nome))].sort((a, b) => a.localeCompare(b));
        return { uniqueCompanies: companies, uniqueCategories: categories, uniqueEmployees: employees };
    }, [proofs]);

    const filteredProofs = useMemo(() => {
        let tempProofs = [...proofs];

        if (filters.employee) {
            tempProofs = tempProofs.filter(p => p.Nome === filters.employee);
        }
        if (filters.company) {
            tempProofs = tempProofs.filter(p => p.Empresa === filters.company);
        }
        if (filters.category) {
            tempProofs = tempProofs.filter(p => p.Categoria === filters.category);
        }
        if (filters.status) {
            const filterStatus = filters.status.trim().toLowerCase();
            tempProofs = tempProofs.filter(p => p.Status && p.Status.trim().toLowerCase() === filterStatus);
        }

        // Sort by date and time, descending
        return tempProofs.sort((a, b) => {
            const dateA = a['Data de envio'].split('/').reverse().join('-');
            const dateB = b['Data de envio'].split('/').reverse().join('-');
            const dateTimeA = new Date(`${dateA}T${a['Horário de envio']}`);
            const dateTimeB = new Date(`${dateB}T${b['Horário de envio']}`);
            return dateTimeB.getTime() - dateTimeA.getTime();
        });
    }, [proofs, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex justify-center items-center p-2 sm:p-4" onClick={onClose}>
            <ProofDetailModal proof={viewingProof} onClose={() => setViewingProof(null)} />
            <div 
                className="bg-dark-card font-sans rounded-xl shadow-2xl w-full max-w-6xl h-full max-h-[95vh] flex flex-col border border-dark-border" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 sm:p-5 flex-shrink-0 border-b border-dark-border flex justify-between items-center">
                    <h2 className="text-xl sm:text-2xl font-bold font-montserrat text-cyan-400">Acompanhamento de Provas</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                </div>

                <div className="p-4 border-b border-dark-border flex-shrink-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <select name="employee" value={filters.employee} onChange={handleFilterChange} className="p-2 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                            <option value="">Todos os Funcionários</option>
                            {uniqueEmployees.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                         <select name="company" value={filters.company} onChange={handleFilterChange} className="p-2 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                            <option value="">Todas as Empresas</option>
                            {uniqueCompanies.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                        <select name="category" value={filters.category} onChange={handleFilterChange} className="p-2 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                            <option value="">Todas as Categorias</option>
                            {uniqueCategories.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="p-2 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                            <option value="">Todos os Status</option>
                            <option value="Em andamento">Em andamento</option>
                            <option value="Respondida">Respondida</option>
                            <option value="Anulada">Anulada</option>
                        </select>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex-grow flex flex-col justify-center items-center p-4">
                            <div className="loader triangle mx-auto"><svg viewBox="0 0 86 80"><polygon points="43 8 79 72 7 72"></polygon></svg></div>
                            <p className="text-gray-400 mt-4">Carregando provas...</p>
                        </div>
                    ) : error ? (
                        <div className="flex-grow flex justify-center items-center p-4 text-center text-red-400"><p>{error}</p></div>
                    ) : filteredProofs.length === 0 ? (
                        <div className="flex-grow flex justify-center items-center p-4 text-center text-gray-400">
                            <div className="bg-dark-background p-8 rounded-lg">
                                <p>Nenhuma prova encontrada para os filtros selecionados.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredProofs.map(proof => {
                                const statusClasses = proof.Status === 'Respondida' 
                                    ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                    : proof.Status === 'Anulada'
                                    ? 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                                    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
                                return (
                                    <div key={proof.Id} onClick={() => setViewingProof(proof)} className="bg-dark-background p-4 rounded-lg border border-dark-border flex flex-col gap-3 hover:border-cyan-400 transition-colors cursor-pointer">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="min-w-0">
                                                <p className="font-bold text-base truncate" title={proof.Nome}>{proof.Nome}</p>
                                                <p className="text-xs text-gray-400 truncate" title={proof.Empresa}>{proof.Empresa}</p>
                                            </div>
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClasses}`}>
                                                {proof.Status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-300 truncate" title={proof.Categoria}>{proof.Categoria}</p>
                                        <div className="text-xs text-gray-500 flex justify-between items-center mt-auto pt-2 border-t border-dark-border">
                                            <span>#{proof.Id}</span>
                                            <span>{proof['Data de envio']}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

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


const OralTestPage: React.FC = () => {
    const { currentUser, employeeSubmissions, allEmployees, fetchAllEmployees, fetchEmployeeScoresForAdmin, oralTestResults, fetchOralTestResults, startOralTest } = useApp();
    const [eligibleSellers, setEligibleSellers] = useState<EligibleSeller[]>([]);
    const [isLoadingEligible, setIsLoadingEligible] = useState(true);
    const [isLoadingResults, setIsLoadingResults] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<string>('all');
    const [modalSeller, setModalSeller] = useState<EligibleSeller | null>(null);
    const [applyModalSeller, setApplyModalSeller] = useState<EligibleSeller | null>(null);
    const [apiMessage, setApiMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'eligible' | 'results'>('eligible');
    const [viewingResult, setViewingResult] = useState<OralTestResult | null>(null);
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    
    // State for Proof Tracking
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
    const [trackedProofs, setTrackedProofs] = useState<TrackedProof[]>([]);
    const [isLoadingTrackedProofs, setIsLoadingTrackedProofs] = useState(false);
    const [errorTrackedProofs, setErrorTrackedProofs] = useState<string | null>(null);

    const fetchTrackedProofs = useCallback(async () => {
        setIsLoadingTrackedProofs(true);
        setErrorTrackedProofs(null);
        try {
            const response = await fetch('https://webhook.triad3.io/webhook/provas-provaoralfun');
            if (!response.ok) {
                throw new Error('Falha ao buscar as provas. Tente novamente.');
            }
            const text = await response.text();
            if (!text) { // Handle empty response
                setTrackedProofs([]);
                return;
            }
            const data = JSON.parse(text);
            setTrackedProofs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch tracked proofs:", error);
            setErrorTrackedProofs(error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.');
            setTrackedProofs([]);
        } finally {
            setIsLoadingTrackedProofs(false);
        }
    }, []);

    useEffect(() => {
        if (isTrackingModalOpen) {
            fetchTrackedProofs();
        }
    }, [isTrackingModalOpen, fetchTrackedProofs]);


    useEffect(() => {
        if (currentUser?.role === UserRole.ADMIN && !initialDataLoaded) {
            const loadInitialData = async () => {
                setIsLoadingEligible(true);
                try {
                    await fetchTrackedProofs();
                    await Promise.all([
                        fetchEmployeeScoresForAdmin(),
                        fetchAllEmployees()
                    ]);
                } catch (error) {
                    console.error('Error loading initial data for Oral Test page:', error);
                } finally {
                    setIsLoadingEligible(false);
                    setInitialDataLoaded(true);
                }
            };
            loadInitialData();
        }
    }, [fetchEmployeeScoresForAdmin, fetchAllEmployees, currentUser, initialDataLoaded, fetchTrackedProofs]);
    
    useEffect(() => {
        if (activeTab === 'results' && currentUser?.role === UserRole.ADMIN) {
             const loadResults = async () => {
                 setIsLoadingResults(true);
                 await fetchOralTestResults();
                 setIsLoadingResults(false);
             };
             loadResults();
        }
    }, [activeTab, fetchOralTestResults, currentUser]);


    const companies = useMemo(() => {
        const eligibleCompanyNames = new Set(employeeSubmissions.map(sub => sub.companyName));
        const resultsCompanyNames = new Set(oralTestResults.map(res => res.empresa));
        const allCompanyNames = [...new Set([...eligibleCompanyNames, ...resultsCompanyNames])];
        return allCompanyNames.sort((a, b) => a.localeCompare(b));
    }, [employeeSubmissions, oralTestResults]);

    const filteredResults = useMemo(() => {
        return selectedCompany === 'all'
            ? oralTestResults
            : oralTestResults.filter(res => res.empresa === selectedCompany);
    }, [oralTestResults, selectedCompany]);

    useEffect(() => {
        if (employeeSubmissions.length > 0 && allEmployees.length > 0) {
            const filteredSubs = selectedCompany === 'all'
                ? employeeSubmissions
                : employeeSubmissions.filter(sub => sub.companyName === selectedCompany);

            const submissionsByUser = filteredSubs.reduce((acc, sub) => {
                if (!sub.userId) return acc;
                if (!acc[sub.userId]) {
                    acc[sub.userId] = [];
                }
                acc[sub.userId].push(sub);
                return acc;
            }, {} as Record<string, typeof employeeSubmissions>);
            
            const sellers: EligibleSeller[] = [];
            for (const userId in submissionsByUser) {
                const userSubs = submissionsByUser[userId];
                const firstSub = userSubs[0];
                const employeeDetails = allEmployees.find(emp => emp.phone === firstSub.phone || emp.email === (emp as any).email);

                const allScores = userSubs.map(sub => ({
                    categoryName: sub.categoryName,
                    percentage: sub.maxScore > 0 ? Math.round((sub.totalScore / sub.maxScore) * 100) : 0,
                    score: sub.totalScore,
                    maxScore: sub.maxScore,
                    detailedAnswers: sub.detailedAnswers
                })).sort((a, b) => b.percentage - a.percentage);
                
                const highScores = allScores.filter(score => score.percentage > 71);

                if (highScores.length > 0) {
                     const filteredHighScores = highScores.filter(score => 
                        !trackedProofs.some(proof => 
                            (proof.Telefone === firstSub.phone || proof['E-mail'] === employeeDetails?.email) &&
                            proof.Categoria === score.categoryName
                        )
                    );
                    
                    if (filteredHighScores.length > 0) {
                         sellers.push({
                            userId: userId,
                            userName: firstSub.userName || 'Vendedor Desconhecido',
                            companyName: firstSub.companyName,
                            email: employeeDetails?.email || 'N/A',
                            phone: firstSub.phone || 'N/A',
                            photoUrl: firstSub.photoUrl,
                            highScores: filteredHighScores,
                            allScores
                        });
                    }
                }
            }
            setEligibleSellers(sellers);
        } else {
             setEligibleSellers([]);
        }
    }, [employeeSubmissions, selectedCompany, allEmployees, trackedProofs]);

     const handleApplyTestConfirm = useCallback(async (payload: {
        seller: EligibleSeller;
        selectedCategories: { categoryName: string, timeLimit: number }[];
    }) => {
        const { seller, selectedCategories } = payload;
        setApplyModalSeller(null);
        setIsSubmitting(true);
        setApiMessage(null);

        // For now, we only apply one at a time for simplicity of UI and feedback
        if (selectedCategories.length === 0) {
            setApiMessage({ type: 'error', text: 'Nenhuma categoria selecionada.' });
            setIsSubmitting(false);
            return;
        }

        const categoryToApply = selectedCategories[0]; // Assuming one for now, can be extended
        const relevantSubmission = seller.highScores.find(score => score.categoryName === categoryToApply.categoryName);

        const startPayload = {
            employee_data: {
                userId: seller.userId, name: seller.userName, companyName: seller.companyName,
                email: seller.email, phone: seller.phone
            },
            oral_test_data: {
                selected_category: categoryToApply.categoryName,
                tempo_limite_resposta: String(categoryToApply.timeLimit),
                high_score_submissions: relevantSubmission ? [{
                    category: relevantSubmission.categoryName,
                    questions_and_answers: relevantSubmission.detailedAnswers
                }] : []
            }
        };

        const result = await startOralTest(startPayload);
        setApiMessage({ type: result.success ? 'success' : 'error', text: result.message || 'Ocorreu um erro.' });

        if (result.success) {
            // Refetch data to update UI
            await fetchTrackedProofs();
            await fetchOralTestResults();
        }

        setIsSubmitting(false);
    }, [startOralTest, fetchOralTestResults, fetchTrackedProofs]);

    if (currentUser?.role !== UserRole.ADMIN) {
        window.location.hash = '#dashboard';
        return null;
    }

    const FullScreenLoader = ({ text }: { text: string }) => (
        <div className="fixed inset-0 bg-dark-background bg-opacity-90 z-[80] flex flex-col justify-center items-center p-4">
            <div className="loader-container">
                <div className="loader triangle">
                    <svg viewBox="0 0 86 80"><polygon points="43 8 79 72 7 72"></polygon></svg>
                </div>
                <div className="loadingtext"><p>{text}</p></div>
            </div>
        </div>
    );
    
    if (isLoadingEligible && !initialDataLoaded) {
        return <FullScreenLoader text="Carregando" />;
    }

    return (
        <div className="container mx-auto">
            {isSubmitting && <FullScreenLoader text="Processando Provas Orais" />}
            <ApiMessageModal message={apiMessage} onClose={() => setApiMessage(null)} />
            <SellerDetailModal seller={modalSeller} onClose={() => setModalSeller(null)} />
            <ApplyTestModal seller={applyModalSeller} onClose={() => setApplyModalSeller(null)} onConfirm={handleApplyTestConfirm} />
            <ResultDetailModal result={viewingResult} onClose={() => setViewingResult(null)} />
            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} onApiMessage={setApiMessage} />
            <ProofTrackingModal isOpen={isTrackingModalOpen} onClose={() => setIsTrackingModalOpen(false)} proofs={trackedProofs} isLoading={isLoadingTrackedProofs} error={errorTrackedProofs} />


            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold">Painel - Prova Oral</h1>
                <div className="flex flex-wrap items-center justify-start sm:justify-end gap-x-4 gap-y-2">
                    <div className="flex items-center gap-2">
                         <label htmlFor="company-filter" className="text-sm font-medium shrink-0">Filtrar por Empresa:</label>
                        <select
                            id="company-filter"
                            value={selectedCompany}
                            onChange={(e) => setSelectedCompany(e.target.value)}
                            className="p-2 border border-dark-border rounded-lg bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Todas as Empresas</option>
                            {companies.map(companyName => (
                                <option key={companyName} value={companyName}>{companyName}</option>
                            ))}
                        </select>
                    </div>
                     <button 
                        onClick={() => setIsTrackingModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-dark-action rounded-lg hover:bg-dark-accent transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-background focus:ring-dark-accent"
                        aria-label="Acompanhar Provas"
                    >
                        <ListBulletIcon className="h-5 w-5" />
                        <span>Acompanhar Provas</span>
                    </button>
                     <button 
                        onClick={() => setIsSettingsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-dark-action rounded-lg hover:bg-dark-accent transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-background focus:ring-dark-accent"
                        aria-label="Configurações"
                    >
                        <SettingsIcon className="h-5 w-5" />
                        <span>Configurações</span>
                    </button>
                </div>
            </div>

            <div className="mb-8 flex flex-wrap border-b border-dark-border">
                <button onClick={() => setActiveTab('eligible')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'eligible' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400 hover:text-white'}`}>Vendedores Elegíveis</button>
                <button onClick={() => setActiveTab('results')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'results' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400 hover:text-white'}`}>Resultados das Provas</button>
            </div>

            {activeTab === 'eligible' && (
                isLoadingEligible ? (
                    <div className="text-center py-16 bg-dark-card rounded-xl shadow-md border border-dark-border">
                         <div className="loader triangle mx-auto"><svg viewBox="0 0 86 80"><polygon points="43 8 79 72 7 72"></polygon></svg></div>
                         <p className="text-gray-400 mt-4">Carregando vendedores elegíveis...</p>
                    </div>
                ) : eligibleSellers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {eligibleSellers.map(seller => (
                            <div 
                                key={seller.userId} 
                                className="bg-dark-card rounded-xl shadow-lg border border-dark-border flex flex-col text-left transition-all duration-300 hover:shadow-cyan-500/20 hover:-translate-y-1"
                            >
                                <div className="p-5 flex-grow">
                                    <button
                                        onClick={() => setModalSeller(seller)}
                                        className="w-full text-left focus:outline-none"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            {seller.photoUrl ? (
                                                <img src={seller.photoUrl} alt={seller.userName} className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400 flex-shrink-0" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full bg-dark-background flex items-center justify-center text-cyan-400 text-2xl font-bold flex-shrink-0 border-2 border-dark-border">
                                                    {seller.userName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <h2 className="text-xl font-bold text-dark-text truncate" title={seller.userName}>
                                                    {seller.userName}
                                                </h2>
                                                <p className="text-sm text-gray-400">{seller.companyName}</p>
                                            </div>
                                        </div>
                                    </button>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 border-b border-dark-border pb-2 mb-3">Categorias com Nota Superior a 71%</h3>
                                        <ul className="space-y-2 max-h-32 overflow-y-auto pr-2">
                                            {seller.highScores.map((score, index) => (
                                                <li key={index} className="flex items-center justify-between text-sm py-1">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <StarIcon />
                                                        <span className="font-medium text-gray-200 truncate pr-2">{score.categoryName}</span>
                                                    </div>
                                                    <span className="font-bold text-base text-yellow-400 flex-shrink-0">{score.percentage}%</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="mt-auto px-5 pb-5 pt-4">
                                    <button 
                                        onClick={() => setApplyModalSeller(seller)}
                                        className="w-full px-4 py-2.5 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-green-500"
                                    >
                                        Aplicar Prova Oral
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-dark-card rounded-xl shadow-md border border-dark-border">
                        <h2 className="text-2xl font-semibold text-dark-text">Nenhum Vendedor Elegível</h2>
                        <p className="text-gray-400 mt-2">No momento, não há vendedores com pontuação acima de 71% para a seleção atual, ou todos já realizaram/estão realizando a prova.</p>
                    </div>
                )
            )}

            {activeTab === 'results' && (
                 <ResultsPanel 
                    results={filteredResults} 
                    isLoading={isLoadingResults}
                    onViewResult={setViewingResult} 
                 />
            )}
        </div>
    );
};

export default OralTestPage;