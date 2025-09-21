

import React, { useEffect, useState, useRef } from 'react';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import QuestionnairePage from './pages/QuestionnairePage';
import DashboardPage from './pages/DashboardPage';
import GroupDashboardPage from './pages/GroupDashboardPage';
import ProfilePage from './pages/ProfilePage';
import LogsPage from './pages/LogsPage'; // Adicionado
import NeuroMapaPage from './pages/NeuroMapaPage';
import NeuroMapaQuestionnairePage from './pages/NeuroMapaQuestionnairePage';
import OralTestPage from './pages/OralTestPage';
import ManageCompaniesPage from './pages/ManageCompaniesPage';
import Header from './components/Header';
import Footer from './components/Footer';
import { useApp } from './hooks/useApp';
import { UserRole } from './types';

// O PageWrapper foi movido para fora para evitar que seja recriado a cada renderização,
// o que causava o unmount/remount de toda a árvore de componentes.
const PageWrapper: React.FC<{ children: React.ReactNode; route: string }> = ({ children, route }) => {
  if (route === '#login' || route === '') {
      return <>{children}</>;
  }
  return (
    <div className="bg-dark-background min-h-screen text-dark-text font-sans transition-colors duration-300 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  const { currentUser, submissions, neuroSubmissions, loading, categories, questions, fetchAdminQuestionnaireData, fetchSubmissions, fetchNeuroSubmissions, fetchPendingUsers } = useApp();
  const [route, setRoute] = useState(window.location.hash || '#login');
  
  // Ref para rastrear se o redirecionamento pós-login já foi executado.
  // Isso evita que o usuário seja redirecionado novamente se navegar manualmente.
  const loginRedirectPerformed = useRef(false);

  useEffect(() => {
    const handleHashChange = () => {
      const newRoute = window.location.hash || '#login';
      setRoute(newRoute);
      // Se o usuário navegar manualmente para longe da página de login,
      // consideramos o redirecionamento automático como "concluído" ou "ignorado".
      if (newRoute !== '#login' && newRoute !== '') {
        loginRedirectPerformed.current = true;
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  
  // Reseta o rastreador de redirecionamento quando o usuário muda (login/logout).
  useEffect(() => {
    if (currentUser) {
      loginRedirectPerformed.current = false;
    }
  }, [currentUser]);

  // EFEITO 1: Carrega os dados do questionário de score.
  useEffect(() => {
    if (currentUser) {
      fetchAdminQuestionnaireData();
    }
  }, [currentUser, fetchAdminQuestionnaireData]);

  // EFEITO 2: Carrega os envios dos questionários.
  useEffect(() => {
    if (currentUser) {
      if (categories.length > 0 && questions.length > 0) {
        fetchSubmissions();
      }
      fetchNeuroSubmissions(); // Busca também as submissões do NeuroMapa
    }
  }, [currentUser, categories, questions, fetchSubmissions, fetchNeuroSubmissions]);

  // EFEITO ADICIONAL: Carrega dados do admin (sino de notificação) globalmente.
  useEffect(() => {
    if (currentUser && currentUser.role === UserRole.ADMIN) {
        fetchPendingUsers();
    }
  }, [currentUser, fetchPendingUsers]);


  // EFEITO 3: Lógica de redirecionamento robusta.
  // Este efeito é acionado sempre que suas dependências mudam, incluindo quando
  // `submissions` e `neuroSubmissions` são preenchidos, resolvendo a condição de corrida.
  useEffect(() => {
    // Apenas tenta redirecionar se tivermos um usuário, estivermos na página de login e o redirecionamento ainda não tiver ocorrido.
    if (currentUser && !loginRedirectPerformed.current && (route === '#login' || route === '')) {
      
      // Lógica de redirecionamento imediato para papéis que não dependem de dados de questionário
      if (currentUser.role === UserRole.GROUP) {
        window.location.hash = '#group-dashboard';
        loginRedirectPerformed.current = true;
        return; 
      }
      
      if (currentUser.role === UserRole.ADMIN) {
        // Redireciona o admin diretamente para sua página principal (painel de scores), sem depender de outros dados.
        window.location.hash = '#dashboard';
        loginRedirectPerformed.current = true;
        return;
      }

      // Para EMPRESAS e FUNCIONÁRIOS, a lógica depende dos questionários e envios.
      // Aguarda o carregamento dos dados necessários para evitar decisões precipitadas.
      if (categories.length > 0 && questions.length > 0) {
        
        const hasAnySubmission = submissions.length > 0 || neuroSubmissions.length > 0;

        if (!hasAnySubmission) {
          // Se não tiver NENHUM envio, vai para os questionários.
          window.location.hash = '#questionnaire';
        } else {
          // Se tiver QUALQUER envio, vai para o painel.
          window.location.hash = '#dashboard';
        }
        
        // Marca o redirecionamento como concluído para esta sessão de login.
        loginRedirectPerformed.current = true;
      }
    }
  }, [currentUser, route, submissions, neuroSubmissions, categories, questions]);


  const renderContent = () => {
    if (loading) {
       return <div className="flex justify-center items-center h-screen"><p>Carregando...</p></div>;
    }
    
    // Se o usuário estiver logado, mas ainda na rota de login e o redirecionamento não foi feito,
    // exibe a tela de carregamento. O efeito de redirecionamento cuidará do resto.
    if (currentUser && (route === '#login' || route === '') && !loginRedirectPerformed.current) {
        return (
            <div className="bg-dark-background text-dark-text min-h-screen font-sans flex flex-col justify-center items-center p-4">
                <div className="loader-container">
                    <div className="loader triangle">
                        <svg viewBox="0 0 86 80">
                            <polygon points="43 8 79 72 7 72"></polygon>
                        </svg>
                    </div>
                    <div className="loadingtext"><p>Carregando</p></div>
                </div>
            </div>
        );
    }
    
    // Redireciona para o login se não estiver logado e tentar acessar rotas protegidas.
    if (!currentUser && (route !== '#login' && route !=='')) {
      window.location.hash = '#login';
      return <LoginPage />;
    }
    
    switch (route) {
      case '#admin':
        return currentUser?.role === UserRole.ADMIN ? <AdminPage /> : <DashboardPage />;
      case '#manage-companies':
        return currentUser?.role === UserRole.ADMIN ? <ManageCompaniesPage /> : <DashboardPage />;
      case '#neuromapa':
        return currentUser?.role === UserRole.ADMIN ? <NeuroMapaPage /> : <DashboardPage />;
      case '#neuromapa-questionnaire':
        return <NeuroMapaQuestionnairePage />;
      case '#prova-oral':
        return currentUser?.role === UserRole.ADMIN ? <OralTestPage /> : <DashboardPage />;
      case '#logs':
        return currentUser?.role === UserRole.ADMIN ? <LogsPage /> : <DashboardPage />;
      case '#questionnaire':
        return <QuestionnairePage />;
      case '#dashboard':
        return <DashboardPage />;
      case '#group-dashboard':
        return currentUser?.role === UserRole.GROUP ? <GroupDashboardPage /> : <LoginPage />;
      case '#profile':
        return <ProfilePage />;
      case '#login':
      case '':
      default:
        // Se já estiver logado e cair aqui por algum motivo, a lógica de redirecionamento acima irá tratar.
        // Se não estiver logado, exibe a página de login.
        return <LoginPage />;
    }
  };

  return (
    <PageWrapper route={route}>
      {renderContent()}
    </PageWrapper>
  );
};

export default App;