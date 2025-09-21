import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useApp } from '../hooks/useApp';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Submission, User, Question } from '../types';

const ChartBarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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


const GroupDashboardPage: React.FC = () => {
  const { 
    currentUser, 
    selectCompany, 
    allRegisteredCompanies, 
    fetchAllRegisteredCompanies, 
    submissions, 
    employeeSubmissions, 
    allEmployees, 
    categories,
    questions,
    fetchSubmissions,
    fetchEmployeeScoresForAdmin,
    fetchAllEmployees
  } = useApp();
  const [view, setView] = useState<'list' | 'comparison'>('list');
  
  // State for comparison view
  const [comparisonType, setComparisonType] = useState<'companies' | 'employees'>('companies');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeCompanyFilter, setEmployeeCompanyFilter] = useState<string>('all');

  useEffect(() => {
    fetchAllRegisteredCompanies();
    fetchSubmissions();
    fetchEmployeeScoresForAdmin();
    fetchAllEmployees();
  }, [fetchAllRegisteredCompanies, fetchSubmissions, fetchEmployeeScoresForAdmin, fetchAllEmployees]);

  const managedCompanyNames = useMemo(() => new Set(currentUser?.managedCompanies || []), [currentUser]);

  const managedCompaniesData = useMemo(() => {
    return allRegisteredCompanies
      .filter(comp => managedCompanyNames.has(comp.companyName))
      .sort((a, b) => a.companyName.localeCompare(b.companyName));
  }, [managedCompanyNames, allRegisteredCompanies]);

  const managedEmployeesData = useMemo(() => {
    let employees = allEmployees.filter(emp => managedCompanyNames.has(emp.companyName));
    if (employeeCompanyFilter !== 'all') {
      employees = employees.filter(emp => emp.companyName === employeeCompanyFilter);
    }
    return employees.sort((a, b) => a.name.localeCompare(b.name));
  }, [managedCompanyNames, allEmployees, employeeCompanyFilter]);

  const handleCompanyClick = (companyName: string) => {
    selectCompany(companyName);
    window.location.hash = '#dashboard';
  };

  const handleSelectionChange = (id: string) => {
    setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        return newSet;
    });
  };

  const resetComparisonState = () => {
    setComparisonType('companies');
    setSelectedIds(new Set());
    setSearchTerm('');
    setEmployeeCompanyFilter('all');
  };

  const itemsForSelection = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    if (comparisonType === 'companies') {
      return managedCompaniesData.filter(c => c.companyName.toLowerCase().includes(lowerSearch));
    }
    return managedEmployeesData.filter(e => e.name.toLowerCase().includes(lowerSearch) || e.companyName.toLowerCase().includes(lowerSearch));
  }, [comparisonType, searchTerm, managedCompaniesData, managedEmployeesData]);

  const employeesByCompanyForComparison = useMemo(() => {
    if (comparisonType !== 'employees') return null;
    
    const employees = itemsForSelection as User[];

    return employees.reduce((acc, employee) => {
        const companyName = employee.companyName || 'Sem Empresa';
        if (!acc[companyName]) {
            acc[companyName] = [];
        }
        acc[companyName].push(employee);
        return acc;
    }, {} as Record<string, User[]>);
  }, [comparisonType, itemsForSelection]);


  const comparisonData = useMemo(() => {
    if (selectedIds.size < 1) return null;

    const data: {
      overall: { name: string; score: number; photoUrl?: string }[];
      categories: Record<string, { name: string; score: number }[]>;
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
    selectedIds.forEach(id => {
        let name: string;
        let photoUrl: string | undefined;
        let userSubs: Submission[];
        
        if (comparisonType === 'companies') {
            const company = managedCompaniesData.find(c => c.id === id);
            if (!company) return;
            name = company.companyName;
            photoUrl = company.photoUrl;
            userSubs = sourceSubmissions.filter(s => s.companyName === name);
        } else {
            const employee = managedEmployeesData.find(e => e.id === id);
            if (!employee) return;
            name = `${employee.name} (${employee.companyName})`;
            photoUrl = employee.photoUrl;
            userSubs = sourceSubmissions.filter(s => s.userName === employee.name && s.companyName === employee.companyName);
        }

        if (userSubs.length === 0) {
             data.overall.push({ name, score: 0, photoUrl });
             relevantCategories.forEach(cat => { data.categories[cat.name].push({ name, score: 0 }); });
            return;
        };

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

        selectedIds.forEach(id => {
            let name: string;
            let userSubs: Submission[];
            
            if (comparisonType === 'companies') {
                const company = managedCompaniesData.find(c => c.id === id);
                if (!company) return;
                name = company.companyName;
                userSubs = sourceSubmissions.filter(s => s.companyName === name);
            } else {
                const employee = managedEmployeesData.find(e => e.id === id);
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
  }, [selectedIds, comparisonType, submissions, employeeSubmissions, categories, managedCompaniesData, managedEmployeesData, questions]);
  
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
            const companyDetails = managedCompaniesData.find(c => c.companyName === name);
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
  }, [comparisonData, comparisonType, managedCompaniesData]);


  const renderComparisonView = () => {
    const renderSelectionCard = (item: User) => {
        const isEmployee = comparisonType === 'employees';
        const id = item.id;
        const name = isEmployee ? item.name : item.companyName;
        const photoUrl = item.photoUrl;
        const subtitle = isEmployee ? item.companyName : null;
        const isSelected = selectedIds.has(id);

        return (
            <label 
                key={id}
                className={`bg-dark-background p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer flex items-center gap-3 text-left hover:-translate-y-1 group ${isSelected ? 'border-cyan-400' : 'border-dark-border hover:border-gray-600'}`}
            >
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectionChange(id)}
                    className="h-5 w-5 rounded border-gray-400 bg-dark-card text-cyan-600 focus:ring-cyan-500 shrink-0"
                />
                <img 
                    src={photoUrl || 'https://edrrnawrhfhoynpiwqsc.supabase.co/storage/v1/object/public/imagenscientes/Imagens%20Score%20Inteligente/icon%20user.png'}
                    alt={name}
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
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6 pb-6 border-b border-dark-border">
              <button onClick={() => setView('list')} className="font-medium text-sm text-cyan-400 hover:underline">&larr; Voltar para Empresas</button>
              <h2 className="text-xl font-semibold text-dark-text">Área de Comparação</h2>
            </div>
    
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Comparação:</label>
                    <div className="flex items-center bg-dark-background p-1 rounded-full border border-dark-border">
                         <button onClick={() => { setComparisonType('companies'); setSelectedIds(new Set()); }} className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-all ${comparisonType === 'companies' ? 'bg-cyan-500 text-white' : 'text-gray-400'}`}>Empresas</button>
                         <button onClick={() => { setComparisonType('employees'); setSelectedIds(new Set()); }} className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-all ${comparisonType === 'employees' ? 'bg-cyan-500 text-white' : 'text-gray-400'}`}>Funcionários</button>
                    </div>
                </div>
                {comparisonType === 'employees' && (
                    <div>
                        <label htmlFor="employee-company-filter" className="block text-sm font-medium text-gray-300 mb-2">Filtrar por Empresa:</label>
                        <select id="employee-company-filter" value={employeeCompanyFilter} onChange={e => { setEmployeeCompanyFilter(e.target.value); setSelectedIds(new Set()); }} className="w-full p-2.5 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="all">Todas as Empresas</option>
                          {managedCompaniesData.map(c => <option key={c.id} value={c.companyName}>{c.companyName}</option>)}
                        </select>
                    </div>
                )}
            </div>
            
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Selecione para Comparar:</label>
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2.5 pl-10 border border-dark-border rounded-lg bg-dark-background focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"/>
                </div>
                <div className="max-h-80 overflow-y-auto pr-2">
                    {comparisonType === 'companies' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {itemsForSelection.map(item => renderSelectionCard(item as User))}
                        </div>
                    ) : employeesByCompanyForComparison ? (
                        <div className="space-y-4">
                            {Object.entries(employeesByCompanyForComparison).map(([companyName, employees]) => (
                                <div key={companyName}>
                                    <h4 className="font-semibold text-cyan-400 mb-2 sticky top-0 bg-dark-card py-2 px-2 -mx-2">{companyName}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {employees.map(employee => renderSelectionCard(employee))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
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
                    <p className="text-gray-400 mt-2">Escolha um ou mais {comparisonType === 'companies' ? 'empresas' : 'funcionários'} para visualizar os gráficos.</p>
                </div>
            )}
        </div>
      )
  };

  return (
    <div className="container mx-auto">
      {view === 'list' ? (
        <>
          <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Painel do Grupo: {currentUser?.companyName}</h1>
              <p className="text-gray-400">Selecione uma empresa para visualizar seus dados detalhados.</p>
            </div>
            <button
              onClick={() => { setView('comparison'); resetComparisonState(); }}
              className="px-5 py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2"
            >
              <ChartBarIcon className="h-5 w-5" />
              Área de Comparação
            </button>
          </div>
          
          {managedCompaniesData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {managedCompaniesData.map(company => (
                <div 
                  key={company.companyName} 
                  onClick={() => handleCompanyClick(company.companyName)} 
                  className="bg-dark-card p-6 rounded-xl shadow-lg border border-dark-border cursor-pointer transition-all duration-300 hover:shadow-cyan-500/20 hover:border-cyan-400/50 hover:-translate-y-1 flex flex-col items-center text-center"
                >
                  <img 
                    src={company.photoUrl || 'https://edrrnawrhfhoynpiwqsc.supabase.co/storage/v1/object/public/imagenscientes/Imagens%20Score%20Inteligente/icon%20user.png'} 
                    alt={`Logo ${company.companyName}`}
                    className="w-24 h-24 rounded-full object-contain mb-4 bg-dark-background p-1 border-2 border-dark-border transition-transform duration-300 hover:scale-105"
                  />
                  <h2 className="text-xl font-semibold text-cyan-400">{company.companyName}</h2>
                  <p className="text-gray-400 mt-2 text-sm">Clique para ver os scores, funcionários e análises.</p>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-16 bg-dark-card rounded-xl shadow-lg border border-dark-border">
                <h2 className="text-2xl font-semibold text-dark-text">Nenhuma Empresa Vinculada</h2>
                <p className="text-gray-400 mt-2">Não há empresas associadas a este grupo no momento.</p>
            </div>
          )}
        </>
      ) : (
        renderComparisonView()
      )}
    </div>
  );
};

export default GroupDashboardPage;