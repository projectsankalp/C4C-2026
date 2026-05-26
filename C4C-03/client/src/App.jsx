import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Login from './pages/Login';

// ASHA pages
import AshaHome from './pages/asha/AshaHome';
import NewScreening from './pages/asha/NewScreening';
import RiskResult from './pages/asha/RiskResult';
import MyPatients from './pages/asha/MyPatients';
import PatientHistory from './pages/asha/PatientHistory';
import FollowUps from './pages/asha/FollowUps';

// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import AlertQueue from './pages/doctor/AlertQueue';
import PatientDetail from './pages/doctor/PatientDetail';
import PatientSearch from './pages/doctor/PatientSearch';
import VillageSummary from './pages/doctor/VillageSummary';
import ReferralManager from './pages/doctor/ReferralManager';

// Hospital pages
import HospitalHome from './pages/hospital/HospitalHome';
import ReferralDetail from './pages/hospital/ReferralDetail';

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* ASHA routes */}
            <Route path="/asha" element={<ProtectedRoute role="asha"><AshaHome /></ProtectedRoute>} />
            <Route path="/asha/new-screening" element={<ProtectedRoute role="asha"><NewScreening /></ProtectedRoute>} />
            <Route path="/asha/result" element={<ProtectedRoute role="asha"><RiskResult /></ProtectedRoute>} />
            <Route path="/asha/patients" element={<ProtectedRoute role="asha"><MyPatients /></ProtectedRoute>} />
            <Route path="/asha/patients/:id" element={<ProtectedRoute role="asha"><PatientHistory /></ProtectedRoute>} />
            <Route path="/asha/followups" element={<ProtectedRoute role="asha"><FollowUps /></ProtectedRoute>} />

            {/* Doctor routes */}
            <Route path="/doctor/dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/alerts" element={<ProtectedRoute role="doctor"><AlertQueue /></ProtectedRoute>} />
            <Route path="/doctor/patients/:id" element={<ProtectedRoute role="doctor"><PatientDetail /></ProtectedRoute>} />
            <Route path="/doctor/search" element={<ProtectedRoute role="doctor"><PatientSearch /></ProtectedRoute>} />
            <Route path="/doctor/villages" element={<ProtectedRoute role="doctor"><VillageSummary /></ProtectedRoute>} />
            <Route path="/doctor/referrals" element={<ProtectedRoute role="doctor"><ReferralManager /></ProtectedRoute>} />

            {/* Hospital routes */}
            <Route path="/hospital" element={<ProtectedRoute role="hospital"><HospitalHome /></ProtectedRoute>} />
            <Route path="/hospital/referrals/:id" element={<ProtectedRoute role="hospital"><ReferralDetail /></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
