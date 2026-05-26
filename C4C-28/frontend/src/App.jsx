import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';

// Pages
import LandingPage      from './pages/LandingPage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import UserDashboard    from './pages/UserDashboard';
import AdminDashboard   from './pages/AdminDashboard';
import VillageRankings  from './pages/VillageRankings';
import NodeInstallation from './pages/NodeInstallation';
import MapPage          from './pages/MapPage';
import AlertsPage       from './pages/AlertsPage';
import LanguagePage     from './pages/LanguagePage';
import ContentPage      from './pages/ContentPage';
import AgriAdvisory     from './pages/AgriAdvisory';
import MeasuresPage     from './pages/MeasuresPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* User Protected */}
        <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
        <Route path="/advisory"  element={<PrivateRoute><AgriAdvisory /></PrivateRoute>} />
        <Route path="/measures"  element={<PrivateRoute><MeasuresPage /></PrivateRoute>} />
        <Route path="/map"       element={<PrivateRoute><MapPage /></PrivateRoute>} />
        <Route path="/alerts"    element={<PrivateRoute><AlertsPage /></PrivateRoute>} />
        <Route path="/rankings"  element={<PrivateRoute><VillageRankings /></PrivateRoute>} />
        <Route path="/language"  element={<PrivateRoute><LanguagePage /></PrivateRoute>} />

        {/* Admin Protected */}
        <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
        <Route path="/nodes" element={<PrivateRoute adminOnly><NodeInstallation /></PrivateRoute>} />

        {/* Informational */}
        <Route path="/about"      element={<ContentPage title="About Swachh Vayu & NCAP" />} />
        <Route path="/ncap"       element={<ContentPage title="National Clean Air Programme (NCAP)" />} />
        <Route path="/services"   element={<ContentPage title="Citizen Services" />} />
        <Route path="/reports"    element={<ContentPage title="Air Quality Reports" />} />
        <Route path="/contact"    element={<ContentPage title="Contact the Ministry" />} />
        <Route path="/guidelines" element={<ContentPage title="Rural Monitoring Guidelines" />} />
        <Route path="/tenders"    element={<ContentPage title="Active Tenders" />} />
        <Route path="/privacy"    element={<ContentPage title="Privacy Policy" />} />
        <Route path="/terms"      element={<ContentPage title="Terms of Use" />} />
        <Route path="/copyright"  element={<ContentPage title="Copyright Policy" />} />
        <Route path="/hyperlink"  element={<ContentPage title="Hyperlink Policy" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
