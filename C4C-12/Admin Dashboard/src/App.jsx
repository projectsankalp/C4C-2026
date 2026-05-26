/**
 * GraamSehat Admin Dashboard - Main Application & Router
 * Location: /src/App.jsx
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AdminProvider, useAdmin } from './context/AdminContext';

// Pages
import Login from './pages/Login';
import Overview from './pages/Overview';
import PatientMap from './pages/PatientMap';
import CityRankings from './pages/CityRankings';
import PatientSearch from './pages/PatientSearch';
import PatientDetail from './pages/PatientDetail';
import ASHAManagement from './pages/ASHAManagement';
import ASHADetail from './pages/ASHADetail';
import ApprovalQueue from './pages/ApprovalQueue';
import LostFound from './pages/LostFound';
import MedicineStock from './pages/MedicineStock';
import Reports from './pages/Reports';
import HealthContent from './pages/HealthContent';
import Settings from './pages/Settings';

// Layout Components
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ErrorBoundary from './components/ErrorBoundary';

/**
 * Route guard component to check for authenticated admin user.
 * Renders core Sidebar + TopBar layout for authorized pages.
 */
function AdminProtectedRoute() {
  const { currentAdmin, loading } = useAdmin();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setMobileSidebarOpen(prev => !prev);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'sans-serif',
        color: 'var(--text-muted)'
      }}>
        Verifying security credentials...
      </div>
    );
  }

  if (!currentAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`app-container ${mobileSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Navigation sidebar */}
      <Sidebar mobileOpen={mobileSidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Viewport content */}
      <div className="main-content">
        <TopBar toggleSidebar={toggleSidebar} />
        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AdminProvider>
        <Router>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Secure Admin Dashboard Routes */}
            <Route element={<AdminProtectedRoute />}>
              <Route path="/overview" element={<Overview />} />
              <Route path="/map" element={<PatientMap />} />
              <Route path="/rankings" element={<CityRankings />} />
              <Route path="/search" element={<PatientSearch />} />
              <Route path="/patient/:id" element={<PatientDetail />} />
              <Route path="/asha" element={<ASHAManagement />} />
              <Route path="/asha/:id" element={<ASHADetail />} />
              <Route path="/approvals" element={<ApprovalQueue />} />
              <Route path="/lost-found" element={<LostFound />} />
              <Route path="/medicine" element={<MedicineStock />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/content" element={<HealthContent />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* Fallback secure redirect */}
              <Route path="/" element={<Navigate to="/overview" replace />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </Router>
      </AdminProvider>
    </ErrorBoundary>
  );
}
