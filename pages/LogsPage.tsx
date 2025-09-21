import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { LogType, User, LogEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LogMessageCell: React.FC<{ log: LogEntry; employees: User[]; companies: User[]; onPhotoClick: (src: string) => void; }> = ({ log, employees, companies, onPhotoClick }) => {
    const fallbackUserIcon = 'https://edrrnawrhfhoynpiwqsc.supabase.co/storage/v1/object/public/imagenscientes/Imagens%20Score%20Inteligente/icon%20user.png';
    const fallbackCompanyIcon = 'https://edrrnawrhfhoynpiwqsc.supabase.co/storage/v1/object/public/imagenscientes/Imagens%20Score%20Inteligente/icon%20user.png';

    const { userName, companyName } = useMemo(() => {
        const match = log.message.match(/Usuário "([^"]+)" da empresa "([^"]+)"/);
        if (match) {
            return { userName: match[1], companyName: match[2] };
        }
        const companyMatch = log.message.match(/enviado por (.+)\./);
         if (companyMatch) {
            return { userName: null, companyName: companyMatch[1] };
        }
        return { userName: null, companyName: null };
    }, [log.message]);

    const employee = useMemo(() => {
        if (!userName) return null;
        // Find employee by name and company for better accuracy
        if (companyName) {
            return employees.find(e => e.name === userName && e.companyName === companyName);
        }
        // Fallback for logs that might not have company name in a structured way
        return employees.find(e => e.name === userName);
    }, [employees, userName, companyName]);

    const company = useMemo(() => {
        if (!companyName) return null;
        return companies.find(c => c.companyName === companyName);
    }, [companies, companyName]);

    return (
        <div className="flex items-center gap-3">
            {company && (
                <img
                    src={company.photoUrl || fallbackCompanyIcon}
                    alt={`Logo ${company.companyName}`}
                    className="h-10 w-10 rounded-full object-contain bg-dark-background p-0.5 border-2 border-dark-border flex-shrink-0 cursor-pointer transition-transform hover:scale-110"
                    title={company.companyName}
                    onClick={() => company.photoUrl && onPhotoClick(company.photoUrl)}
                />
            )}
            {employee && (
                 <img
                    src={employee.photoUrl || fallbackUserIcon}
                    alt={`Foto de ${employee.name}`}
                    className="h-10 w-10 rounded-full object-cover border-2 border-gray-600 flex-shrink-0 cursor-pointer transition-transform hover:scale-110"
                    title={employee.name}
                    onClick={() => employee.photoUrl && onPhotoClick(employee.photoUrl)}
                />
            )}
            <span>{log.message}</span>
        </div>
    );
};


const LogsPage: React.FC = () => {
    const { logs, currentUser, fetchLoginLogs, fetchApprovedUsersLogs, allRegisteredCompanies, allEmployees, fetchAllRegisteredCompanies, fetchAllEmployees } = useApp();
    const [logTypeFilter, setLogTypeFilter] = useState<LogType>(LogType.USER_APPROVAL);
    const [companyFilter, setCompanyFilter] = useState<string>('all');
    const [employeeFilter, setEmployeeFilter] = useState<string>('all');
    const [photoModalSrc, setPhotoModalSrc] = useState<string | null>(null);

    // Fetch logs when filter changes
    useEffect(() => {
        if (currentUser?.role !== 'admin') return;
        const fetchLogs = async () => {
            if (logTypeFilter === LogType.USER_LOGIN) {
                await fetchLoginLogs();
            } else if (logTypeFilter === LogType.USER_APPROVAL) {
                await fetchApprovedUsersLogs();
            }
        };
        fetchLogs();
    }, [logTypeFilter, fetchLoginLogs, fetchApprovedUsersLogs, currentUser]);

    // Fetch data for filters on mount
    useEffect(() => {
        if (currentUser?.role === 'admin') {
            fetchAllRegisteredCompanies();
            fetchAllEmployees();
        }
    }, [currentUser, fetchAllRegisteredCompanies, fetchAllEmployees]);

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCompanyFilter(e.target.value);
        setEmployeeFilter('all'); // Reset employee filter when company changes
    };
    
    const companyOptions = useMemo(() => {
        // Create a unique list of company names from all registered companies
        const companyNames = new Set(allRegisteredCompanies.map(c => c.companyName));
        return Array.from(companyNames).sort();
    }, [allRegisteredCompanies]);

    const employeesForSelectedCompany = useMemo(() => {
        // Combine company owners and employees into a single list for the filter
        const allUsersList = [
            ...allRegisteredCompanies,
            ...allEmployees,
        ].sort((a, b) => a.name.localeCompare(b.name));
        
        // Remove duplicates by email, preferring the one with more details if any
        const uniqueUsers = Array.from(new Map(allUsersList.map(user => [user.email, user])).values());

        if (companyFilter === 'all') {
            return uniqueUsers;
        }
        return uniqueUsers.filter(user => user.companyName === companyFilter);
    }, [allRegisteredCompanies, allEmployees, companyFilter]);

    const filteredLogs = useMemo(() => {
        return logs
            .filter(log => {
                const typeMatch = log.type === logTypeFilter;
                if (!typeMatch) return false;

                let logCompanyName: string | null = null;
                let logUserName: string | null = null;

                // Regex for "Usuário 'NAME' da empresa 'COMPANY'"
                let match = log.message.match(/Usuário "([^"]+)" da empresa "([^"]+)"/);
                if (match) {
                    logUserName = match[1];
                    logCompanyName = match[2];
                } else {
                    // Regex for "... enviado por COMPANY." (for questionnaire submissions)
                    match = log.message.match(/enviado por (.+)\./);
                    if (match) {
                        logCompanyName = match[1];
                        // No user name in this log type
                    }
                }

                const companyMatch = companyFilter === 'all' || (logCompanyName && logCompanyName === companyFilter);
                // Can only filter by employee if the log has a user name and it matches
                const employeeMatch = employeeFilter === 'all' || (logUserName && logUserName === employeeFilter);

                return companyMatch && employeeMatch;
            })
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [logs, logTypeFilter, companyFilter, employeeFilter]);

    const chartData = useMemo(() => {
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today

        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0); // Start of 7 days ago

        const dataMap = new Map<string, number>();
        // Initialize map with all 7 days to ensure they appear on the chart
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateString = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            dataMap.set(dateString, 0);
        }

        // Populate map with data from logs
        filteredLogs.forEach(log => {
            const logDate = new Date(log.timestamp);
            if (logDate >= startDate && logDate <= today) {
                 const dateString = logDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                 if (dataMap.has(dateString)) {
                     dataMap.set(dateString, (dataMap.get(dateString) || 0) + 1);
                 }
            }
        });

        return Array.from(dataMap.entries()).map(([date, count]) => ({
            date,
            count
        }));
    }, [filteredLogs]);

    const chartTitle = logTypeFilter === LogType.USER_APPROVAL ? 'Aprovações por Dia' : 'Logins de Usuários por Dia';

    // Redirect if not admin (safety measure)
    if (currentUser?.role !== 'admin') {
        window.location.hash = '#dashboard';
        return null;
    }

    return (
        <div className="container mx-auto">
            {photoModalSrc && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4 cursor-pointer"
                    onClick={() => setPhotoModalSrc(null)}
                >
                    <img 
                        src={photoModalSrc} 
                        alt="Visualização ampliada" 
                        className="max-w-full max-h-full object-contain rounded-lg"
                    />
                    <button 
                      onClick={() => setPhotoModalSrc(null)} 
                      className="absolute top-4 right-4 text-white text-3xl font-bold"
                      aria-label="Fechar imagem"
                    >&times;</button>
                </div>
            )}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold">Registros de Atividades (Logs)</h1>
                <div className="flex flex-wrap items-center justify-start sm:justify-end gap-x-6 gap-y-3">
                    <div className="flex items-center gap-2">
                        <label htmlFor="log-type-select" className="text-sm font-medium shrink-0">Tipo de Log:</label>
                        <select
                            id="log-type-select"
                            value={logTypeFilter}
                            onChange={(e) => setLogTypeFilter(e.target.value as LogType)}
                            className="p-2 border border-dark-border rounded-lg bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={LogType.USER_APPROVAL}>Logs de Aprovação</option>
                            <option value={LogType.USER_LOGIN}>Logs de Login</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="company-filter" className="text-sm font-medium shrink-0">Empresa:</label>
                        <select
                            id="company-filter"
                            name="company"
                            value={companyFilter}
                            onChange={handleCompanyChange}
                            className="p-2 border border-dark-border rounded-lg bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Todas as Empresas</option>
                            {companyOptions.map(companyName => (
                                <option key={companyName} value={companyName}>{companyName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="employee-filter" className="text-sm font-medium shrink-0">Funcionário:</label>
                        <select
                            id="employee-filter"
                            name="employee"
                            value={employeeFilter}
                            onChange={(e) => setEmployeeFilter(e.target.value)}
                            className="p-2 border border-dark-border rounded-lg bg-dark-card focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Todos os Funcionários</option>
                            {employeesForSelectedCompany.map(employee => (
                                <option key={employee.id} value={employee.name}>{employee.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            
            {/* Chart */}
            <div className="bg-dark-card p-4 sm:p-6 rounded-xl shadow-lg border border-dark-border mb-8">
                <h2 className="text-xl font-semibold mb-4 text-cyan-400">{chartTitle} (Últimos 7 dias)</h2>
                 {filteredLogs.length > 0 ? (
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" stroke="#9CA3AF" />
                                <YAxis allowDecimals={false} stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        borderColor: '#374151',
                                        color: '#F3F4F6'
                                    }}
                                    labelStyle={{ color: '#9CA3AF' }}
                                />
                                <Legend wrapperStyle={{ color: '#F3F4F6' }} />
                                <Bar dataKey="count" name="Eventos" fill="#17A2B8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                 ) : (
                    <p className="text-center text-gray-400 py-10">Não há dados suficientes para exibir o gráfico com os filtros atuais.</p>
                 )}
            </div>

            {/* Log List */}
            <div className="bg-dark-card p-4 sm:p-6 rounded-xl shadow-lg border border-dark-border">
                <h2 className="text-xl font-semibold mb-4">Detalhes dos Logs</h2>
                {filteredLogs.length > 0 ? (
                    <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-dark-card z-10">
                                <tr className="border-b border-dark-border">
                                    <th className="py-2 pr-2 font-semibold">Data e Hora</th>
                                    <th className="py-2 px-2 font-semibold">Mensagem</th>
                                    {logTypeFilter === LogType.USER_APPROVAL && <th className="py-2 pl-2 font-semibold">Aprovado Por</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map(log => (
                                    <tr key={log.id} className="border-b border-dark-border last:border-0 hover:bg-dark-background/50 transition-colors">
                                        <td className="py-3 pr-2 whitespace-nowrap text-sm text-gray-400 font-mono">
                                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="py-3 px-2 text-sm">
                                            <LogMessageCell 
                                                log={log} 
                                                employees={allEmployees} 
                                                companies={allRegisteredCompanies}
                                                onPhotoClick={setPhotoModalSrc}
                                            />
                                        </td>
                                        {logTypeFilter === LogType.USER_APPROVAL && (
                                            <td className="py-3 pl-2 text-sm text-gray-300">{log.adminName || 'N/A'}</td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-400 py-10">Nenhum log encontrado para os filtros selecionados.</p>
                )}
            </div>
        </div>
    );
};

export default LogsPage;