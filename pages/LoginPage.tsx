import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../hooks/useApp';

const EyeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);

const EyeOffIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m-2.14 2.14l-3.289-3.29" />
    </svg>
);

const CameraIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
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

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];


const LoginPage: React.FC = () => {
    const [view, setView] = useState<'login' | 'register-choice' | 'register-company' | 'register-employee'>('login');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    
    // Common fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDay, setBirthDay] = useState('');
    const [birthMonth, setBirthMonth] = useState('');
    const [birthYear, setBirthYear] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [apiMessage, setApiMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    
    // Company fields
    const [companyName, setCompanyName] = useState('');
    const [companyLogo, setCompanyLogo] = useState<string | null>(null);
    const [estado, setEstado] = useState('');
    const [cidade, setCidade] = useState('');
    const [cities, setCities] = useState<{ id: number; nome: string }[]>([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
    const [bairro, setBairro] = useState('');
    const [bairros, setBairros] = useState<string[]>([]);
    const [isLoadingBairros, setIsLoadingBairros] = useState(false);
    const [isBairroDropdownOpen, setIsBairroDropdownOpen] = useState(false);
    const [segmento, setSegmento] = useState('');
    const [isLoadingSegmentos, setIsLoadingSegmentos] = useState(false);


    // Employee fields
    const [confirmPassword, setConfirmPassword] = useState('');
    const [companyCode, setCompanyCode] = useState('');
    const [photo, setPhoto] = useState<string | null>(null);
    const [isTakingSelfie, setIsTakingSelfie] = useState(false);
    
    // Password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Refs for selfie functionality
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const companyLogoInputRef = useRef<HTMLInputElement>(null);
    const cityWrapperRef = useRef<HTMLDivElement>(null);
    const bairroWrapperRef = useRef<HTMLDivElement>(null);


    const { login, register, registerEmployee, segmentos, fetchSegmentos } = useApp();
    
    // Stop camera stream when component unmounts or selfie mode is exited
    useEffect(() => {
        const stopCamera = () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        };

        if (!isTakingSelfie) {
            stopCamera();
        }
        
        return () => stopCamera();
    }, [isTakingSelfie]);
    
    // Effect to close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cityWrapperRef.current && !cityWrapperRef.current.contains(event.target as Node)) {
                setIsCityDropdownOpen(false);
            }
            if (bairroWrapperRef.current && !bairroWrapperRef.current.contains(event.target as Node)) {
                setIsBairroDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (view === 'register-company') {
            const loadSegmentos = async () => {
                setIsLoadingSegmentos(true);
                await fetchSegmentos();
                setIsLoadingSegmentos(false);
            };
            loadSegmentos();
        }
    }, [view, fetchSegmentos]);

    useEffect(() => {
        if (estado) {
            setIsLoadingCities(true);
            setCities([]);
            setCidade('');
            setBairros([]);
            setBairro('');
            fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`)
                .then(response => response.json())
                .then(data => {
                    const cityData = data.map((city: { id: number; nome: string }) => ({ id: city.id, nome: city.nome })).sort((a: any, b: any) => a.nome.localeCompare(b.nome));
                    setCities(cityData);
                })
                .catch(error => {
                    console.error("Error fetching cities:", error);
                    setError('Não foi possível carregar as cidades. Tente selecionar o estado novamente.');
                })
                .finally(() => {
                    setIsLoadingCities(false);
                });
        } else {
            setCities([]);
            setCidade('');
            setBairros([]);
            setBairro('');
        }
    }, [estado]);

    useEffect(() => {
        if (cidade && estado) {
            setIsLoadingBairros(true);
            setBairros([]);
            setBairro('');
    
            const overpassUrl = 'https://overpass-api.de/api/interpreter';
            // This Overpass QL query looks for neighborhoods/suburbs within the specified city and state.
            const query = `
                [out:json][timeout:25];
                area["ISO3166-2"~"^BR-${estado}"]["admin_level"=4]->.state;
                area(area.state)["name"="${cidade}"]["admin_level"=8]->.city;
                (
                    node(area.city)[place~"^(suburb|neighbourhood)$"];
                    way(area.city)[place~"^(suburb|neighbourhood)$"];
                    rel(area.city)[place~"^(suburb|neighbourhood)$"];
                );
                out tags;
            `;
            
            // The Overpass API expects the raw query string in the POST body.
            fetch(overpassUrl, {
                method: 'POST',
                body: query
            })
            .then(async response => {
                if (!response.ok) {
                    const errorBody = await response.text();
                    console.error('Overpass API response error:', response.status, response.statusText);
                    console.error('Overpass API error body:', errorBody);
                    throw new Error('A resposta da API Overpass não foi bem-sucedida.');
                }
                return response.json();
            })
            .then(data => {
                if (data && data.elements && Array.isArray(data.elements)) {
                    const neighborhoodNames: string[] = data.elements
                        .map((el: any) => el.tags?.name)
                        .filter((name: unknown): name is string => typeof name === 'string' && name.trim().length > 0);
                    
                    const uniqueBairros = [...new Set(neighborhoodNames)].sort((a, b) => a.localeCompare(b));
                    setBairros(uniqueBairros);
                } else {
                    // Handle valid responses that don't contain any neighborhoods
                    setBairros([]);
                }
            })
            .catch(error => {
                console.error("Erro ao buscar bairros do OpenStreetMap:", error);
                // Reset bairros list on error to allow manual input as a fallback
                setBairros([]);
            })
            .finally(() => {
                setIsLoadingBairros(false);
            });
        } else {
            setBairros([]);
            setBairro('');
        }
    }, [cidade, estado]);

    const resetFields = () => {
        setEmail('');
        setPassword('');
        setName('');
        setPhone('');
        setBirthDay('');
        setBirthMonth('');
        setBirthYear('');
        setError('');
        setSuccess('');
        setCompanyName('');
        setEstado('');
        setCidade('');
        setCities([]);
        setBairro('');
        setBairros([]);
        setSegmento('');
        setConfirmPassword('');
        setCompanyCode('');
        setPhoto(null);
        setCompanyLogo(null);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setIsTakingSelfie(false);
    }

    const handleViewChange = (newView: typeof view) => {
        resetFields();
        setView(newView);
    }

    const startCamera = async () => {
        setIsTakingSelfie(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            setError("Não foi possível acessar a câmera. Verifique as permissões do seu navegador.");
            setIsTakingSelfie(false);
        }
    };
    
    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            const context = canvas.getContext('2d');
            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setPhoto(dataUrl);
            }
        }
        setIsTakingSelfie(false);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhoto(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCompanyLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setCompanyLogo(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (view === 'login') {
            setIsLoggingIn(true);
            const loginPromise = login(email, password);
            const timerPromise = new Promise(resolve => setTimeout(resolve, 4000));
            const [loginResult] = await Promise.all([loginPromise, timerPromise]);

            if (loginResult.success) {
                // O redirecionamento agora é tratado pelo App.tsx para uma lógica mais robusta.
            } else {
                setError(loginResult.message || 'Credenciais inválidas.');
                setIsLoggingIn(false);
            }
        } else if (view === 'register-company') {
            if(!name || !birthDay || !birthMonth || !birthYear || !companyName || !email || !password || !phone || !estado || !cidade || !bairro || !segmento) {
                setError('Todos os campos, exceto o logo, são obrigatórios.');
                return;
            }
            const birthDate = `${birthDay}/${birthMonth}/${birthYear}`;
            setIsRegistering(true);
            const result = await register(name, companyName, email, password, phone, companyLogo, estado, cidade, bairro, birthDate, segmento);
            setIsRegistering(false);

            if (result && result.success) {
                setApiMessage({ type: 'success', text: result.message || 'Cadastro realizado! Aguarde a aprovação do administrador para acessar.' });
            } else {
                setApiMessage({ type: 'error', text: result?.message || 'Falha no cadastro. Tente novamente.' });
            }
        } else if (view === 'register-employee') {
            if (password !== confirmPassword) {
                setError('As senhas não coincidem.');
                return;
            }
            if (!name || !birthDay || !birthMonth || !birthYear || !phone || !email || !password || !companyCode || !estado || !cidade || !bairro) {
                setError('Todos os campos, exceto a foto, são obrigatórios.');
                return;
            }
            const birthDate = `${birthDay}/${birthMonth}/${birthYear}`;
            setIsRegistering(true);
            const result = await registerEmployee(name, phone, email, password, companyCode, photo, estado, cidade, bairro, birthDate);
            setIsRegistering(false);

            if (result && result.success) {
                setApiMessage({ type: 'success', text: result.message || 'Sua solicitação foi encaminhada à diretoria da Triad3 Inteligência Digital. Em breve, você receberá uma resposta pelo WhatsApp!' });
            } else {
                setApiMessage({ type: 'error', text: result?.message || 'Falha no cadastro de funcionário. Tente novamente.' });
            }
        }
    };
    
    const renderFormContent = () => {
        const filteredCities = cities.filter(city => city.nome.toLowerCase().includes(cidade.toLowerCase()));
        const filteredBairros = bairros.filter(bairroItem => bairroItem.toLowerCase().includes(bairro.toLowerCase()));

        if (view === 'register-choice') {
            return (
                <>
                    <h2 className="text-2xl font-bold text-dark-text text-center mb-6">Criar Nova Conta</h2>
                    <div className="space-y-4">
                        <button onClick={() => handleViewChange('register-company')} className="w-full flex justify-center py-3 px-4 border border-dark-border text-base font-semibold rounded-lg text-dark-text bg-dark-card hover:bg-gray-800 transition-all">Sou uma Empresa</button>
                        <button onClick={() => handleViewChange('register-employee')} className="w-full flex justify-center py-3 px-4 border border-dark-border text-base font-semibold rounded-lg text-dark-text bg-dark-card hover:bg-gray-800 transition-all">Sou um Funcionário</button>
                    </div>
                    <div className="mt-6 text-center">
                        <button onClick={() => handleViewChange('login')} className="font-medium text-sm text-cyan-400 hover:underline">Já tem uma conta? Acesse aqui</button>
                    </div>
                </>
            );
        }

        if (view === 'register-company') {
            return (
                <>
                    <button onClick={() => handleViewChange('register-choice')} className="font-medium text-sm text-cyan-400 hover:underline mb-4">&larr; Voltar</button>
                    <h2 className="text-2xl font-bold text-dark-text text-center mb-4">Cadastro da Empresa</h2>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="flex flex-col items-center space-y-3 pt-2">
                            {companyLogo ? (
                                <div className="relative">
                                    <img src={companyLogo} alt="Prévia do logo" className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-contain border-2 border-cyan-400 bg-dark-background p-1" />
                                    <button type="button" onClick={() => setCompanyLogo(null)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full h-7 w-7 flex items-center justify-center text-xs font-bold">&times;</button>
                                </div>
                            ) : (
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-dark-background border-2 border-dashed border-dark-border flex items-center justify-center">
                                    <span className="text-gray-400 text-sm text-center">Logo da Empresa</span>
                                </div>
                            )}
                            <button type="button" onClick={() => companyLogoInputRef.current?.click()} className="flex items-center justify-center px-4 py-2 border border-dark-border text-sm font-medium rounded-lg text-dark-text hover:bg-gray-800 transition-colors">
                                <UploadIcon/> {companyLogo ? 'Alterar Logo' : 'Enviar Logo'}
                            </button>
                            <input type="file" ref={companyLogoInputRef} onChange={handleCompanyLogoChange} accept="image/*" className="hidden" />
                        </div>
                        
                        <input name="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="Seu Nome Completo" />
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 text-left">Data de Nascimento</label>
                            <div className="grid grid-cols-3 gap-4">
                                <input name="birthDay" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={birthDay} onChange={e => setBirthDay(e.target.value.replace(/[^0-9]/g, ''))} required className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-center" placeholder="Dia" />
                                <input name="birthMonth" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={birthMonth} onChange={e => setBirthMonth(e.target.value.replace(/[^0-9]/g, ''))} required className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-center" placeholder="Mês" />
                                <input name="birthYear" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4} value={birthYear} onChange={e => setBirthYear(e.target.value.replace(/[^0-9]/g, ''))} required className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-center" placeholder="Ano" />
                            </div>
                        </div>

                        <input name="companyName" type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} required className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="Nome da Empresa" />
                        
                        <select
                            name="segmento"
                            value={segmento}
                            onChange={e => setSegmento(e.target.value)}
                            required
                            disabled={isLoadingSegmentos}
                            className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition disabled:opacity-50"
                        >
                            <option value="" disabled>
                                {isLoadingSegmentos ? 'Carregando segmentos...' : 'Selecione o Segmento'}
                            </option>
                            {segmentos.map(seg => (
                                <option key={seg.id} value={seg.name}>{seg.name}</option>
                            ))}
                        </select>

                        <div className="grid grid-cols-2 gap-4">
                            <select name="estado" value={estado} onChange={e => setEstado(e.target.value)} required className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
                              <option value="" disabled>Selecione o Estado</option>
                              {brazilianStates.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                            </select>
                            <div className="relative" ref={cityWrapperRef}>
                                <input
                                    name="cidade"
                                    type="text"
                                    value={cidade}
                                    onChange={e => setCidade(e.target.value)}
                                    onFocus={() => setIsCityDropdownOpen(true)}
                                    required
                                    disabled={!estado || isLoadingCities}
                                    className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder={isLoadingCities ? 'Carregando...' : (estado ? 'Digite ou selecione a cidade' : 'Escolha um estado')}
                                    autoComplete="off"
                                />
                                {isCityDropdownOpen && !isLoadingCities && filteredCities.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-dark-background border border-dark-border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                                        {filteredCities.map(city => (
                                            <li
                                                key={city.id}
                                                className="px-4 py-2 text-dark-text hover:bg-dark-action cursor-pointer"
                                                onMouseDown={() => {
                                                    setCidade(city.nome);
                                                    setIsCityDropdownOpen(false);
                                                }}
                                            >
                                                {city.nome}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                         
                        <div className="relative" ref={bairroWrapperRef}>
                            <input
                                name="bairro"
                                type="text"
                                value={bairro}
                                onChange={e => setBairro(e.target.value)}
                                onFocus={() => setIsBairroDropdownOpen(true)}
                                required
                                disabled={!cidade || isLoadingBairros}
                                className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition disabled:opacity-50"
                                placeholder={isLoadingBairros ? "Carregando bairros..." : (cidade ? "Digite ou selecione seu bairro" : "Escolha uma cidade")}
                                autoComplete="off"
                            />
                            {isBairroDropdownOpen && !isLoadingBairros && (bairros.length > 0 || filteredBairros.length > 0) && (
                                <ul className="absolute z-10 w-full bg-dark-background border border-dark-border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                                    {(filteredBairros.length > 0 ? filteredBairros : bairros).map(bairroItem => (
                                        <li
                                            key={bairroItem}
                                            className="px-4 py-2 text-dark-text hover:bg-dark-action cursor-pointer"
                                            onMouseDown={() => {
                                                setBairro(bairroItem);
                                                setIsBairroDropdownOpen(false);
                                            }}
                                        >
                                            {bairroItem}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        
                        <input name="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="Seu e-mail" />
                        <input name="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="Seu telefone" />
                        <div className="relative">
                            <input name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition pr-10" placeholder="Sua senha" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center" aria-label="Toggle password visibility">{showPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
                        </div>
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-blue-500 transition-all duration-300 ease-in-out">Finalizar Cadastro</button>
                    </form>
                </>
            );
        }

        if (view === 'register-employee') {
            return (
                <>
                    <button onClick={() => handleViewChange('register-choice')} className="font-medium text-sm text-cyan-400 hover:underline mb-4">&larr; Voltar</button>
                    <h2 className="text-2xl font-bold text-dark-text text-center mb-4">Cadastro de Funcionário</h2>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        {/* Photo Section */}
                        <div className="flex flex-col items-center space-y-3">
                            <canvas ref={canvasRef} className="hidden"></canvas>
                            {isTakingSelfie ? (
                                <div className="w-full p-2 bg-black rounded-lg">
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-md h-48 object-cover transform -scale-x-100"></video>
                                    <div className="flex justify-center gap-4 mt-2">
                                        <button type="button" onClick={capturePhoto} className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors">Capturar</button>
                                        <button type="button" onClick={() => setIsTakingSelfie(false)} className="px-4 py-2 text-sm font-semibold rounded-lg text-gray-800 bg-gray-300 hover:bg-gray-400 transition-colors">Cancelar</button>
                                    </div>
                                </div>
                            ) : photo ? (
                                <div className="relative">
                                    <img src={photo} alt="Prévia da selfie" className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-cyan-400" />
                                    <button type="button" onClick={() => setPhoto(null)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full h-7 w-7 flex items-center justify-center text-xs font-bold">&times;</button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center space-y-3 w-full">
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-dark-background border-2 border-dashed border-dark-border flex items-center justify-center">
                                        <span className="text-gray-400 text-sm">Sua Foto</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button type="button" onClick={startCamera} className="flex items-center justify-center px-4 py-2 border border-dark-border text-sm font-medium rounded-lg text-dark-text hover:bg-gray-800 transition-colors"><CameraIcon/>Tirar Selfie</button>
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center px-4 py-2 border border-dark-border text-sm font-medium rounded-lg text-dark-text hover:bg-gray-800 transition-colors"><UploadIcon/>Enviar Foto</button>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <input name="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="Nome Completo" />
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 text-left">Data de Nascimento</label>
                            <div className="grid grid-cols-3 gap-4">
                                <input name="birthDay" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={birthDay} onChange={e => setBirthDay(e.target.value.replace(/[^0-9]/g, ''))} required className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-center" placeholder="Dia" />
                                <input name="birthMonth" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={birthMonth} onChange={e => setBirthMonth(e.target.value.replace(/[^0-9]/g, ''))} required className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-center" placeholder="Mês" />
                                <input name="birthYear" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4} value={birthYear} onChange={e => setBirthYear(e.target.value.replace(/[^0-9]/g, ''))} required className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-center" placeholder="Ano" />
                            </div>
                        </div>
                        <input name="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="Telefone" />
                        <input name="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="E-mail" />
                        <input name="companyCode" type="text" value={companyCode} onChange={e => setCompanyCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} required className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="Código da Empresa" />

                        <div className="grid grid-cols-2 gap-4">
                            <select name="estado" value={estado} onChange={e => setEstado(e.target.value)} required className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
                              <option value="" disabled>Selecione o Estado</option>
                              {brazilianStates.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                            </select>
                            <div className="relative" ref={cityWrapperRef}>
                                <input
                                    name="cidade"
                                    type="text"
                                    value={cidade}
                                    onChange={e => setCidade(e.target.value)}
                                    onFocus={() => setIsCityDropdownOpen(true)}
                                    required
                                    disabled={!estado || isLoadingCities}
                                    className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder={isLoadingCities ? 'Carregando...' : (estado ? 'Digite ou selecione a cidade' : 'Escolha um estado')}
                                    autoComplete="off"
                                />
                                {isCityDropdownOpen && !isLoadingCities && filteredCities.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-dark-background border border-dark-border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                                        {filteredCities.map(city => (
                                            <li
                                                key={city.id}
                                                className="px-4 py-2 text-dark-text hover:bg-dark-action cursor-pointer"
                                                onMouseDown={() => {
                                                    setCidade(city.nome);
                                                    setIsCityDropdownOpen(false);
                                                }}
                                            >
                                                {city.nome}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                         
                        <div className="relative" ref={bairroWrapperRef}>
                            <input
                                name="bairro"
                                type="text"
                                value={bairro}
                                onChange={e => setBairro(e.target.value)}
                                onFocus={() => setIsBairroDropdownOpen(true)}
                                required
                                disabled={!cidade || isLoadingBairros}
                                className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition disabled:opacity-50"
                                placeholder={isLoadingBairros ? "Carregando bairros..." : (cidade ? "Digite ou selecione seu bairro" : "Escolha uma cidade")}
                                autoComplete="off"
                            />
                            {isBairroDropdownOpen && !isLoadingBairros && (bairros.length > 0 || filteredBairros.length > 0) && (
                                <ul className="absolute z-10 w-full bg-dark-background border border-dark-border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                                    {(filteredBairros.length > 0 ? filteredBairros : bairros).map(bairroItem => (
                                        <li
                                            key={bairroItem}
                                            className="px-4 py-2 text-dark-text hover:bg-dark-action cursor-pointer"
                                            onMouseDown={() => {
                                                setBairro(bairroItem);
                                                setIsBairroDropdownOpen(false);
                                            }}
                                        >
                                            {bairroItem}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        
                        <div className="relative">
                            <input name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition pr-10" placeholder="Senha" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center" aria-label="Toggle password visibility">{showPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
                        </div>
                        <div className="relative">
                            <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition pr-10" placeholder="Confirmar Senha" />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center" aria-label="Toggle password visibility">{showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
                        </div>

                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-blue-500 transition-all duration-300 ease-in-out">Finalizar Cadastro</button>
                    </form>
                </>
            );
        }

        // Default login view
        return (
            <>
                <h2 className="text-2xl font-bold text-dark-text text-center mb-4">Acessar Plataforma</h2>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <input name="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="Seu e-mail" />
                    <div className="relative">
                        <input name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 border border-dark-border rounded-lg bg-dark-card text-dark-text focus:ring-2 focus:ring-blue-500 focus:outline-none transition pr-10" placeholder="Sua senha" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center" aria-label="Toggle password visibility">{showPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
                    </div>
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    {success && <p className="text-sm text-green-500 text-center">{success}</p>}
                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-blue-500 transition-all duration-300 ease-in-out">Entrar</button>
                </form>
                <div className="mt-6 text-center">
                    <button onClick={() => handleViewChange('register-choice')} className="font-medium text-sm text-cyan-400 hover:underline">Não tem uma conta? Cadastre-se aqui</button>
                </div>
            </>
        )
    }

    if (isLoggingIn || isRegistering) {
        return (
            <div className="bg-dark-background text-dark-text min-h-screen font-sans flex flex-col justify-center items-center p-4">
                <div className="loader-container">
                    <div className="loader triangle"><svg viewBox="0 0 86 80"><polygon points="43 8 79 72 7 72"></polygon></svg></div>
                    <div className="loadingtext"><p>Loading</p></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-dark-background text-dark-text min-h-screen font-sans flex flex-col justify-center items-center p-4 transition-colors duration-300 relative">
            <ApiMessageModal
                message={apiMessage}
                onClose={() => {
                    if (apiMessage?.type === 'success') {
                        handleViewChange('login');
                    }
                    setApiMessage(null);
                }}
            />
            <div className="text-center mb-8">
                 <img src="https://aisfizoyfpcisykarrnt.supabase.co/storage/v1/object/public/imagens/LOGO%20TRIAD3%20.png" alt="Logo Triad3" className="login-logo" />
                 <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Score Inteligente</span>
                    <span className="text-dark-text"> Triad3</span>
                </h1>
                <p className="text-lg text-gray-400 mt-2">Execute um raio-x de áreas vitais de sua empresa.</p>
            </div>

            <div className="w-full max-w-md bg-dark-card p-6 sm:p-8 rounded-xl shadow-2xl border border-dark-border">
                {renderFormContent()}
            </div>
             <div className="absolute bottom-4 text-center text-xs text-gray-400">
                <p>Powered by: <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Triad3 Inteligência Digital</span></p>
            </div>
        </div>
    );
};

export default LoginPage;
