import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/layout/Layout';
import ErrorBoundary from '../components/shared/ErrorBoundary';

import DoctorDashboard from '../pages/DoctorDashboard';
import AdminPanel from '../pages/AdminPanel';

export default function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Doctor Routes */}
        <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DoctorDashboard />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<Layout />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
