import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../hooks/useApp';
import { UserRole, Submission, NeuroAnalysisResult, Question, AvailableOralTest, OralTestResult, User, LogEntry, Category } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ConfirmationModal from '../components/ConfirmationModal';

// Fix: Added missing helper functions and constants
const maturityLevels = [
    { level: 'Crítico', range: '0 - 30%', icon: '🔴', color: 'bg-red-900/50', chartColor: '#EF4444' },
    { level: 'Precário', range: '31 - 50%', icon: '🟠', color: 'bg-orange-900/50', chartColor: '#F97316' },
    { level: 'Mediano', range: '51 - 70%', icon: '🟡', color: 'bg-yellow-900/50', chartColor: '#EAB308' },
    { level: 'Avançado', range: '71 - 100%', icon: '🟢', color: 'bg-green-900/50', chartColor: '#22C55E' },
];

const getMaturityLevel = (score: number, maxScore: number) => {
    if (maxScore === 0) return maturityLevels[0];
    const percentage = (score / maxScore) * 100;
    if (percentage <= 30) return maturityLevels[0];
    if (percentage <= 50) return maturityLevels[1];
    if (percentage <= 70) return maturityLevels[2];
    return maturityLevels[3];
};

const parseDetailedAnswers = (data: any, allQuestionsForCategory: Question[]): { questionText: string; selectedAnswerText: string }[] => {
    if (!data) return [];

    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && 'questionText' in data[0]) {
        return data;
    }

    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object' && 'questionText' in parsed[0]) {
                return parsed;
            }
        } catch (e) {
            // Not JSON, proceed to custom parsing
        }

        const results: { questionText: string; selectedAnswerText: string }[] = [];
        const segments = data.split(/(?=\s*-\s*\d+\.\s*Pergunta:)/);

        if (segments.length > 1) {
            if (allQuestionsForCategory.length > 0) {
                const firstAnswerText = segments[0].replace(/^[a-zA-Z]\)\s*/, '').replace(/[✅♦]\s*/, '').trim();
                results.push({
                    questionText: allQuestionsForCategory[0].text,
                    selectedAnswerText: firstAnswerText,
                });
            }

            for (let i = 1; i < segments.length; i++) {
                const segment = segments[i];
                const questionMatch = segment.match(/Pergunta:\s*([\s\S]*?)\s*Resposta:/i);
                const answerMatch = segment.match(/Resposta:\s*([\s\S]*)/i);

                if (questionMatch && answerMatch) {
                    const question = questionMatch[1].trim();
                    const answer = answerMatch[1].replace(/^[a-zA-Z]\)\s*/, '').replace(/[✅♦]\s*/, '').trim();
                    results.push({ questionText: question, selectedAnswerText: answer });
                }
            }
            return results;
        }
        
        const questionParts = data.split(/Pergunta:/).filter(p => p.trim());
        if (questionParts.length > 0) {
            for (const part of questionParts) {
                const qaSplit = part.split('Resposta:');
                if (qaSplit.length === 2) {
                    const question = qaSplit[0].trim();
                    const answer = qaSplit[1].replace(/[✅♦]\s*/, '').trim();
                    results.push({ questionText: question, selectedAnswerText: answer });
                }
            }
            if (results.length > 0) return results;
        }
    }

    return [];
};


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

const CompanyDetailModal: React.FC<{
    company: User | null;
    employees: User[];
    onClose: () => void;
    onPhotoClick: (src: string) => void;
    onToggleIsActive: (userId: string, newIsActive: boolean) => void;
}> = ({ company, employees, onClose, onPhotoClick, onToggleIsActive }) => {
    if (!company) return null;
    
    const companyEmployees = employees.filter(e => e.companyName === company.companyName);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-dark-card rounded-xl shadow-2xl w-full max-w-3xl border border-dark-border" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-dark-border flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <img 
                            src={company.photoUrl || 'https://edrrnawrhfhoynpiwqsc.supabase.co/storage/v1/object/public/imagenscientes/Imagens%20Score%20Inteligente/icon%20user.png'} 
                            alt={`Logo ${company.companyName}`}
                            className="w-16 h-16 rounded-full object-contain bg-dark-background p-1 border-2 border-cyan-400 cursor-pointer"
                            onClick={() => company.photoUrl && onPhotoClick(company.photoUrl)}
                        />
                        <div>
                            <h2 className="text-2xl font-bold text-cyan-400">{company.companyName}</h2>
                            <p className="text-gray-400 mt-1">Contato: {company.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <h3 className="text-xl font-semibold mb-4 text-dark-text">Funcionários ({companyEmployees.length})</h3>
                    {companyEmployees.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {companyEmployees.map(employee => (
                                <div key={employee.id} className="bg-dark-background p-3 rounded-lg border border-dark-border flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img 
                                            src={employee.photoUrl || 'https://edrrnawrhfhoynpiwqsc.supabase.co/storage/v1/object/public/imagenscientes/Imagens%20Score%20Inteligente/icon%20user.png'} 
                                            alt={employee.name}
                                            className="w-12 h-12 rounded-full object-cover cursor-pointer border-2 border-gray-600"
                                            onClick={() => employee.photoUrl && onPhotoClick(employee.photoUrl)}
                                        />
                                        <div className="min-w-0">
                                            <p className="font-semibold truncate">{employee.name}</p>
                                            <p className="text-sm text-gray-400">{employee.position || 'Funcionário'}</p>
                                        </div>
                                    </div>
                                    <ToggleSwitch
                                        checked={employee.isActive ?? true}
                                        onChange={() => onToggleIsActive(employee.id, !(employee.isActive ?? true))}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">Nenhum funcionário cadastrado para esta empresa.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void; disabled?: boolean; }> = ({ checked, onChange, disabled = false }) => {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" disabled={disabled} />
            <div className={`w-11 h-6 bg-gray-600 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}></div>
        </label>
    );
};

const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0a5 5 0 01-5 5v2.93zM3 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17a1 1 0 102 0v-2.07A7.001 7.001 0 003 8z" clipRule="evenodd" /></svg>
);
const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
);
const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
);
const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
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
const ChartBarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);
const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 006-6v-1a6 6 0 00-9-5.197" />
    </svg>
);
const MagnifyingGlassIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);


const ResultDetailModal: React.FC<{
    result: AvailableOralTest | null;
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

    const scoreAnterior = parseInt(result['Score Anterior'] || '0', 10);
    const scoreAtual = parseInt(result['Score Atual'] || '0', 10);
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
                        {result.Foto && <img src={result.Foto} alt={result.Nome} className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400" />}
                        <div className="min-w-0">
                            <h2 className="text-2xl font-bold text-cyan-400 truncate" title={result.Categoria}>{result.Categoria}</h2>
                            <p className="text-lg font-semibold text-gray-300 mt-1">{result.Nome}</p>
                            <p className="text-gray-400 mt-1">{result.Empresa}</p>
                            <p className="text-sm text-gray-500 mt-1 break-all">{result['E-mail']} | {result.Telefone}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                </div>
                <div className="p-5 overflow-y-auto flex-grow space-y-5">
                    
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
                        <div className="flex items-center gap-2 bg-dark-background p-2.5 rounded-lg"><CalendarIcon className="h-5 w-5 text-cyan-400 flex-shrink-0" /> <span>{result['Data de envio']}</span></div>
                        <div className="flex items-center gap-2 bg-dark-background p-2.5 rounded-lg"><ClockIcon className="h-5 w-5 text-cyan-400 flex-shrink-0" /> <span>Início: {result['Horario Inicio'] || result['Horário de envio'] || 'N/A'}</span></div>
                        <div className="flex items-center gap-2 bg-dark-background p-2.5 rounded-lg"><ClockIcon className="h-5 w-5 text-cyan-400 flex-shrink-0" /> <span>Resposta: {result['Horario Resposta'] || 'N/A'}</span></div>
                        <div className="flex items-center gap-2 bg-dark-background p-2.5 rounded-lg"><ClockIcon className="h-5 w-5 text-cyan-400 flex-shrink-0" /> <span>Limite: {formatSeconds(result['Tempo Limite'])}</span></div>
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
                            <p className="whitespace-pre-wrap text-gray-300">{result.Pergunta || "Pergunta não disponível."}</p>
                        </div>
                    </div>
                    
                    {result['Resposta Funcionario'] && (
                        <div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                                <MicrophoneIcon className="h-5 w-5 text-cyan-400" />
                                <span>Áudio da Resposta</span>
                            </div>
                            <audio controls src={result['Resposta Funcionario']} className="w-full h-14">Seu navegador não suporta o elemento de áudio.</audio>
                        </div>
                    )}

                    {result.Transcricao && (
                        <div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                                <DocumentTextIcon className="h-5 w-5 text-cyan-400" />
                                <span>Transcrição</span>
                            </div>
                            <div className="text-sm bg-dark-background p-3 rounded-lg max-h-32 overflow-y-auto border border-dark-border">
                                <p className="whitespace-pre-wrap text-gray-300">{result.Transcricao}</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                            <BrainIcon className="h-5 w-5 text-cyan-400" />
                            <span>Resultado Detalhado</span>
                        </div>
                        <div className="bg-dark-background p-3 rounded-lg border border-dark-border">
                           <FormattedDetailedResult text={result['Resultado Detalhado'] || result['Perguntas & Respostas'] || "Resultado detalhado não disponível."}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const EmployeeOralTestModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
    const { currentUser } = useApp();
    const [tests, setTests] = useState<AvailableOralTest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submittingTestId, setSubmittingTestId] = useState<number | null>(null);
    const [apiMessage, setApiMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'toDo' | 'inProgress' | 'results'>('toDo');
    const [viewingResult, setViewingResult] = useState<AvailableOralTest | null>(null);

    const fetchTests = useCallback(async () => {
        if (!currentUser) return;

        setIsLoading(true);
        setError(null);
        setApiMessage(null);
        try {
            const [allTestsResponse, resultsResponse] = await Promise.all([
                fetch('https://webhook.triad3.io/webhook/visu-funcio-provaoral'),
                fetch('https://webhook.triad3.io/webhook/resultado-provaoral')
            ]);

            if (!allTestsResponse.ok) {
                throw new Error('Não foi possível carregar as provas disponíveis.');
            }
            if (!resultsResponse.ok) {
                throw new Error('Não foi possível carregar os resultados das provas.');
            }

            const allTestsText = await allTestsResponse.text();
            const allTestsData = allTestsText ? JSON.parse(allTestsText) : [];

            const resultsText = await resultsResponse.text();
            const resultsData = resultsText ? JSON.parse(resultsText) : [];

            if (!Array.isArray(allTestsData)) {
                 throw new Error('Formato de resposta inesperado da API de provas.');
            }
             if (!Array.isArray(resultsData)) {
                 throw new Error('Formato de resposta inesperado da API de resultados.');
            }

            const ongoingTests: AvailableOralTest[] = allTestsData
                .filter((item: any) => item.Status === 'Em andamento' || item.Status === 'Iniciada')
                .map((item: any) => ({
                    Id: item.Id,
                    Nome: item.Nome,
                    Telefone: item.Telefone,
                    'E-mail': item['E-mail'],
                    Empresa: item.Empresa,
                    Pergunta: item.Pergunta,
                    'Data de envio': item['Data de envio'],
                    'Horário de envio': item['Horário de envio'],
                    Categoria: item.Categoria,
                    'Tempo Limite': item['Tempo Limite'],
                    Status: item.Status,
                    'Perguntas & Respostas': item['Perguntas & Respostas'],
                }));
            
            const employeeResults: AvailableOralTest[] = resultsData
                .filter((item: any) => item.email === currentUser.email || item.telefone === currentUser.phone)
                .map((item: any) => ({
                    Id: item.Id || item.id,
                    Nome: item.Nome || item.nome,
                    Telefone: item.Telefone || item.telefone,
                    'E-mail': item['E-mail'] || item.email,
                    Empresa: item.Empresa || item.empresa,
                    Pergunta: item.Pergunta || item.pergunta,
                    'Data de envio': item['Data de envio'] || item.data,
                    'Horário de envio': item['Horário de envio'] || item.horario_inicio,
                    Categoria: item.categoria || item.Categoria || 'Prova Oral',
                    'Tempo Limite': item['Tempo Limite'] || item.tempo_limite,
                    Status: 'Respondida',
                    'Perguntas & Respostas': item['Perguntas & Respostas'] || item.resultado_detalhado,
                    'Score Anterior': item['Score Anterior'] || item.score_anterior,
                    'Score Atual': item['Score Atual'] || item.score_atual,
                    Foto: item.Foto || item.foto,
                    'Resposta Funcionario': item['Resposta Funcionario'] || item.resposta_funcionario,
                    Transcricao: item.Transcricao || item.transcricao,
                    'Resultado Detalhado': item['Resultado Detalhado'] || item.resultado_detalhado,
                    'Horario Inicio': item['Horario Inicio'] || item.horario_inicio,
                    'Horario Resposta': item['Horario Resposta'] || item.horario_resposta,
                }));
            
            const combinedTests = [...ongoingTests, ...employeeResults];
            setTests(combinedTests);

            const inProgressTest = combinedTests.find((t: AvailableOralTest) => t.Status === 'Iniciada');
            if (inProgressTest) {
                setActiveTab('inProgress');
            } else {
                setActiveTab('toDo');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (isOpen) {
            fetchTests();
        }
    }, [isOpen, fetchTests]);

    const testsToDo = useMemo(() => 
        tests.filter(t => t.Status === 'Em andamento').sort((a, b) => a.Id - b.Id), 
    [tests]);

    const testInProgress = useMemo(() => 
        tests.find(t => t.Status === 'Iniciada'), 
    [tests]);

    const testsDone = useMemo(() => 
        tests.filter(t => t.Status === 'Respondida').sort((a, b) => {
            const dateA = a['Data de envio'].split('/').reverse().join('-');
            const dateB = b['Data de envio'].split('/').reverse().join('-');
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        }), 
    [tests]);

    const handleStartTest = async (testData: AvailableOralTest) => {
        setSubmittingTestId(testData.Id);
        setError(null);
        setApiMessage(null);
        try {
            const response = await fetch('https://webhook.triad3.io/webhook/func-inic-provaoral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testData),
            });
            const result = await response.json();
            if (response.ok && result.resposta === "Prova oral iniciada com sucesso! Confira o seu WhatsApp.") {
                setApiMessage(result.resposta);
                await fetchTests();
            } else {
                throw new Error(result.resposta || 'Erro ao iniciar a prova oral. Tente novamente.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        } finally {
            setSubmittingTestId(null);
        }
    };
    
    const formatSeconds = (secondsStr: string): string => {
      const seconds = parseInt(secondsStr, 10);
      if (isNaN(seconds) || seconds < 0) return '00:00';
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    const TabButton: React.FC<{ name: string, tabId: 'toDo' | 'inProgress' | 'results' }> = ({ name, tabId }) => {
        const isActive = activeTab === tabId;
        return (
            <button 
                onClick={() => setActiveTab(tabId)}
                className={`px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}
            >
                {name}
            </button>
        );
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-full">
                    <div className="loader triangle"><svg viewBox="0 0 86 80"><polygon points="43 8 79 72 7 72"></polygon></svg></div>
                </div>
            );
        }

        switch (activeTab) {
            case 'toDo':
                return (
                    <div className="space-y-4">
                        {testInProgress && (
                            <div className="p-3 rounded-lg bg-yellow-500/20 text-yellow-300 text-sm text-center">
                                Você deve concluir a prova iniciada antes de começar uma nova.
                            </div>
                        )}
                        {testsToDo.length === 0 && !error ? (
                            <div className="text-center text-gray-400 py-8">Nenhuma prova para fazer no momento.</div>
                        ) : (
                            testsToDo.map((test, index) => {
                                const isFirstTest = index === 0;
                                const isButtonDisabled = !!testInProgress || submittingTestId !== null || !isFirstTest;

                                return (
                                    <div key={test.Id} className={`bg-dark-background p-4 rounded-lg border border-dark-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-opacity ${!isButtonDisabled ? '' : 'opacity-50'}`}>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-lg text-gray-200">{test.Categoria}</h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 mt-1">
                                                <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4" /> {test['Data de envio']}</span>
                                                <span className="flex items-center gap-1.5"><ClockIcon className="h-4 w-4" /> {formatSeconds(test['Tempo Limite'])}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleStartTest(test)}
                                            disabled={isButtonDisabled}
                                            title={!isFirstTest ? "Você deve concluir a prova anterior para iniciar esta." : ""}
                                            className="w-full sm:w-auto px-5 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                                        >
                                            {submittingTestId === test.Id ? 'Iniciando...' : 'Iniciar Prova Oral'}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                );
            case 'inProgress':
                 return testInProgress ? (
                    <div className="bg-dark-background p-6 rounded-lg border-2 border-cyan-500 text-center flex flex-col items-center justify-center h-full">
                        <MicrophoneIcon className="h-12 w-12 text-cyan-400 mb-4" />
                        <h3 className="font-semibold text-xl text-white mb-2">Sua Prova está Ativa!</h3>
                        <p className="text-lg font-bold text-gray-200 mb-4">{testInProgress.Categoria}</p>
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-400 mb-6">
                            <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4" /> {testInProgress['Data de envio']}</span>
                            <span className="flex items-center gap-1.5"><ClockIcon className="h-4 w-4" /> {formatSeconds(testInProgress['Tempo Limite'])}</span>
                        </div>
                        <p className="text-gray-300 max-w-md">
                            Verifique seu WhatsApp para receber a pergunta e enviar sua resposta em áudio. Boa sorte!
                        </p>
                    </div>
                 ) : (
                    <div className="text-center text-gray-400 py-8">Nenhuma prova iniciada no momento.</div>
                 );
            case 'results':
                return testsDone.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">Nenhum resultado de prova oral disponível no momento.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {testsDone.map(test => {
                             const scoreAnterior = parseInt(test['Score Anterior'] || '0', 10);
                             const scoreAtual = parseInt(test['Score Atual'] || '0', 10);
                             return (
                                 <div 
                                     key={test.Id} 
                                     className="bg-dark-background rounded-xl shadow-lg border border-dark-border flex flex-col text-left transition-all duration-300 hover:shadow-cyan-500/20 hover:-translate-y-1 cursor-pointer"
                                     onClick={() => setViewingResult(test)}
                                 >
                                     <div className="p-5 flex-grow">
                                         <div className="flex items-center gap-4 mb-4">
                                             {test.Foto && <img src={test.Foto} alt={test.Nome} className="w-16 h-16 rounded-full object-cover border-4 border-cyan-400 flex-shrink-0" />}
                                             <div className="min-w-0">
                                                 <h2 className="text-xl font-bold text-dark-text truncate" title={test.Nome}>{test.Nome}</h2>
                                                 <p className="text-sm text-gray-400">{test.Categoria}</p>
                                             </div>
                                         </div>
                                         <div className="flex items-center justify-between text-sm text-gray-400 mb-4 bg-dark-card p-2 rounded-lg">
                                             <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> <span>{test['Data de envio']}</span></div>
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
            default:
                return null;
        }
    };
    
    return (
        <>
            <ResultDetailModal result={viewingResult} onClose={() => setViewingResult(null)} />
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4" onClick={onClose}>
                <div 
                    className="bg-dark-card rounded-xl shadow-2xl w-full max-w-3xl h-full max-h-[90vh] flex flex-col border border-dark-border" 
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-5 flex-shrink-0 border-b border-dark-border flex justify-between items-center">
                        <h2 className="text-xl font-bold text-cyan-400">Prova Oral</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                    </div>
                    
                    <div className="flex-shrink-0 border-b border-dark-border flex">
                        <TabButton name="A Fazer" tabId="toDo" />
                        <TabButton name="Iniciada" tabId="inProgress" />
                        <TabButton name="Resultados" tabId="results" />
                    </div>
                    
                    <div className="p-5 flex-grow overflow-y-auto space-y-4">
                        {apiMessage && <div className="p-3 mb-4 rounded-lg bg-green-500/20 text-green-300 text-sm">{apiMessage}</div>}
                        {error && <div className="p-3 mb-4 rounded-lg bg-red-500/20 text-red-300 text-sm">{error}</div>}
                        {renderContent()}
                    </div>
                </div>
            </div>
        </>
    );
};

const CompanyOralTestResultsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onViewResult: (result: AvailableOralTest) => void;
}> = ({ isOpen, onClose, onViewResult }) => {
    const { currentUser, oralTestResults, fetchOralTestResults } = useApp();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            const loadResults = async () => {
                setIsLoading(true);
                await fetchOralTestResults();
                setIsLoading(false);
            };
            loadResults();
        }
    }, [isOpen, fetchOralTestResults]);

    const companyResults = useMemo(() => {
        if (!currentUser) return [];
        return oralTestResults.filter(r => r.empresa === currentUser.companyName)
            .sort((a, b) => {
                const dateA = a.data.split('/').reverse().join('-');
                const dateB = b.data.split('/').reverse().join('-');
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            });
    }, [oralTestResults, currentUser]);

    const mapOralTestResultToAvailableOralTest = useCallback((result: OralTestResult): AvailableOralTest => ({
        Id: result.id,
        Nome: result.nome,
        Telefone: result.telefone,
        'E-mail': result.email,
        Empresa: result.empresa,
        Pergunta: result.pergunta,
        'Data de envio': result.data,
        'Horário de envio': result.horario_inicio,
        Categoria: result.categoria || 'Prova Oral',
        'Tempo Limite': result.tempo_limite,
        Status: 'Respondida',
        'Perguntas & Respostas': result.resultado_detalhado,
        'Score Anterior': result.score_anterior,
        'Score Atual': result.score_atual,
        Foto: result.foto,
        'Resposta Funcionario': result.resposta_funcionario,
        Transcricao: result.transcricao,
        'Resultado Detalhado': result.resultado_detalhado,
        'Horario Inicio': result.horario_inicio,
        'Horario Resposta': result.horario_resposta,
    }), []);
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div 
                className="bg-dark-card rounded-xl shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col border border-dark-border" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-5 flex-shrink-0 border-b border-dark-border flex justify-between items-center">
                    <h2 className="text-xl font-bold text-cyan-400">Resultados da Prova Oral - {currentUser?.companyName}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                </div>
                
                <div className="p-5 flex-grow overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="loader triangle"><svg viewBox="0 0 86 80"><polygon points="43 8 79 72 7 72"></polygon></svg></div>
                        </div>
                    ) : companyResults.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">Nenhum resultado de prova oral encontrado para seus funcionários.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {companyResults.map(result => {
                                const scoreAnterior = parseInt(result.score_anterior || '0', 10);
                                const scoreAtual = parseInt(result.score_atual || '0', 10);
                                return (
                                    <div 
                                        key={result.id} 
                                        className="bg-dark-background rounded-xl shadow-lg border border-dark-border flex flex-col text-left transition-all duration-300 hover:shadow-cyan-500/20 hover:-translate-y-1 cursor-pointer"
                                        onClick={() => onViewResult(mapOralTestResultToAvailableOralTest(result))}
                                    >
                                       <div className="p-5 flex-grow">
                                            <div className="flex items-center gap-4 mb-4">
                                                {result.foto && <img src={result.foto} alt={result.nome} className="w-16 h-16 rounded-full object-cover border-4 border-cyan-400 flex-shrink-0" />}
                                                <div className="min-w-0">
                                                    <h2 className="text-xl font-bold text-dark-text truncate" title={result.nome}>{result.nome}</h2>
                                                    <p className="text-sm text-gray-400">{result.categoria || 'Prova Oral'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm text-gray-400 mb-4 bg-dark-card p-2 rounded-lg">
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
                    )}
                </div>
            </div>
        </div>
    );
};


const QuestionAnswerList: React.FC<{ answers: { questionText: string; selectedAnswerText: string }[] }> = ({ answers }) => {
    if (answers.length === 0) {
        return (
            <div className="mt-8 bg-dark-card p-6 rounded-xl shadow-lg border border-dark-border">
                <h3 className="text-xl font-semibold mb-4 text-cyan-400">Respostas Detalhadas</h3>
                <p className="text-gray-400">Nenhuma resposta detalhada disponível para esta avaliação.</p>
            </div>
        );
    }

    return (
        <div className="mt-8 bg-dark-card p-4 sm:p-6 rounded-xl shadow-lg border border-dark-border">
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">Respostas Detalhadas</h3>
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-3">
                {answers.map((item, index) => (
                    <div key={index} className="bg-dark-background p-4 rounded-lg border border-dark-border/50">
                        <p className="font-medium text-gray-200 mb-2">{item.questionText}</p>
                        <div className="flex items-center gap-2 pl-2">
                            <span className="text-xl text-gray-500 -mt-1">↳</span>
                            <span className="text-green-400 text-lg">✅</span>
                            <p className="text-cyan-300 flex-1">{item.selectedAnswerText}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface ScoreCardProps {
    title: string;
    subtitle: string;
    photoUrl?: string;
    submissions: Submission[];
    categories: Category[];
    questions: Question[];
    type: 'company' | 'employee';
    onPhotoClick: (src: string) => void;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ title, subtitle, photoUrl, submissions, categories, questions, type, onPhotoClick }) => {
    const totalScore = submissions.reduce((sum, s) => sum + s.totalScore, 0);
    const maxScore = submissions.reduce((sum, s) => sum + s.maxScore, 0);
    const overallPercentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    
    const categoryScores = categories
        .filter(cat => questions.some(q => q.categoryId === cat.id && q.targetRole === type))
        .map(cat => {
            const catSub = submissions.find(s => s.categoryId === cat.id);
            const score = catSub ? catSub.totalScore : 0;
            
            let maxCategoryScore = 0;
            if (catSub) {
                maxCategoryScore = catSub.maxScore;
            } else {
                maxCategoryScore = questions
                    .filter(q => q.categoryId === cat.id && q.targetRole === type)
                    .reduce((sum, q) => {
                        const questionMax = q.answers.length > 0 ? Math.max(...q.answers.map(a => a.score)) : 0;
                        return sum + questionMax;
                    }, 0);
            }

            if (maxCategoryScore === 0) return null;

            const catPercentage = Math.round((score / maxCategoryScore) * 100);
            const maturity = getMaturityLevel(score, maxCategoryScore);

            return {
                id: cat.id,
                name: cat.name,
                percentage: catPercentage,
                color: maturity.chartColor,
                answered: !!catSub
            };
        }).filter((item): item is NonNullable<typeof item> => item !== null);

    return (
        <div className="bg-dark-card rounded-xl shadow-lg border border-dark-border p-5 flex flex-col transition-all duration-300 hover:shadow-cyan-500/20 hover:-translate-y-1 h-full">
            <div className="flex items-center gap-4 mb-4">
                <img
                    src={photoUrl || 'https://edrrnawrhfhoynpiwqsc.supabase.co/storage/v1/object/public/imagenscientes/Imagens%20Score%20Inteligente/icon%20user.png'}
                    alt={title}
                    onClick={() => photoUrl && onPhotoClick(photoUrl)}
                    className={`w-16 h-16 rounded-full border-2 flex-shrink-0 cursor-pointer ${type === 'company' ? 'object-contain bg-dark-background p-1' : 'object-cover'}`}
                    style={{ borderColor: getMaturityLevel(totalScore, maxScore).chartColor }}
                />
                <div className="min-w-0">
                    <p className="font-bold text-lg text-white truncate" title={title}>{title}</p>
                    <p className="text-sm font-bold text-cyan-400">Score Geral: {overallPercentage}%</p>
                </div>
            </div>
            <div className="space-y-3 mt-auto">
                <h4 className="text-sm font-semibold text-gray-400 border-b border-dark-border pb-1">Desempenho por Categoria</h4>
                {categoryScores.map(cat => (
                   <div key={cat.id}>
                       <div className="flex justify-between text-sm mb-1">
                           <span className={`truncate pr-2 ${!cat.answered ? 'text-gray-500 italic' : 'text-gray-300'}`} title={cat.name}>{cat.name} {!cat.answered && '(não respondido)'}</span>
                           <span className="font-semibold" style={{ color: cat.answered ? cat.color : '#6b7280' }}>{cat.percentage}%</span>
                       </div>
                       <div className="w-full bg-dark-background rounded-full h-2.5">
                           <div className="h-2.5 rounded-full" style={{ width: `${cat.percentage}%`, backgroundColor: cat.answered ? cat.color : '#6b7280' }}></div>
                       </div>
                   </div>
                ))}
            </div>
        </div>
    );
};

const DashboardPage: React.FC = () => {
    const { 
        currentUser, submissions, users, fetchSubmissions, employeeSubmissions, fetchEmployeeScoresForAdmin, 
        neuroAnalysisResults, companyNeuroAnalysisResults, neuroCategories, categories, questions,
        fetchNeuroAnalysisResults, fetchCompanyNeuroAnalysisResults, fetchNeuroData, neuroSubmissions,
        fetchNeuroSubmissions, oralTestResults, fetchOralTestResults,
        allEmployees, fetchAllEmployees, selectedCompany, selectCompany,
        allRegisteredCompanies, fetchAllRegisteredCompanies,
        updateUserIsActive, toggleEmployeeActiveStatus
    } = useApp();
    
    const [activeTab, setActiveTab] = useState<'scores' | 'analysis' | 'companies' | 'funcionarios' | 'oralTest' | 'comparativos'>('scores');

    // Admin state
    const [selectedUserId, setSelectedUserId] = useState<string>('all-companies'); 
    
    // Scores view state
    const [viewType, setViewType] = useState<'corporate' | 'employee'>('corporate');
    const [photoModalSrc, setPhotoModalSrc] = useState<string | null>(null);
    const [companySearchTerm, setCompanySearchTerm] = useState('');
    const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
    const [responseStatusFilter, setResponseStatusFilter] = useState<'all' | 'answered' | 'notAnswered'>('all');
    const [stateFilter, setStateFilter] = useState<string>('all');


    // Analysis & Oral Test view state
    const [analysisViewType, setAnalysisViewType] = useState<'company' | 'employee'>('company');
    const [selectedEmployeeAnalysisId, setSelectedEmployeeAnalysisId] = useState<string>('all');
    const [viewingAnalysis, setViewingAnalysis] = useState<NeuroAnalysisResult | null>(null);
    const [viewingCompany, setViewingCompany] = useState<User | null>(null);

    // Group state
    const [employeeFilter, setEmployeeFilter] = useState<string>('all');
    const [isLoadingOralResults, setIsLoadingOralResults] = useState(false);

    const [isOralTestModalOpen, setIsOralTestModalOpen] = useState(false);
    const [isCompanyOralTestResultsModalOpen, setIsCompanyOralTestResultsModalOpen] = useState(false);
    const [viewingResult, setViewingResult] = useState<AvailableOralTest | null>(null);
    
    // Modal flow state
    const [modalState, setModalState] = useState<{
        type: 'idle' | 'confirmToggle' | 'loading' | 'result';
        data?: any;
    }>({ type: 'idle' });

    // START: Logic for 'Comparativos' tab, moved to top level
    const [comparisonType, setComparisonType] = useState<'companies' | 'employees'>('companies');
    const [selectedIdsForComparison, setSelectedIdsForComparison] = useState<Set<string>>(new Set());
    const [searchTermComparativos, setSearchTermComparativos] = useState('');

    const handleComparisonTypeChange = useCallback((type: 'companies' | 'employees') => {
        setComparisonType(type);
        setSelectedIdsForComparison(new Set());
        setSearchTermComparativos('');
    }, []);

    const handleSelectionChangeForComparison = useCallback((id: string) => {
        setSelectedIdsForComparison(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const companyOptionsForComparison = useMemo(() => allRegisteredCompanies
        .map(c => ({ id: c.id, name: c.companyName, photoUrl: c.photoUrl }))
        .filter((value, index, self) => self.findIndex(v => v.name === value.name) === index)
        .sort((a, b) => a.name.localeCompare(b.name)),
        [allRegisteredCompanies]);

    const itemsForSelectionComparativos = useMemo(() => {
        const lowerSearch = searchTermComparativos.toLowerCase();
        if (comparisonType === 'companies') {
            return companyOptionsForComparison.filter(opt => opt.name.toLowerCase().includes(lowerSearch));
        }
        return allEmployees
            .filter(e => e.name.toLowerCase().includes(lowerSearch) || e.companyName.toLowerCase().includes(lowerSearch))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [comparisonType, searchTermComparativos, companyOptionsForComparison, allEmployees]);

    const employeesByCompanyForComparison = useMemo(() => {
        if (comparisonType !== 'employees') return null;
        
        const employees = itemsForSelectionComparativos as User[];

        return employees.reduce((acc, employee) => {
            const companyName = employee.companyName || 'Sem Empresa';
            if (!acc[companyName]) {
                acc[companyName] = [];
            }
            acc[companyName].push(employee);
            return acc;
        }, {} as Record<string, User[]>);

    }, [comparisonType, itemsForSelectionComparativos]);

    const comparisonData = useMemo(() => {
        if (selectedIdsForComparison.size < 1) return null;
  
        const data: {
            overall: { name: string; score: number; photoUrl?: string }[];
            categories: Record<string, { name: string; score: number; photoUrl?: string }[]>;
            answersByCategory: Record<string, {
                question: string;
                answers: {
                    name: string;
                    answer: string;
                }[];
            }[]>;
        } = {
            overall: [],
            categories: {},
            answersByCategory: {},
        };
  
        const sourceSubmissions = comparisonType === 'companies' ? submissions : employeeSubmissions;
        const relevantCategories = categories.filter(c => sourceSubmissions.some(s => s.categoryId === c.id));
        
        relevantCategories.forEach(cat => { data.categories[cat.name] = []; });
  
        // Process Scores
        selectedIdsForComparison.forEach(id => {
            let name: string;
            let photoUrl: string | undefined;
            let userSubs: Submission[];
            
            if (comparisonType === 'companies') {
                const company = allRegisteredCompanies.find(c => c.id === id);
                if (!company) return;
                name = company.companyName;
                photoUrl = company.photoUrl;
                userSubs = sourceSubmissions.filter(s => s.companyName === name);
            } else {
                const employee = allEmployees.find(e => e.id === id);
                if (!employee) return;
                name = `${employee.name} (${employee.companyName})`;
                photoUrl = employee.photoUrl;
                userSubs = sourceSubmissions.filter(s => s.userName === employee.name && s.companyName === employee.companyName);
            }
  
            if (userSubs.length === 0) {
                 data.overall.push({ name, score: 0, photoUrl });
                 relevantCategories.forEach(cat => { data.categories[cat.name].push({ name, score: 0, photoUrl }); });
                return;
            };
  
            const totalScore = userSubs.reduce((sum, s) => sum + s.totalScore, 0);
            const maxScore = userSubs.reduce((sum, s) => sum + s.maxScore, 0);
            const overallPercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
            
            data.overall.push({ name, score: overallPercentage, photoUrl });
  
            relevantCategories.forEach(cat => {
                const catSub = userSubs.find(s => s.categoryId === cat.id);
                const catScore = (catSub && catSub.maxScore > 0) ? (catSub.totalScore / catSub.maxScore) * 100 : 0;
                data.categories[cat.name].push({ name, score: catScore, photoUrl });
            });
        });

        // Process Answers
        const answersByCategory: Record<string, { question: string; answers: { name: string; answer: string }[] }[]> = {};
        const allQuestions = relevantCategories.flatMap(cat => questions.filter(q => q.categoryId === cat.id && sourceSubmissions.some(s => s.categoryId === cat.id)));
        const uniqueQuestions = Array.from(new Map(allQuestions.map(q => [q.id, q])).values());

        uniqueQuestions.forEach(q => {
            const category = categories.find(c => c.id === q.categoryId);
            if (!category) return;
            
            if (!answersByCategory[category.name]) {
                answersByCategory[category.name] = [];
            }

            const questionEntry: { question: string; answers: { name: string; answer: string }[] } = {
                question: q.text,
                answers: []
            };

            selectedIdsForComparison.forEach(id => {
                let name: string;
                let userSubs: Submission[];
                
                if (comparisonType === 'companies') {
                    const company = allRegisteredCompanies.find(c => c.id === id);
                    if (!company) return;
                    name = company.companyName;
                    userSubs = sourceSubmissions.filter(s => s.companyName === name);
                } else {
                    const employee = allEmployees.find(e => e.id === id);
                    if (!employee) return;
                    name = `${employee.name} (${employee.companyName})`;
                    userSubs = sourceSubmissions.filter(s => s.userName === employee.name && s.companyName === employee.companyName);
                }

                const catSub = userSubs.find(s => s.categoryId === q.categoryId);
                let answerText = 'Não respondeu';

                if (catSub && catSub.detailedAnswers) {
                    const allQuestionsForCategory = questions.filter(ques => ques.categoryId === catSub.categoryId);
                    const parsedAnswers = parseDetailedAnswers(catSub.detailedAnswers, allQuestionsForCategory);
                    const foundAnswer = parsedAnswers.find(pa => pa.questionText === q.text);
                    if (foundAnswer) {
                        answerText = foundAnswer.selectedAnswerText;
                    }
                }
                questionEntry.answers.push({ name, answer: answerText });
            });

            answersByCategory[category.name].push(questionEntry);
        });
        
        data.answersByCategory = answersByCategory;
  
        data.overall.sort((a, b) => a.name.localeCompare(b.name));
        Object.values(data.categories).forEach(arr => arr.sort((a, b) => a.name.localeCompare(b.name)));
  
        return data;
    }, [selectedIdsForComparison, comparisonType, submissions, employeeSubmissions, categories, allRegisteredCompanies, allEmployees, questions]);

    const comparisonCardData = useMemo(() => {
        if (!comparisonData || comparisonData.overall.length === 0) return null;
    
        return comparisonData.overall.map(overallItem => {
            const { name: fullName, score: overallScore, photoUrl } = overallItem;
            
            let name = fullName;
            let subtitle = '';
    
            if (comparisonType === 'employees') {
                const match = fullName.match(/(.+) \((.+)\)/);
                if (match) {
                    name = match[1];
                    subtitle = match[2];
                }
            } else {
                name = fullName; // Company name
                const companyDetails = allRegisteredCompanies.find(c => c.companyName === name);
                subtitle = companyDetails?.name || 'Empresa'; // Use contact person's name as subtitle
            }
    
            const categoryScores = Object.entries(comparisonData.categories).map(([categoryName, data]) => {
                const itemData = data.find(d => d.name === fullName);
                return {
                    categoryName,
                    score: itemData ? itemData.score : 0,
                };
            });
    
            return {
                key: fullName,
                name,
                subtitle,
                photoUrl,
                overallScore,
                categoryScores,
            };
        });
    }, [comparisonData, comparisonType, allRegisteredCompanies]);
    // END: Logic for 'Comparativos' tab
    
    const availableStates = useMemo(() => {
        const allUsers = [...allRegisteredCompanies, ...allEmployees];
        const states = new Set(allUsers.map(u => u.state).filter(Boolean));
        return Array.from(states).sort();
    }, [allRegisteredCompanies, allEmployees]);


    const handleConfirmToggle = async () => {
        if (modalState.type !== 'confirmToggle' || !modalState.data) return;
        const { user, newIsActive } = modalState.data;
      
        setModalState({ type: 'loading' });
        const result = await toggleEmployeeActiveStatus(user, newIsActive);
        setModalState({ type: 'result', data: result });
    };

    const handleToggleIsActive = (userId: string, newIsActive: boolean) => {
        const user = allEmployees.find(e => e.id === userId) || allRegisteredCompanies.find(c => c.id === userId);
        if (!user) {
            console.error("User not found for toggling status", userId);
            return;
        }
        if (user.role === 'employee') {
            // Open confirmation modal for employees
            setModalState({ type: 'confirmToggle', data: { user, newIsActive } });
        } else {
            // Keep old behavior for companies
            updateUserIsActive(userId, newIsActive);
        }
    };
    
    const mapOralTestResultToAvailableOralTest = useCallback((result: OralTestResult): AvailableOralTest => ({
        Id: result.id,
        Nome: result.nome,
        Telefone: result.telefone,
        'E-mail': result.email,
        Empresa: result.empresa,
        Pergunta: result.pergunta,
        'Data de envio': result.data,
        'Horário de envio': result.horario_inicio,
        Categoria: result.categoria || 'Prova Oral',
        'Tempo Limite': result.tempo_limite,
        Status: 'Respondida',
        'Perguntas & Respostas': result.resultado_detalhado,
        'Score Anterior': result.score_anterior,
        'Score Atual': result.score_atual,
        Foto: result.foto,
        'Resposta Funcionario': result.resposta_funcionario,
        Transcricao: result.transcricao,
        'Resultado Detalhado': result.resultado_detalhado,
        'Horario Inicio': result.horario_inicio,
        'Horario Resposta': result.horario_resposta,
    }), []);

    useEffect(() => {
        const fetchData = async () => {
          if (!currentUser) return;
          if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.COMPANY || currentUser.role === UserRole.GROUP) {
              await fetchSubmissions();
              await fetchEmployeeScoresForAdmin();
          } else if (currentUser.role === UserRole.EMPLOYEE) {
              await fetchSubmissions();
          }
          if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.COMPANY || currentUser.role === UserRole.GROUP) {
            await fetchAllEmployees();
          }
        };
        fetchData();
    }, [currentUser, fetchSubmissions, fetchEmployeeScoresForAdmin, fetchAllEmployees, selectedCompany]);
    
    useEffect(() => {
        if (activeTab === 'analysis' && neuroCategories.length === 0 && currentUser) {
            const fetchNeuroDataOnDemand = async () => {
                await fetchNeuroData();
                await fetchNeuroSubmissions();
                await fetchNeuroAnalysisResults();
                await fetchCompanyNeuroAnalysisResults();
            };
            fetchNeuroDataOnDemand();
        }
    }, [activeTab, currentUser, neuroCategories.length, fetchNeuroData, fetchNeuroAnalysisResults, fetchCompanyNeuroAnalysisResults, fetchNeuroSubmissions]);

    useEffect(() => {
        if (
            activeTab === 'analysis' || 
            ((activeTab === 'companies' || activeTab === 'comparativos' || activeTab === 'scores') && currentUser?.role === UserRole.ADMIN)
        ) {
            fetchAllRegisteredCompanies();
        }
    }, [activeTab, currentUser, fetchAllRegisteredCompanies]);

     useEffect(() => {
        if (activeTab === 'oralTest' && (currentUser?.role === UserRole.GROUP || currentUser?.role === UserRole.ADMIN)) {
            const loadResults = async () => {
                setIsLoadingOralResults(true);
                await fetchOralTestResults();
                setIsLoadingOralResults(false);
            };
            loadResults();
        }
    }, [activeTab, fetchOralTestResults, currentUser, selectedCompany, selectedUserId]);
    
    useEffect(() => {
        setCompanySearchTerm('');
        setEmployeeSearchTerm('');
    }, [viewType, selectedUserId, selectedCompany]);
    
    useEffect(() => {
        if (selectedUserId !== 'all-companies') {
            setAnalysisViewType('company');
            setSelectedEmployeeAnalysisId('all');
        }
    }, [selectedUserId]);
    
    const { filteredCompanyAnalyses, filteredEmployeeAnalyses, analysisEmployeeList } = useMemo(() => {
        if (!currentUser) return { filteredCompanyAnalyses: [], filteredEmployeeAnalyses: [], analysisEmployeeList: [] };

        if (currentUser.role === UserRole.ADMIN) {
            if (selectedUserId === 'all-companies') {
                return {
                    filteredCompanyAnalyses: companyNeuroAnalysisResults,
                    filteredEmployeeAnalyses: neuroAnalysisResults,
                    analysisEmployeeList: []
                };
            }

            const targetCompanyName = allRegisteredCompanies.find(u => u.id === selectedUserId)?.companyName;
            if (!targetCompanyName) return { filteredCompanyAnalyses: [], filteredEmployeeAnalyses: [], analysisEmployeeList: [] };

            const companyAnalysesForCompany = companyNeuroAnalysisResults.filter(r => r.empresa === targetCompanyName);
            const employeeAnalysesForCompany = neuroAnalysisResults.filter(r => r.empresa === targetCompanyName);
            
            const uniqueEmployees = employeeAnalysesForCompany.reduce((acc, analysis) => {
                if (!acc.find(e => e.email === analysis.email)) {
                    acc.push({ name: analysis.nome, email: analysis.email });
                }
                return acc;
            }, [] as { name: string, email: string }[]);
            
            if (analysisViewType === 'company') {
                return { 
                    filteredCompanyAnalyses: companyAnalysesForCompany, 
                    filteredEmployeeAnalyses: [],
                    analysisEmployeeList: uniqueEmployees
                };
            } else { 
                if (selectedEmployeeAnalysisId === 'all') {
                    return { 
                        filteredCompanyAnalyses: [], 
                        filteredEmployeeAnalyses: employeeAnalysesForCompany,
                        analysisEmployeeList: uniqueEmployees 
                    };
                } else {
                     const specificEmployeeAnalyses = employeeAnalysesForCompany.filter(r => r.email === selectedEmployeeAnalysisId);
                     return {
                        filteredCompanyAnalyses: [],
                        filteredEmployeeAnalyses: specificEmployeeAnalyses,
                        analysisEmployeeList: uniqueEmployees
                     };
                }
            }
        } else if (currentUser.role === UserRole.COMPANY || (currentUser.role === UserRole.GROUP && selectedCompany)) {
            const targetCompany = currentUser.role === UserRole.GROUP ? selectedCompany : currentUser.companyName;
            const companyAnalyses = companyNeuroAnalysisResults.filter(r => r.empresa === targetCompany);
            let employeeAnalyses = neuroAnalysisResults.filter(r => r.empresa === targetCompany);

            if (currentUser.role === UserRole.GROUP) {
                 const analysesToDisplay = employeeFilter === 'all'
                    ? employeeAnalyses
                    : employeeAnalyses.filter(r => r.email === employeeFilter);

                return {
                    filteredCompanyAnalyses: companyAnalyses,
                    filteredEmployeeAnalyses: analysesToDisplay,
                    analysisEmployeeList: []
                };
            }

             return {
                filteredCompanyAnalyses: companyAnalyses,
                filteredEmployeeAnalyses: employeeAnalyses,
                analysisEmployeeList: []
             };
        } else { // EMPLOYEE
            const myAnalysis = neuroAnalysisResults.filter(r => r.email === currentUser.email);
            return {
                filteredCompanyAnalyses: [],
                filteredEmployeeAnalyses: myAnalysis,
                analysisEmployeeList: []
            };
        }
    }, [currentUser, allRegisteredCompanies, selectedUserId, companyNeuroAnalysisResults, neuroAnalysisResults, analysisViewType, selectedEmployeeAnalysisId, selectedCompany, employeeFilter]);
    
    const hasAnySubmissions = useMemo(() => {
        if (!currentUser) return false;
        if (currentUser.role === UserRole.ADMIN) return true;
        if (currentUser.role === UserRole.GROUP) return true; // Group users always see the dashboard
        return submissions.length > 0 || (neuroSubmissions && neuroSubmissions.length > 0);
    }, [currentUser, submissions, neuroSubmissions]);

    const EmployeeScoreCard: React.FC<{ submission: Submission }> = ({ submission }) => {
        const percentage = submission.maxScore > 0 ? Math.round((submission.totalScore / submission.maxScore) * 100) : 0;
        const maturity = getMaturityLevel(submission.totalScore, submission.maxScore);
        const data = [{ name: 'score', value: percentage }, { name: 'remaining', value: 100 - percentage }];

        return (
            <div className="bg-dark-card p-4 rounded-xl shadow-lg border border-dark-border text-center flex flex-col items-center justify-between">
                <h3 className="text-base font-semibold text-gray-200 h-12 flex items-center justify-center">{submission.categoryName} ({currentUser?.position || 'Funcionário'})</h3>
                <div className="relative w-36 h-36 my-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={60}
                                startAngle={90}
                                endAngle={450}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell key={`cell-score`} fill={maturity.chartColor} />
                                <Cell key={`cell-remaining`} fill="#374151" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">{percentage}%</span>
                        <span className="text-xs text-gray-400">{submission.totalScore} / {submission.maxScore} pts</span>
                    </div>
                </div>
                <div className={`px-4 py-1.5 rounded-lg text-sm font-semibold w-full text-white mt-2`} style={{ backgroundColor: maturity.chartColor }}>
                    <span className="mr-1">{maturity.icon}</span>
                    {maturity.level}
                </div>
            </div>
        );
    };

    const renderScoresContent = () => {
        if (currentUser?.role === UserRole.EMPLOYEE) {
            const employeeSubmissions = submissions.filter(s => s.userId === currentUser.id);

            if (employeeSubmissions.length === 0) {
                return (
                    <div className="text-center py-12 sm:py-16 bg-dark-card rounded-xl shadow-lg border border-dark-border">
                        <p className="text-lg text-gray-400">Nenhum score encontrado.</p>
                        <p className="text-sm text-gray-500 mt-2">Por favor, responda a um questionário para ver seus resultados.</p>
                    </div>
                );
            }

            return (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {employeeSubmissions.map(sub => (
                        <EmployeeScoreCard key={sub.id} submission={sub} />
                    ))}
                </div>
            );
        }

        let companiesToShow: User[] = [];
        let employeesToShow: User[] = [];

        if (viewType === 'corporate') {
            if (currentUser?.role === 'admin') {
                if (selectedUserId === 'all-companies') {
                    companiesToShow = allRegisteredCompanies;
                } else {
                    const selected = allRegisteredCompanies.find(c => c.id === selectedUserId);
                    if (selected) companiesToShow = [selected];
                }
            } else if (currentUser?.role === 'group') {
                if (selectedCompany) {
                    const selected = allRegisteredCompanies.find(c => c.companyName === selectedCompany);
                    if (selected) companiesToShow = [selected];
                } else {
                    const managedCompanyNamesSet = new Set(currentUser.managedCompanies || []);
                    companiesToShow = allRegisteredCompanies.filter(c => managedCompanyNamesSet.has(c.companyName));
                }
            } else { // company user
                const self = allRegisteredCompanies.find(c => c.companyName === currentUser?.companyName);
                if (self) companiesToShow = [self];
            }
        } else { // employee view
            if (currentUser?.role === 'admin') {
                if (selectedUserId === 'all-companies') {
                    employeesToShow = allEmployees;
                } else {
                    const targetCompanyName = allRegisteredCompanies.find(u => u.id === selectedUserId)?.companyName;
                    employeesToShow = allEmployees.filter(e => e.companyName === targetCompanyName);
                }
            } else if (currentUser?.role === 'group') {
                if (selectedCompany) {
                    employeesToShow = allEmployees.filter(e => e.companyName === selectedCompany);
                } else {
                    const managedCompanyNamesSet = new Set(currentUser.managedCompanies || []);
                    employeesToShow = allEmployees.filter(e => managedCompanyNamesSet.has(e.companyName));
                }
            } else if (currentUser?.role === 'company') {
                employeesToShow = allEmployees.filter(e => e.companyName === currentUser.companyName);
            } else { // employee user
                 employeesToShow = allEmployees.filter(e => e.id === currentUser.id);
            }
        }
        
        if (currentUser.role === 'admin') {
            // Apply state filter
            if (stateFilter !== 'all') {
                if (viewType === 'corporate') {
                    companiesToShow = companiesToShow.filter(c => c.state === stateFilter);
                } else {
                    employeesToShow = employeesToShow.filter(e => e.state === stateFilter);
                }
            }
        
            // Apply response status filter
            if (responseStatusFilter !== 'all') {
                const hasAnswered = responseStatusFilter === 'answered';
                if (viewType === 'corporate') {
                    const answeredCompanyNames = new Set(submissions.map(s => s.companyName));
                    companiesToShow = companiesToShow.filter(c => hasAnswered ? answeredCompanyNames.has(c.companyName) : !answeredCompanyNames.has(c.companyName));
                } else {
                    const answeredUserIds = new Set(employeeSubmissions.map(s => s.userId));
                    employeesToShow = employeesToShow.filter(e => hasAnswered ? answeredUserIds.has(e.id) : !answeredUserIds.has(e.id));
                }
            }
        }

        // Apply search term filter
        if (viewType === 'corporate') {
            companiesToShow = companiesToShow.filter(c => c.companyName.toLowerCase().includes(companySearchTerm.toLowerCase()));
        } else {
            employeesToShow = employeesToShow.filter(e => e.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) || e.companyName.toLowerCase().includes(employeeSearchTerm.toLowerCase()));
        }


        const dataAvailable = viewType === 'corporate' ? companiesToShow.length > 0 : employeesToShow.length > 0;

        if (!dataAvailable) {
            return (
                 <div className="text-center py-12 sm:py-16 bg-dark-card rounded-xl shadow-lg border border-dark-border">
                    <p className="text-lg text-gray-400">Nenhum dado encontrado para os filtros selecionados.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {viewType === 'corporate' ? (
                    companiesToShow.map(company => (
                        <ScoreCard
                            key={company.id}
                            title={company.companyName}
                            subtitle={company.name}
                            photoUrl={company.photoUrl}
                            submissions={submissions.filter(s => s.companyName === company.companyName)}
                            categories={categories}
                            questions={questions}
                            type="company"
                            onPhotoClick={setPhotoModalSrc}
                        />
                    ))
                ) : (
                    employeesToShow.map(employee => (
                         <ScoreCard
                            key={employee.id}
                            title={employee.name}
                            subtitle={employee.companyName}
                            photoUrl={employee.photoUrl}
                            submissions={employeeSubmissions.filter(s => s.userId === employee.id)}
                            categories={categories}
                            questions={questions}
                            type="employee"
                            onPhotoClick={setPhotoModalSrc}
                        />
                    ))
                )}
            </div>
        );
    }

    const renderAnalysisContent = () => {
        const hasAnyAnalysis = filteredCompanyAnalyses.length > 0 || filteredEmployeeAnalyses.length > 0;

        if (!hasAnyAnalysis) {
             return (
                 <div className="text-center py-12 sm:py-16 bg-dark-card rounded-xl shadow-lg border border-dark-border">
                    <p className="text-lg text-gray-400">Nenhuma análise do NeuroMapa encontrada para a seleção atual.</p>
                </div>
            );
        }

        if (currentUser.role === UserRole.ADMIN && selectedUserId === 'all-companies') {
            const groupedByCompany = new Map<string, { company: NeuroAnalysisResult[], employee: NeuroAnalysisResult[] }>();
            filteredCompanyAnalyses.forEach(r => {
                if (!groupedByCompany.has(r.empresa)) groupedByCompany.set(r.empresa, { company: [], employee: [] });
                groupedByCompany.get(r.empresa)!.company.push(r);
            });
            filteredEmployeeAnalyses.forEach(r => {
                if (!groupedByCompany.has(r.empresa)) groupedByCompany.set(r.empresa, { company: [], employee: [] });
                groupedByCompany.get(r.empresa)!.employee.push(r);
            });
            const sortedCompanies = Array.from(groupedByCompany.keys()).sort();

            return (
                <div className="space-y-12">
                    {sortedCompanies.map(companyName => {
                        const analyses = groupedByCompany.get(companyName)!;
                        return (
                            <div key={companyName}>
                                <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-cyan-500">{companyName}</h2>
                                <div className="space-y-8">
                                    {analyses.company.map(analysis => {
                                        const company = allRegisteredCompanies.find(c => c.companyName === analysis.empresa);
                                        const logoUrl = company?.photoUrl;
                                        return (
                                            <div key={analysis.id} className="bg-dark-card p-6 rounded-xl border border-dark-border flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                                                {logoUrl ? (
                                                    <img src={logoUrl} alt={analysis.empresa} className="w-24 h-24 rounded-full object-contain bg-dark-background p-1 border-2 border-cyan-400 flex-shrink-0" />
                                                ) : (
                                                    <div className="w-24 h-24 rounded-full bg-dark-background flex items-center justify-center text-cyan-400 text-4xl font-bold flex-shrink-0 border-2 border-dark-border">
                                                        {analysis.empresa.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex-grow">
                                                    <h3 className="text-xl font-bold text-white mb-2">Análise da Empresa</h3>
                                                    <p className="text-gray-300 mb-4">Veja o resultado consolidado do NeuroMapa.</p>
                                                </div>
                                                <button onClick={() => setViewingAnalysis(analysis)} className="px-6 py-2 font-bold text-gray-900 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg shadow-lg hover:from-cyan-300 hover:to-blue-300 transition-all transform hover:scale-105 shrink-0">
                                                    Ver Análise
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {analyses.employee.length > 0 && (
                                        <div>
                                            <h3 className="text-xl font-semibold mb-4 text-cyan-400/80">Análises da Equipe</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                                {analyses.employee.map(analysis => (
                                                    <div key={analysis.id} className="bg-dark-background p-4 rounded-lg border border-dark-border flex flex-col items-center text-center transition-all duration-300 hover:shadow-cyan-500/20 hover:-translate-y-1">
                                                        <img src={analysis.foto} alt={analysis.nome} className="w-20 h-20 rounded-full object-cover mb-3 border-4 border-gray-600" />
                                                        <p className="font-bold text-lg text-dark-text truncate w-full" title={analysis.nome}>{analysis.nome}</p>
                                                        <button onClick={() => setViewingAnalysis(analysis)} className="mt-4 w-full px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors">Ver Análise</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }

        return (
            <div className="space-y-8">
                {filteredCompanyAnalyses.map(analysis => {
                    const company = allRegisteredCompanies.find(c => c.companyName === analysis.empresa);
                    const logoUrl = company?.photoUrl;
                    return (
                        <div key={analysis.id} className="bg-dark-card p-6 rounded-xl border border-dark-border flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                            {logoUrl ? (
                                <img src={logoUrl} alt={analysis.empresa} className="w-24 h-24 rounded-full object-contain bg-dark-background p-1 border-2 border-cyan-400 flex-shrink-0" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-dark-background flex items-center justify-center text-cyan-400 text-4xl font-bold flex-shrink-0 border-2 border-dark-border">
                                    {analysis.empresa.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-grow">
                                <h3 className="text-xl font-bold text-white mb-2">Análise da Empresa: {analysis.empresa}</h3>
                                <p className="text-gray-300 mb-4">Veja o resultado consolidado do NeuroMapa para a empresa.</p>
                            </div>
                            <button onClick={() => setViewingAnalysis(analysis)} className="px-6 py-2 font-bold text-gray-900 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg shadow-lg hover:from-cyan-300 hover:to-blue-300 transition-all transform hover:scale-105 shrink-0">
                                Ver Análise
                            </button>
                        </div>
                    );
                })}
                {filteredEmployeeAnalyses.length > 0 && (
                     <div>
                        <h3 className="text-xl font-semibold mb-4 text-cyan-400/80">Análises da Equipe</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredEmployeeAnalyses.map(analysis => (
                                <div key={analysis.id} className="bg-dark-background p-4 rounded-lg border border-dark-border flex flex-col items-center text-center transition-all duration-300 hover:shadow-cyan-500/20 hover:-translate-y-1">
                                    <img src={analysis.foto} alt={analysis.nome} className="w-20 h-20 rounded-full object-cover mb-3 border-4 border-gray-600" />
                                    <p className="font-bold text-lg text-dark-text truncate w-full" title={analysis.nome}>{analysis.nome}</p>
                                    <button onClick={() => setViewingAnalysis(analysis)} className="mt-4 w-full px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors">Ver Análise</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const renderCompaniesContent = () => {
        const activeCompanies = allRegisteredCompanies;
        const employeeCounts = allEmployees.reduce((acc, employee) => {
            acc[employee.companyName] = (acc[employee.companyName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    
        return (
            <div className="space-y-8">
                <div className="bg-dark-card p-6 rounded-xl shadow-lg border border-dark-border text-center">
                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Total de Empresas Cadastradas</p>
                    <p className="text-5xl font-extrabold text-cyan-400 mt-2">{activeCompanies.length}</p>
                </div>
    
                <div className="bg-dark-card p-6 rounded-xl shadow-lg border border-dark-border">
                    <h3 className="text-xl font-semibold mb-4">Lista de Empresas</h3>
                    {activeCompanies.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeCompanies.map(company => (
                                 <div 
                                     key={company.id} 
                                     onClick={() => setViewingCompany(company)}
                                     className="bg-dark-background p-4 rounded-lg border border-dark-border flex flex-col gap-3 cursor-pointer transition-all duration-300 hover:border-cyan-400/50 hover:-translate-y-1"
                                 >
                                    <div className="flex items-start gap-4 flex-grow">
                                        <img 
                                            src={company.photoUrl || 'https://edrrnawrhfhoynpiwqsc.supabase.co/storage/v1/object/public/imagenscientes/Imagens%20Score%20Inteligente/icon%20user.png'} 
                                            alt={`Logo ${company.companyName}`}
                                            className="w-16 h-16 rounded-full object-contain bg-dark-card p-1 border-2 border-dark-border flex-shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <p className="font-bold text-lg text-dark-text">{company.companyName}</p>
                                            <p className="text-sm text-gray-400">
                                                {employeeCounts[company.companyName] || 0} funcionário(s)
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-auto pt-3 border-t border-dark-border/50 w-full">
                                        <span className={`h-2.5 w-2.5 rounded-full ${company.isActive ?? true ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        <span className={`text-xs font-medium ${company.isActive ?? true ? 'text-green-400' : 'text-red-400'}`}>
                                            {company.isActive ?? true ? 'Ativa' : 'Inativa'}
                                        </span>
                                    </div>
                                 </div>
                            ))}
                        </div>
                    ) : (
                         <p className="text-center text-gray-400 py-8">Nenhuma empresa cadastrada encontrada.</p>
                    )}
                </div>
            </div>
        );
    };

    const renderFuncionariosContent = () => {
        if (!currentUser || (currentUser.role !== UserRole.COMPANY && currentUser.role !== UserRole.GROUP)) return null;

        const targetCompanyName = currentUser.role === UserRole.GROUP ? selectedCompany : currentUser.companyName;
        if (!targetCompanyName) {
            return (
                <div className="text-center py-12 sm:py-16 bg-dark-card rounded-xl shadow-lg border border-dark-border">
                    <p className="text-lg text-gray-400">Selecione uma empresa no painel do grupo para ver os funcionários.</p>
                </div>
            );
        }
        
        const companyEmployees = allEmployees.filter(e => e.companyName === targetCompanyName);
    
        return (
            <div className="space-y-8">
                <div className="bg-dark-card p-6 rounded-xl shadow-lg border border-dark-border text-center">
                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Total de Funcionários</p>
                    <p className="text-5xl font-extrabold text-cyan-400 mt-2">{companyEmployees.length}</p>
                </div>
    
                <div className="bg-dark-card p-6 rounded-xl shadow-lg border border-dark-border">
                    <h3 className="text-xl font-semibold mb-4">Lista de Funcionários</h3>
                    {companyEmployees.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {companyEmployees.map(employee => (
                                <div key={employee.id} className="bg-dark-background p-4 rounded-lg border border-dark-border flex flex-col items-center text-center">
                                    <img 
                                        src={employee.photoUrl || 'https://edrrnawrhfhoynpiwqsc.supabase.co/storage/v1/object/public/imagenscientes/Imagens%20Score%20Inteligente/icon%20user.png'} 
                                        alt={employee.name} 
                                        className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-gray-600 cursor-pointer transition-transform hover:scale-105"
                                        onClick={() => employee.photoUrl && setPhotoModalSrc(employee.photoUrl)}
                                    />
                                    <p className="font-bold text-lg text-dark-text truncate w-full" title={employee.name}>{employee.name}</p>
                                    <p className="text-sm text-cyan-400 mb-2">{employee.position || 'Cargo não informado'}</p>
                                    <div className="text-xs text-gray-400 space-y-1 text-left w-full border-t border-dark-border pt-3 mt-2">
                                        <p className="truncate"><strong>Email:</strong> {employee.email}</p>
                                        <p><strong>Telefone:</strong> {employee.phone}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <p className="text-center text-gray-400 py-8">Nenhum funcionário cadastrado para sua empresa.</p>
                    )}
                </div>
            </div>
        );
    };

    const renderOralTestContent = () => {
        if (currentUser?.role === UserRole.EMPLOYEE) {
            return (
                <div className="bg-dark-card p-6 rounded-xl shadow-lg border border-dark-border text-center">
                    <h2 className="text-2xl font-semibold text-dark-text mb-4">Prova Oral</h2>
                    <p className="text-gray-400 mb-6">Verifique suas provas orais pendentes, em andamento ou veja seus resultados.</p>
                    <button
                        onClick={() => setIsOralTestModalOpen(true)}
                        className="px-6 py-3 font-bold text-gray-900 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg shadow-lg hover:from-cyan-300 hover:to-blue-300 transition-all transform hover:scale-105"
                    >
                        Acessar Provas Orais
                    </button>
                </div>
            );
        }
    
        if (currentUser?.role === UserRole.COMPANY) {
            return (
                <div className="bg-dark-card p-6 rounded-xl shadow-lg border border-dark-border text-center">
                    <h2 className="text-2xl font-semibold text-dark-text mb-4">Resultados da Prova Oral</h2>
                    <p className="text-gray-400 mb-6">Veja os resultados das provas orais dos funcionários da sua empresa.</p>
                    <button
                        onClick={() => setIsCompanyOralTestResultsModalOpen(true)}
                        className="px-6 py-3 font-bold text-gray-900 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg shadow-lg hover:from-cyan-300 hover:to-blue-300 transition-all transform hover:scale-105"
                    >
                        Ver Resultados
                    </button>
                </div>
            );
        }
        
        // For ADMIN and GROUP
        let resultsToShow: OralTestResult[] = [];
        if (currentUser?.role === UserRole.ADMIN) {
            if (selectedUserId === 'all-companies') {
                resultsToShow = oralTestResults;
            } else {
                const companyName = allRegisteredCompanies.find(u => u.id === selectedUserId)?.companyName;
                if (companyName) {
                    resultsToShow = oralTestResults.filter(r => r.empresa === companyName);
                }
            }
        } else if (currentUser?.role === UserRole.GROUP) {
            if (selectedCompany) {
                resultsToShow = oralTestResults.filter(r => r.empresa === selectedCompany);
            } else {
                const managedCompanies = currentUser.managedCompanies || [];
                resultsToShow = oralTestResults.filter(r => managedCompanies.includes(r.empresa));
            }
        }
        
        if (isLoadingOralResults) {
            return (
                <div className="text-center py-16 bg-dark-card rounded-xl shadow-md border border-dark-border">
                    <div className="loader triangle mx-auto"><svg viewBox="0 0 86 80"><polygon points="43 8 79 72 7 72"></polygon></svg></div>
                    <p className="text-gray-400 mt-4">Carregando resultados...</p>
                </div>
            );
        }
    
        if (resultsToShow.length === 0) {
            return (
                <div className="text-center py-16 bg-dark-card rounded-xl shadow-md border border-dark-border">
                    <h2 className="text-2xl font-semibold text-dark-text">Nenhum Resultado Disponível</h2>
                    <p className="text-gray-400 mt-2">No momento, não há resultados de provas orais para a seleção atual.</p>
                </div>
            );
        }
    
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resultsToShow.map(result => {
                    const scoreAnterior = parseInt(result.score_anterior || '0', 10);
                    const scoreAtual = parseInt(result.score_atual || '0', 10);
                    return (
                        <div 
                            key={result.id} 
                            className="bg-dark-background rounded-xl shadow-lg border border-dark-border flex flex-col text-left transition-all duration-300 hover:shadow-cyan-500/20 hover:-translate-y-1 cursor-pointer"
                            onClick={() => setViewingResult(mapOralTestResultToAvailableOralTest(result))}
                        >
                           <div className="p-5 flex-grow">
                                <div className="flex items-center gap-4 mb-4">
                                    {result.foto && <img src={result.foto} alt={result.nome} className="w-16 h-16 rounded-full object-cover border-4 border-cyan-400 flex-shrink-0" />}
                                    <div className="min-w-0">
                                        <h2 className="text-xl font-bold text-dark-text truncate" title={result.nome}>{result.nome}</h2>
                                        <p className="text-sm font-semibold text-cyan-400">{result.categoria || 'Prova Oral'}</p>
                                        <p className="text-xs text-gray-400 mt-1">{result.empresa}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-400 mb-4 bg-dark-card p-2 rounded-lg">
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

    const renderComparativosContent = () => {
        const renderSelectionCard = (item: any) => {
            const isEmployee = 'role' in item;
            const id = item.id;
            const name = isEmployee ? item.name : (item.name || item.companyName);
            const photoUrl = item.photoUrl;
            const subtitle = isEmployee ? item.companyName : null;
            const isSelected = selectedIdsForComparison.has(id);

            return (
                <label 
                    key={id}
                    className={`bg-dark-background p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer flex items-center gap-3 text-left hover:-translate-y-1 group ${isSelected ? 'border-cyan-400' : 'border-dark-border hover:border-gray-600'}`}
                >
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectionChangeForComparison(id)}
                        className="h-5 w-5 rounded border-gray-400 bg-dark-card text-cyan-600 focus:ring-cyan-500 shrink-0"
                    />
                    <img 
                        src={photoUrl || 'https://edrrnawrhfhoynpiwqsc.supabase.co/storage/v1/object/public/imagenscientes/Imagens%20Score%20Inteligente/icon%20user.png'}
                        alt={`Logo ${name}`}
                        className={`w-12 h-12 rounded-full border-2 shrink-0 transition-all duration-200 ${isEmployee ? 'object-cover' : 'object-contain bg-dark-card p-1'} ${isSelected ? 'border-cyan-400' : 'border-gray-700 group-hover:border-gray-500'}`}
                    />
                    <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-200 truncate">{name}</p>
                        {subtitle && <p className="text-xs text-gray-400 truncate">{subtitle}</p>}
                    </div>
                </label>
            );
        };

        return (
          <div className="bg-dark-card p-4 sm:p-6 rounded-xl shadow-lg border border-dark-border">
              <h2 className="text-2xl font-semibold text-dark-text mb-6">Ferramenta de Comparação</h2>
              
              <div className="sticky top-[65px] z-20 bg-dark-card py-4 -mx-4 -mt-4 px-4 mb-4 border-b border-dark-border">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Comparação:</label>
                          <div className="flex items-center bg-dark-background p-1 rounded-full border border-dark-border">
                               <button onClick={() => handleComparisonTypeChange('companies')} className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-all flex items-center justify-center gap-2 ${comparisonType === 'companies' ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>Empresas</button>
                               <button onClick={() => handleComparisonTypeChange('employees')} className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-all flex items-center justify-center gap-2 ${comparisonType === 'employees' ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>Funcionários</button>
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Buscar por Nome:</label>
                          <div className="relative">
                              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                  type="text"
                                  placeholder={comparisonType === 'companies' ? "Buscar empresa..." : "Buscar funcionário ou empresa..."}
                                  value={searchTermComparativos}
                                  onChange={e => setSearchTermComparativos(e.target.value)}
                                  className="w-full p-2.5 pl-10 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                          </div>
                      </div>
                  </div>
              </div>
  
              <div className="mb-8 max-h-80 overflow-y-auto pr-2">
                  {comparisonType === 'companies' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {itemsForSelectionComparativos.length > 0 ? itemsForSelectionComparativos.map(item => renderSelectionCard(item)) : (
                              <div className="col-span-full text-center py-10 text-gray-500">
                                  <p>Nenhuma empresa encontrada para "{searchTermComparativos}".</p>
                              </div>
                          )}
                      </div>
                  ) : employeesByCompanyForComparison ? (
                      <div className="space-y-4">
                          {Object.keys(employeesByCompanyForComparison).length > 0 ? Object.entries(employeesByCompanyForComparison).map(([companyName, employees]) => (
                              <div key={companyName}>
                                  <h4 className="font-semibold text-cyan-400 mb-2 sticky top-0 bg-dark-card py-2 px-2 -mx-2">{companyName}</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                      {employees.map(employee => renderSelectionCard(employee))}
                                  </div>
                              </div>
                          )) : (
                              <div className="text-center py-10 text-gray-500">
                                  <p>Nenhum funcionário encontrado para "{searchTermComparativos}".</p>
                              </div>
                          )}
                      </div>
                  ) : null}
              </div>
  
              {comparisonCardData && comparisonCardData.length > 0 ? (
                  <>
                      <div className="mt-8 pt-6 border-t border-dark-border">
                          <h3 className="text-2xl font-semibold text-dark-text mb-6 text-center">Resultados Comparativos</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                              {comparisonCardData.map(card => {
                                  const overallMaturity = getMaturityLevel(card.overallScore, 100);
                                  return (
                                      <div key={card.key} className="bg-dark-background p-4 rounded-xl shadow-lg border border-dark-border flex flex-col gap-4 h-full">
                                          <div className="flex items-center gap-4">
                                              <img
                                                  src={card.photoUrl || 'https://edrrnawrhfhoynpiwqsc.supabase.co/storage/v1/object/public/imagenscientes/Imagens%20Score%20Inteligente/icon%20user.png'}
                                                  alt={card.name}
                                                  className={`w-16 h-16 rounded-full border-4 ${comparisonType === 'employees' ? 'object-cover' : 'object-contain bg-dark-card p-1'}`}
                                                  style={{ borderColor: overallMaturity.chartColor }}
                                              />
                                              <div className="min-w-0">
                                                  <p className="font-bold text-lg text-white truncate" title={card.name}>{card.name}</p>
                                                  <p className="text-sm text-gray-400">{card.subtitle}</p>
                                                  <p className="text-lg font-bold" style={{ color: overallMaturity.chartColor }}>
                                                      Score Geral: {card.overallScore.toFixed(0)}%
                                                  </p>
                                              </div>
                                          </div>
                                          
                                          <div className="space-y-3 mt-auto pt-2 border-t border-dark-border/50">
                                              <h4 className="text-sm font-semibold text-gray-400">Desempenho por Categoria</h4>
                                              {card.categoryScores.map(({ categoryName, score }) => {
                                                  const categoryMaturity = getMaturityLevel(score, 100);
                                                  return (
                                                      <div key={categoryName}>
                                                          <div className="flex justify-between text-sm mb-1">
                                                              <span className="text-gray-300 truncate pr-2" title={categoryName}>{categoryName}</span>
                                                              <span className="font-semibold" style={{ color: categoryMaturity.chartColor }}>
                                                                  {score.toFixed(0)}%
                                                              </span>
                                                          </div>
                                                          <div className="w-full bg-dark-card rounded-full h-2.5">
                                                              <div 
                                                                  className="h-2.5 rounded-full"
                                                                  style={{ width: `${score}%`, backgroundColor: categoryMaturity.chartColor, transition: 'width 0.5s ease-in-out' }}
                                                              ></div>
                                                          </div>
                                                      </div>
                                                  );
                                              })}
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
  
                      <div className="mt-12 pt-8 border-t border-dark-border">
                        <h3 className="text-2xl font-semibold text-dark-text mb-6 text-center">
                          Comparativo de Respostas
                        </h3>
                        <div className="space-y-8">
                          {Object.entries(comparisonData.answersByCategory).map(([categoryName, questionsAndAnswers]) => (
                            <div key={categoryName} className="bg-dark-background p-6 rounded-xl border border-dark-border">
                              <h4 className="text-xl font-bold text-cyan-400 mb-4">{categoryName}</h4>
                              <div className="space-y-6">
                                {questionsAndAnswers.map((qa, index) => (
                                  <div key={index} className="border-t border-dark-border/50 pt-4 first:border-t-0 first:pt-0">
                                    <p className="font-semibold text-gray-300 mb-3">({index + 1}) {qa.question}</p>
                                    <ul className="space-y-2 pl-4">
                                      {qa.answers.map((ans, ansIndex) => (
                                        <li key={ansIndex} className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-4 gap-y-1 text-sm">
                                          <span className="font-medium text-gray-400 truncate" title={ans.name}>{ans.name}:</span>
                                          <span className="text-gray-200">{ans.answer}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                  </>
              ) : (
                  <div className="text-center py-12 px-6 h-full flex flex-col justify-center items-center bg-dark-background rounded-lg border-2 border-dashed border-dark-border mt-6">
                       <ChartBarIcon className="h-16 w-16 text-gray-500 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-300">Selecione para Comparar</h3>
                      <p className="text-gray-400 mt-2">Escolha uma ou mais {comparisonType === 'companies' ? 'empresas' : 'funcionários'} para visualizar os gráficos.</p>
                  </div>
              )}
          </div>
        );};

    const tabs = useMemo(() => [
        { id: 'scores', label: 'Scores', roles: [UserRole.ADMIN, UserRole.COMPANY, UserRole.EMPLOYEE, UserRole.GROUP] },
        { id: 'analysis', label: 'Análise NeuroMapa', roles: [UserRole.ADMIN, UserRole.COMPANY, UserRole.EMPLOYEE, UserRole.GROUP] },
        { id: 'oralTest', label: 'Prova Oral', roles: [UserRole.ADMIN, UserRole.COMPANY, UserRole.EMPLOYEE, UserRole.GROUP] },
        { id: 'funcionarios', label: 'Funcionários', roles: [UserRole.COMPANY, UserRole.GROUP] },
        { id: 'companies', label: 'Empresas', roles: [UserRole.ADMIN] },
        { id: 'comparativos', label: 'Comparativos', roles: [UserRole.ADMIN] }
    ], []);

    return (
        <div className="container mx-auto">
            {/* Modals */}
            {photoModalSrc && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-80 z-[100] flex justify-center items-center p-4 cursor-pointer"
                    onClick={() => setPhotoModalSrc(null)}
                >
                    <img src={photoModalSrc} alt="Visualização ampliada" className="max-w-full max-h-full object-contain rounded-lg"/>
                    <button onClick={() => setPhotoModalSrc(null)} className="absolute top-4 right-4 text-white text-3xl font-bold" aria-label="Fechar imagem">&times;</button>
                </div>
            )}
            <AnalysisResultModal analysis={viewingAnalysis} onClose={() => setViewingAnalysis(null)} />
            <CompanyDetailModal 
                company={viewingCompany} 
                employees={allEmployees}
                onClose={() => setViewingCompany(null)} 
                onPhotoClick={setPhotoModalSrc}
                onToggleIsActive={handleToggleIsActive}
            />
            <EmployeeOralTestModal isOpen={isOralTestModalOpen} onClose={() => setIsOralTestModalOpen(false)} />
            <CompanyOralTestResultsModal 
                isOpen={isCompanyOralTestResultsModalOpen} 
                onClose={() => setIsCompanyOralTestResultsModalOpen(false)} 
                onViewResult={setViewingResult}
            />
             <ResultDetailModal result={viewingResult} onClose={() => setViewingResult(null)} />

            {modalState.type === 'confirmToggle' && modalState.data && (
                <ConfirmationModal
                    isOpen={true}
                    onClose={() => setModalState({ type: 'idle' })}
                    onConfirm={handleConfirmToggle}
                    title="Confirmar Alteração de Status"
                    confirmButtonText={modalState.data.newIsActive ? "Ativar" : "Inativar"}
                    confirmButtonClass={modalState.data.newIsActive ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                >
                    <p>Tem certeza que deseja {modalState.data.newIsActive ? 'ativar' : 'inativar'} o funcionário <strong className="text-cyan-400">{modalState.data.user.name}</strong>?</p>
                </ConfirmationModal>
            )}
            
            {modalState.type === 'loading' && (
                 <div className="fixed inset-0 bg-dark-background bg-opacity-90 z-50 flex flex-col justify-center items-center p-4">
                    <div className="loader triangle"><svg viewBox="0 0 86 80"><polygon points="43 8 79 72 7 72"></polygon></svg></div>
                 </div>
            )}
            
            {modalState.type === 'result' && modalState.data && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
                    <div className="bg-dark-card rounded-xl p-6 text-center">
                        <p className={modalState.data.success ? 'text-green-400' : 'text-red-400'}>{modalState.data.message}</p>
                        <button onClick={() => setModalState({ type: 'idle' })} className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg">OK</button>
                    </div>
                </div>
            )}


            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold">
                    Painel 
                    {currentUser?.role === 'admin' && ' (Admin)'}
                    {currentUser?.role === 'group' && selectedCompany && ` - ${selectedCompany}`}
                </h1>
            </div>

            {/* Tabs */}
            <div className="mb-8 flex flex-wrap border-b border-dark-border">
                {tabs.filter(tab => currentUser && tab.roles.includes(currentUser.role)).map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

             {/* FILTER BAR */}
            {activeTab === 'scores' && (currentUser?.role === 'admin' || currentUser?.role === 'company' || (currentUser?.role === 'group' && selectedCompany)) && (
                <div className="bg-dark-card p-4 rounded-xl mb-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-dark-background p-1 rounded-full border border-dark-border">
                            <button onClick={() => setViewType('corporate')} className={`px-4 py-1 text-sm font-semibold rounded-full transition-all ${viewType === 'corporate' ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400'}`}>Corporativo</button>
                            <button onClick={() => setViewType('employee')} className={`px-4 py-1 text-sm font-semibold rounded-full transition-all ${viewType === 'employee' ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400'}`}>Funcionários</button>
                        </div>
                    </div>
                    
                    {currentUser.role === 'admin' && (
                        <>
                            <div className="flex items-center gap-2">
                                <label htmlFor="user-select" className="text-sm font-medium shrink-0">Empresa:</label>
                                <select id="user-select" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="p-2 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="all-companies">Todas as Empresas</option>
                                    {allRegisteredCompanies.map(u => <option key={u.id} value={u.id}>{u.companyName}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="status-filter" className="text-sm font-medium shrink-0">Status:</label>
                                <select id="status-filter" value={responseStatusFilter} onChange={e => setResponseStatusFilter(e.target.value as any)} className="p-2 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="all">Todos</option>
                                    <option value="answered">Responderam</option>
                                    <option value="notAnswered">Não Responderam</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="state-filter" className="text-sm font-medium shrink-0">Estado:</label>
                                <select id="state-filter" value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="p-2 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="all">Todos os Estados</option>
                                    {availableStates.map(state => <option key={state} value={state}>{state}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    <div className="relative flex-grow">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={viewType === 'corporate' ? 'Buscar por empresa...' : 'Buscar por funcionário...'}
                            value={viewType === 'corporate' ? companySearchTerm : employeeSearchTerm}
                            onChange={(e) => viewType === 'corporate' ? setCompanySearchTerm(e.target.value) : setEmployeeSearchTerm(e.target.value)}
                            className="w-full sm:w-80 p-3 pl-12 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        />
                    </div>
                </div>
            )}

            {/* Tab Content */}
            {activeTab === 'scores' && renderScoresContent()}
            {activeTab === 'analysis' && renderAnalysisContent()}
            {activeTab === 'companies' && renderCompaniesContent()}
            {activeTab === 'funcionarios' && renderFuncionariosContent()}
            {activeTab === 'oralTest' && renderOralTestContent()}
            {activeTab === 'comparativos' && renderComparativosContent()}
        </div>
    );
};

export default DashboardPage;
