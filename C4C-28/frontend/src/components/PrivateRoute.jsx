import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from '../services/auth';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const [, forceUpdate] = useState(0);

  // Re-render when auth state changes (login/logout)
  useEffect(() => {
    const unsub = auth.subscribe(() => forceUpdate(n => n + 1));
    return unsub;
  }, []);

  if (!auth.isLoggedIn()) return <Navigate to="/login" replace />;
  if (adminOnly && auth.getRole() !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default PrivateRoute;
