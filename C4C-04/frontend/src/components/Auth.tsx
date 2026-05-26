import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface AuthProps {
  onLoginSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Form state
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | 'other' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (isLogin) {
      // Login Logic
      const { error } = await supabase.auth.signInWithPassword({
        email: `${phone}@mindmitra.local`,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        onLoginSuccess();
      }
    } else {
      // Signup Logic
      const { error } = await supabase.auth.signUp({
        email: `${phone}@mindmitra.local`,
        password,
        options: {
          data: {
            full_name: fullName,
            gender: gender,
          }
        }
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Account created successfully! You can now log in.');
        // Optionally switch to login mode
        // setIsLogin(true);
      }
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '0.8rem 1rem',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    background: 'rgba(255, 255, 255, 0.5)',
    color: '#5C4B43',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.3s ease',
    marginBottom: '1rem',
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundImage: 'url("/auth-bg.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      
      <style>{`
        .auth-input::placeholder { color: #B89E8A; }
        .auth-input:focus { background: rgba(255,255,255,0.8) !important; border-color: #EBC8B2 !important; box-shadow: 0 0 0 3px rgba(235, 200, 178, 0.3) !important; }
        .gender-pill { flex: 1; padding: 0.6rem; border-radius: 99px; border: 1px solid rgba(255,255,255,0.8); background: rgba(255,255,255,0.5); color: #B89E8A; cursor: pointer; transition: all 0.3s; font-size: 0.85rem; }
        .gender-pill.active { background: #EBC8B2; color: white; border-color: #EBC8B2; box-shadow: 0 4px 10px rgba(235, 200, 178, 0.4); }
        .auth-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(235, 200, 178, 0.6) !important; }
        .auth-btn:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>

      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        boxShadow: '0 10px 40px rgba(92, 75, 67, 0.1), inset 0 0 0 1px rgba(255,255,255,0.5)',
        textAlign: 'center',
        animation: 'fadeIn 0.5s ease'
      }}>
        <h2 style={{ color: '#5C4B43', fontSize: '1.75rem', marginBottom: '0.25rem', fontWeight: 600 }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ color: '#B89E8A', fontSize: '0.9rem', marginBottom: '2rem' }}>
          {isLogin ? 'Sign in to continue' : 'Join us and enjoy a stressless experience'}
        </p>

        {errorMsg && (
          <div style={{ background: 'rgba(212, 154, 137, 0.2)', color: '#D49A89', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(192, 130, 75, 0.15)', color: '#C0824B', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Full Name" 
              className="auth-input"
              style={inputStyle} 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}
          
          <input 
            type="tel" 
            placeholder="Phone Number" 
            className="auth-input"
            style={inputStyle} 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="auth-input"
              style={inputStyle} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                transformOrigin: 'center',
                marginTop: '-0.5rem',
                background: 'none',
                border: 'none',
                color: '#B89E8A',
                cursor: 'pointer'
              }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#8C7C6D', fontSize: '0.85rem', marginBottom: '0.5rem', marginLeft: '0.25rem' }}>Gender</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className={`gender-pill ${gender === 'female' ? 'active' : ''}`} onClick={() => setGender('female')}>Female</button>
                <button type="button" className={`gender-pill ${gender === 'male' ? 'active' : ''}`} onClick={() => setGender('male')}>Male</button>
                <button type="button" className={`gender-pill ${gender === 'other' ? 'active' : ''}`} onClick={() => setGender('other')}>Other</button>
              </div>
            </div>
          )}

          {isLogin && (
            <div style={{ textAlign: 'right', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
              <a href="#" style={{ color: '#B89E8A', fontSize: '0.85rem', textDecoration: 'none' }}>Forgot Password?</a>
            </div>
          )}

          <button 
            type="submit" 
            className="auth-btn"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #EBC8B2, #D49A89)',
              color: 'white',
              border: 'none',
              padding: '0.9rem',
              borderRadius: '14px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(235, 200, 178, 0.4)',
              transition: 'all 0.3s ease',
              marginTop: isLogin ? '0' : '0.5rem'
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#B89E8A' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{ color: '#C0824B', fontWeight: 600, cursor: 'pointer' }}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;
