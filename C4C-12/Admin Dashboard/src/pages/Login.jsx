/**
 * GraamSehat Admin Dashboard - Login Page
 * Location: /src/pages/Login.jsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { loginAdmin } from '../firebase/auth';
import AlertBanner from '../components/AlertBanner';
import { Shield, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const { currentAdmin, setCurrentAdmin } = useAdmin();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (currentAdmin) {
      navigate('/overview');
    }
  }, [currentAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoadingSubmit(true);
      const adminData = await loginAdmin(email.trim(), password.trim());
      if (setCurrentAdmin) {
        setCurrentAdmin(adminData);
      }
      navigate('/overview');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to authenticate. Check credentials.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background-overlay" />
      
      <div className="glass-card login-card">
        <div className="login-header">
          <div className="login-logo-circle">
            <Shield size={32} className="login-logo" />
          </div>
          <h1>GraamSehat</h1>
          <p className="login-subtitle">System Admin & District Officer Portal</p>
        </div>

        {errorMsg && <AlertBanner message={errorMsg} type="error" />}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email Address</label>
            <div className="login-input-wrapper">
              <Mail size={16} className="login-field-icon" />
              <input
                id="email-input"
                type="email"
                placeholder="admin@graamsehat.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input login-input"
                required
                disabled={loadingSubmit}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Password</label>
            <div className="login-input-wrapper">
              <Lock size={16} className="login-field-icon" />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input login-input"
                required
                disabled={loadingSubmit}
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary login-submit-btn" 
            disabled={loadingSubmit}
          >
            {loadingSubmit ? 'Signing In...' : 'Access Dashboard'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>This is a secure medical database. Unauthorized access is strictly prohibited and logged.</p>
        </div>
      </div>
    </div>
  );
}
