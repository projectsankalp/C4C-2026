import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to unified Namaste Auth panel in signup mode
    navigate('/login?signup=true');
  }, [navigate]);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--secondary-cream)'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '3px solid var(--cream-border)',
        borderTopColor: 'var(--primary-terracotta)',
        animation: 'spin 1s linear infinite'
      }} />
    </div>
  );
};

export default Signup;
