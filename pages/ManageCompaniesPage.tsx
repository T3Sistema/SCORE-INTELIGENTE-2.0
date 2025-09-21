import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useApp } from '../hooks/useApp';
import { User, Submission, Question, Category } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Icons
const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);
const ChartBarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
const MagnifyingGlassIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);


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

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void; }> = ({ checked, onChange }) => {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
    );
};

const CompanyDetailModal: React.FC<{
    company: User | null;
    onClose: () => void;
    onToggleActive: (company: User, newIsActive: boolean) => void;
    onApiMessage: (msg: { type: 'success' | 'error', text: string }) => void;
}> = ({ company, onClose, onToggleActive, onApiMessage }) => {
    if (!company) return null;

    const copyCodeToClipboard = () => {
        if (company.companyCode) {
            navigator.clipboard.writeText(company.companyCode).then(() => {
                onApiMessage({ type: 'success', text: 'Código copiado com sucesso!' });
            }).catch(() => {
                onApiMessage({ type: 'error', text: 'Falha ao copiar o código.' });
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-dark-card rounded-xl shadow-2xl w-full max-w-lg border border-dark-border" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-dark-border flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <img 
                            src={company.photoUrl || 'https://edrrnawrhfhoynpiwqsc.supabase.co/storage/v1/object/public/imagenscientes/Imagens%20Score%20Inteligente/icon%20user.png'} 
                            alt={`Logo ${company.companyName}`}
                            className="w-16 h-16 rounded-full object-contain bg-dark-background p-1 border-2 border-cyan-400"
                        />
                        <div>
                            <h2 className="text-2xl font-bold text-cyan-400">{company.companyName}</h2>
                            <p className="text-gray-400 mt-1">Contato: {company.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-sm font-medium text-gray-300 mb-1">Código da Empresa</p>
                        <div className="flex items-center gap-2">
                            <p className="font-mono bg-dark-background px-3 py-1.5 rounded-md border border-dark-border">{company.companyCode || 'N/A'}</p>
                            {company.companyCode && (
                                <button 
                                    onClick={copyCodeToClipboard} 
                                    className="p-2 bg-dark-action rounded-md hover:bg-dark-accent transition-colors" 
                                    title="Copiar código"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-dark-border">
                        <p className="font-medium text-gray-300">Status da Empresa</p>
                        <div className="flex items-center gap-3">
                            <span className={`text-sm font-semibold ${company.isActive ?? true ? 'text-green-400' : 'text-red-400'}`}>
                                {company.isActive ?? true ? 'Ativa' : 'Inativa'}
                            </span>
                            <ToggleSwitch 
                                checked={company.isActive ?? true}
                                onChange={() => onToggleActive(company, !(company.isActive ?? true))}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ManageCompaniesPage: React.FC = () => {
    const { 
        allRegisteredCompanies, 
        fetchAllRegisteredCompanies,
        deleteCompany,
        submissions,
        categories,
        questions,
        fetchSubmissions,
        updateUserIsActive,
    } = useApp();

    const [view, setView] = useState<'list' | 'comparison'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [companyToDelete, setCompanyToDelete] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiMessage, setApiMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [viewingCompany, setViewingCompany] = useState<User | null>(null);

    // Comparison state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [comparisonSearchTerm, setComparisonSearchTerm] = useState('');
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const comparisonReportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchAllRegisteredCompanies();
        fetchSubmissions();
    }, [fetchAllRegisteredCompanies, fetchSubmissions]);

    const filteredCompanies = useMemo(() => {
        return allRegisteredCompanies.filter(company => 
            company.companyName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allRegisteredCompanies, searchTerm]);

    const handleConfirmDelete = async () => {
        if (!companyToDelete) return;
        
        setIsSubmitting(true);
        const result = await deleteCompany(companyToDelete);
        setApiMessage({ type: result.success ? 'success' : 'error', text: result.message });
        setIsSubmitting(false);
        setCompanyToDelete(null);
    };
    
    const handleToggleActive = async (company: User, newIsActive: boolean) => {
        setIsSubmitting(true);
        const result = await updateUserIsActive(company.id, newIsActive);
        setApiMessage({ type: result.success ? 'success' : 'error', text: result.message });
        if (result.success) {
            // Optimistically update the local state to reflect the change immediately
            setViewingCompany(prev => prev ? { ...prev, isActive: newIsActive } : null);
        }
        setIsSubmitting(false);
    };

    const handleSelectionChange = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };
    
    const comparisonItems = useMemo(() => {
        const lowerSearch = comparisonSearchTerm.toLowerCase();
        return allRegisteredCompanies.filter(c => c.companyName.toLowerCase().includes(lowerSearch));
    }, [comparisonSearchTerm, allRegisteredCompanies]);

    const comparisonData = useMemo(() => {
        if (selectedIds.size < 1) return null;

        const data: {
            overall: { name: string; score: number; photoUrl?: string }[];
            categories: Record<string, { name: string; score: number }[]>;
        } = {
            overall: [],
            categories: {},
        };

        const relevantCategories = categories.filter(c => submissions.some(s => s.categoryId === c.id));
        relevantCategories.forEach(cat => { data.categories[cat.name] = []; });
        
        selectedIds.forEach(id => {
            const company = allRegisteredCompanies.find(c => c.id === id);
            if (!company) return;

            const name = company.companyName;
            const photoUrl = company.photoUrl;
            const userSubs = submissions.filter(s => s.companyName === name);

            const totalScore = userSubs.reduce((sum, s) => sum + s.totalScore, 0);
            const maxScore = userSubs.reduce((sum, s) => sum + s.maxScore, 0);
            const overallPercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
            
            data.overall.push({ name, score: overallPercentage, photoUrl });

            relevantCategories.forEach(cat => {
                const catSub = userSubs.find(s => s.categoryId === cat.id);
                const catScore = (catSub && catSub.maxScore > 0) ? (catSub.totalScore / catSub.maxScore) * 100 : 0;
                data.categories[cat.name].push({ name, score: catScore });
            });
        });
        
        data.overall.sort((a, b) => a.name.localeCompare(b.name));
        Object.values(data.categories).forEach(arr => arr.sort((a, b) => a.name.localeCompare(b.name)));

        return data;
    }, [selectedIds, submissions, categories, allRegisteredCompanies]);

    const comparisonCardData = useMemo(() => {
        if (!comparisonData || comparisonData.overall.length === 0) return null;
    
        return comparisonData.overall.map(overallItem => {
            const { name: companyName, score: overallScore, photoUrl } = overallItem;
            
            const companyDetails = allRegisteredCompanies.find(c => c.companyName === companyName);
            const subtitle = companyDetails?.name || 'Empresa';
    
            const categoryScores = Object.entries(comparisonData.categories).map(([categoryName, data]) => {
                const itemData = data.find(d => d.name === companyName);
                return {
                    categoryName,
                    score: itemData ? itemData.score : 0,
                };
            });
    
            return {
                key: companyName,
                name: companyName,
                subtitle,
                photoUrl,
                overallScore,
                categoryScores,
            };
        });
    }, [comparisonData, allRegisteredCompanies]);

    const handleDownloadPDF = async () => {
        if (!comparisonReportRef.current || selectedIds.size === 0) {
            alert("Selecione empresas e gere o comparativo antes de fazer o download.");
            return;
        }
        
        setIsDownloadingPdf(true);
        
        try {
            const canvas = await html2canvas(comparisonReportRef.current, {
                scale: 2,
                backgroundColor: '#111827',
                useCORS: true, 
            });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / imgHeight;
            let finalImgWidth = pdfWidth - 20; // with margin
            let finalImgHeight = finalImgWidth / ratio;
            
            if (finalImgHeight > pdfHeight - 20) {
                finalImgHeight = pdfHeight - 20;
                finalImgWidth = finalImgHeight * ratio;
            }
            
            const x = (pdfWidth - finalImgWidth) / 2;
            const y = (pdfHeight - finalImgHeight) / 2;

            pdf.addImage(imgData, 'PNG', x, y, finalImgWidth, finalImgHeight);
            pdf.save('comparativo_empresas.pdf');
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            setApiMessage({ type: 'error', text: 'Ocorreu um erro ao gerar o PDF. Tente novamente.' });
        } finally {
            setIsDownloadingPdf(false);
        }
    };


    const renderListView = () => (
        <>
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6 pb-6 border-b border-dark-border">
                <div>
                    <h2 className="text-xl font-semibold text-dark-text">Lista de Empresas ({filteredCompanies.length})</h2>
                    <p className="text-gray-400 text-sm mt-1">Veja e remova empresas cadastradas no sistema.</p>
                </div>
                 <button
                    onClick={() => { setView('comparison'); setSelectedIds(new Set()); setComparisonSearchTerm(''); }}
                    className="px-5 py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2"
                >
                    <ChartBarIcon className="h-5 w-5" />
                    Comparar Empresas
                </button>
            </div>
            <div className="relative mb-6">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar empresa pelo nome..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full max-w-lg p-3 pl-12 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map(company => (
                    <div key={company.id} className="bg-dark-background p-4 rounded-lg border border-dark-border flex flex-col items-start gap-3">
                        <button onClick={() => setViewingCompany(company)} className="flex items-center gap-4 w-full text-left">
                            <img
                                src={company.photoUrl || 'https://edrrnawrhfhoynpiwqsc.supabase.co/storage/v1/object/public/imagenscientes/Imagens%20Score%20Inteligente/icon%20user.png'}
                                alt={`Logo ${company.companyName}`}
                                className="w-16 h-16 rounded-full object-contain bg-dark-card p-1 border-2 border-dark-border flex-shrink-0"
                            />
                            <div className="min-w-0 flex-grow">
                                <p className="font-bold text-lg text-dark-text truncate" title={company.companyName}>{company.companyName}</p>
                                <p className="text-sm text-gray-400 truncate" title={company.email}>{company.email}</p>
                            </div>
                        </button>
                         <div className="w-full mt-auto pt-3 border-t border-dark-border/50 flex justify-end">
                            <button
                                onClick={() => setCompanyToDelete(company)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 bg-red-900/50 rounded-lg hover:bg-red-900/80 hover:text-red-300 transition-colors"
                            >
                                <DeleteIcon />
                                Excluir
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    const renderComparisonView = () => (
        <>
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6 pb-6 border-b border-dark-border">
                <div>
                    <button onClick={() => setView('list')} className="font-medium text-sm text-cyan-400 hover:underline mb-2">&larr; Voltar para Lista</button>
                    <h2 className="text-xl font-semibold text-dark-text">Área de Comparação</h2>
                </div>
                <button
                    onClick={handleDownloadPDF}
                    disabled={selectedIds.size === 0 || isDownloadingPdf}
                    className="px-5 py-2.5 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <DownloadIcon />
                    {isDownloadingPdf ? 'Gerando PDF...' : 'Download PDF'}
                </button>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Selecione as Empresas para Comparar:</label>
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" placeholder="Buscar..." value={comparisonSearchTerm} onChange={e => setComparisonSearchTerm(e.target.value)} className="w-full p-2.5 pl-10 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-80 overflow-y-auto pr-2">
                    {comparisonItems.map(item => {
                        const isSelected = selectedIds.has(item.id);
                        return (
                            <label key={item.id} className={`bg-dark-background p-3 rounded-lg border-2 transition-all cursor-pointer flex items-center gap-3 text-left hover:-translate-y-1 group ${isSelected ? 'border-cyan-400' : 'border-dark-border'}`}>
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleSelectionChange(item.id)}
                                    className="h-5 w-5 rounded border-gray-400 bg-dark-card text-cyan-600 focus:ring-cyan-500 shrink-0"
                                />
                                <img src={item.photoUrl || 'https://edrrnawrhfhoynpiwqsc.supabase.co/storage/v1/object/public/imagenscientes/Imagens%20Score%20Inteligente/icon%20user.png'} alt={item.companyName} className={`w-12 h-12 rounded-full border-2 shrink-0 object-contain bg-dark-card p-1 ${isSelected ? 'border-cyan-400' : 'border-gray-700'}`}/>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm text-gray-200 truncate">{item.companyName}</p>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>

            {comparisonCardData && comparisonCardData.length > 0 ? (
                 <div ref={comparisonReportRef} className="bg-dark-card p-6 rounded-xl mt-4">
                    <h3 className="text-2xl font-semibold text-dark-text mb-6 text-center">Relatório Comparativo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {comparisonCardData.map(card => {
                            const overallMaturity = getMaturityLevel(card.overallScore, 100);
                            return (
                                <div key={card.key} className="bg-dark-background p-4 rounded-xl shadow-lg border border-dark-border flex flex-col gap-4 h-full">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={card.photoUrl || 'https://edrrnawrhfhoynpiwqsc.supabase.co/storage/v1/object/public/imagenscientes/Imagens%20Score%20Inteligente/icon%20user.png'}
                                            alt={card.name}
                                            className="w-16 h-16 rounded-full border-4 object-contain bg-dark-card p-1"
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
            ) : (
                <div className="text-center py-12 px-6 h-full flex flex-col justify-center items-center bg-dark-background rounded-lg border-2 border-dashed border-dark-border mt-6">
                     <ChartBarIcon className="h-16 w-16 text-gray-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300">Selecione para Comparar</h3>
                    <p className="text-gray-400 mt-2">Escolha uma ou mais empresas para visualizar os gráficos.</p>
                </div>
            )}
        </>
    );

    return (
        <div className="container mx-auto">
            {isSubmitting && (
                <div className="fixed inset-0 bg-dark-background bg-opacity-90 z-[80] flex flex-col justify-center items-center p-4">
                    <div className="loader-container"><div className="loader triangle"><svg viewBox="0 0 86 80"><polygon points="43 8 79 72 7 72"></polygon></svg></div><div className="loadingtext"><p>Processando</p></div></div>
                </div>
            )}
            <ApiMessageModal message={apiMessage} onClose={() => setApiMessage(null)} />
            <ConfirmationModal
                isOpen={!!companyToDelete}
                onClose={() => setCompanyToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão de Empresa"
                confirmButtonText="Excluir Permanentemente"
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            >
                <p>Tem certeza que deseja excluir a empresa <strong className="text-cyan-400">{companyToDelete?.companyName}</strong>?</p>
                <p className="mt-2 text-sm text-yellow-400">Esta ação é irreversível e removerá todos os dados associados a esta empresa, incluindo funcionários e pontuações.</p>
            </ConfirmationModal>
             <CompanyDetailModal 
                company={viewingCompany} 
                onClose={() => setViewingCompany(null)} 
                onToggleActive={handleToggleActive}
                onApiMessage={(msg) => setApiMessage({type: msg.type, text: msg.text})}
            />

            <h1 className="text-3xl font-bold mb-8">Gerenciar Empresas</h1>

            <div className="bg-dark-card p-4 sm:p-6 rounded-xl shadow-lg border border-dark-border">
                {view === 'list' ? renderListView() : renderComparisonView()}
            </div>
        </div>
    );
};

export default ManageCompaniesPage;