/**
 * src/App.jsx
 * Root application component.
 * Manages the state-based router, navigation flow, and wraps the tree
 * in Language and Patient contexts.
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { PatientProvider } from './context/PatientContext';
import usePatient from './hooks/usePatient';
import useLanguage from './hooks/useLanguage';
import { checkPatientUID } from './firebase/auth';

// Pages
import Welcome from './pages/Welcome';
import UIDEntry from './pages/UIDEntry';
import OTPVerify from './pages/OTPVerify';
import NotRegistered from './pages/NotRegistered';
import Dashboard from './pages/Dashboard';
import HealthHistory from './pages/HealthHistory';
import Presentation from './pages/Presentation';
import Appointment from './pages/Appointment';
import MedicineReminder from './pages/MedicineReminder';
import FamilyAccounts from './pages/FamilyAccounts';
import AddFamilyMember from './pages/AddFamilyMember';
import HealthEducation from './pages/HealthEducation';
import ArticleDetail from './pages/ArticleDetail';
import ShareReport from './pages/ShareReport';
import Emergency from './pages/Emergency';
import Settings from './pages/Settings';

// Components
import BottomNav from './components/BottomNav';
import LoadingScreen from './components/LoadingScreen';

function MainAppShell() {
  const { activePatient, screenings, medicines, streak, familyMembers, loading, login, logout, switchProfile } = usePatient();
  const { t } = useLanguage();

  // Pages state: 'welcome', 'login', 'otp', 'notRegistered', 'dashboard', etc.
  const [page, setPage] = useState('welcome');
  
  // Auxiliary states for parameters passed to sub-pages
  const [paramPatient, setParamPatient] = useState(null);
  const [paramUid, setParamUid] = useState('');
  const [activeArticle, setActiveArticle] = useState(null);

  // Sync route based on active patient session
  useEffect(() => {
    if (!loading) {
      if (activePatient) {
        // Prevent resetting tab if already on a logged-in page
        const coreTabs = ['dashboard', 'history', 'family', 'education', 'settings', 'presentation', 'appointment', 'medicine', 'addFamily', 'articleDetail', 'shareReport', 'emergency'];
        if (!coreTabs.includes(page)) {
          setPage('dashboard');
        }
      } else {
        setPage('welcome');
      }
    }
  }, [activePatient, loading]);

  if (loading) {
    return <LoadingScreen message="GraamSehat is loading..." />;
  }

  // ═══════════════════════════════════
  // LOGIN ROUTING (Logged out)
  // ═══════════════════════════════════
  const checkPatientDetails = async (uid) => {
    setPage('loading-record');
    try {
      const result = await checkPatientUID(uid);
      if (result) {
        setParamPatient(result);
        setPage('otp');
      } else {
        setParamUid(uid);
        setPage('notRegistered');
      }
    } catch (err) {
      console.error(err);
      setParamUid(uid);
      setPage('notRegistered');
    }
  };

  const handleOTPVerified = async (verifiedPatient) => {
    await login(verifiedPatient);
    setPage('dashboard');
  };

  // ═══════════════════════════════════
  // MAIN ROUTE RESOLVER
  // ═══════════════════════════════════
  const renderPage = () => {
    // If loading patient record
    if (page === 'loading-record') {
      return <LoadingScreen message={t('login.checkingRecord')} />;
    }

    switch (page) {
      // Out of session views
      case 'welcome':
        return <Welcome onGetStarted={() => setPage('login')} />;
      case 'login':
        return <UIDEntry onUIDSubmit={checkPatientDetails} onBack={() => setPage('welcome')} />;
      case 'otp':
        return (
          <OTPVerify
            patient={paramPatient}
            onVerifySuccess={handleOTPVerified}
            onBack={() => setPage('login')}
          />
        );
      case 'notRegistered':
        return <NotRegistered unregisteredUID={paramUid} onBack={() => setPage('login')} />;

      // In session views
      case 'dashboard':
        return (
          <Dashboard
            patient={activePatient}
            screenings={screenings}
            medicines={medicines}
            streak={streak}
            onNavigate={setPage}
          />
        );
      case 'history':
        return <HealthHistory screenings={screenings} />;
      case 'presentation':
        return <Presentation patient={activePatient} onBack={() => setPage('dashboard')} />;
      case 'appointment':
        return <Appointment patient={activePatient} onBack={() => setPage('dashboard')} />;
      case 'medicine':
        return (
          <MedicineReminder
            patient={activePatient}
            medicines={medicines}
            streak={streak}
            onBack={() => setPage('dashboard')}
          />
        );
      case 'family':
        return (
          <FamilyAccounts
            patient={activePatient}
            familyMembers={familyMembers}
            onSwitch={(uid) => switchProfile(uid)}
            onNavigate={setPage}
            onBack={() => setPage('dashboard')}
          />
        );
      case 'addFamily':
        return <AddFamilyMember onBack={() => setPage('family')} />;
      case 'education':
        return (
          <HealthEducation
            onReadArticle={(art) => {
              setActiveArticle(art);
              setPage('articleDetail');
            }}
          />
        );
      case 'articleDetail':
        return (
          <ArticleDetail
            article={activeArticle}
            onArticleSwitch={setActiveArticle}
            onBack={() => setPage('education')}
          />
        );
      case 'shareReport':
        return <ShareReport patient={activePatient} medicines={medicines} onBack={() => setPage('dashboard')} />;
      case 'emergency':
        return <Emergency patient={activePatient} onBack={() => setPage('dashboard')} />;
      case 'settings':
        return (
          <Settings
            patient={activePatient}
            familyMembers={familyMembers}
            onClearData={async () => {
              await logout();
              setPage('welcome');
            }}
            onBack={() => setPage('dashboard')}
          />
        );

      default:
        return <Welcome onGetStarted={() => setPage('login')} />;
    }
  };

  const isTabActive = ['dashboard', 'history', 'family', 'education', 'settings'].includes(page);

  return (
    <div className="app-container">
      <main className="app-main-viewport scrollbar-none">
        {renderPage()}
      </main>
      
      {/* Persistent Bottom navigation for tab sheets only */}
      {activePatient && isTabActive && (
        <BottomNav currentPage={page} onPageChange={setPage} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <PatientProvider>
        <MainAppShell />
      </PatientProvider>
    </LanguageProvider>
  );
}
