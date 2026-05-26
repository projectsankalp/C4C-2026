import { BrowserRouter, Routes, Route } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { TopNavigation } from './components/TopNavigation';
import { LoginPage } from './components/LoginPage';
import { HubPage } from './components/HubPage';
import { ProfilePage } from './components/ProfilePage';
import { AdminPage } from './components/AdminPage';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <LanguageProvider>
      <AuthProvider>
        <div
          className="min-h-screen text-zinc-900"
          style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            background:
              'radial-gradient(1200px 600px at 50% -10%, #ffffff 0%, #F4F1EC 60%, #EDE8E0 100%)',
          }}
        >
          <TopNavigation />
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/hub" element={<HubPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
      </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
