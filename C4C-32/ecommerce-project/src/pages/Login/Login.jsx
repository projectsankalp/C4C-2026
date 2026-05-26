import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { FiCamera } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import '../../styles/auth.css';
import { useLanguage } from '../../context/LanguageContext';

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isLoggedIn, isLoading, login } = useAuth();
  const { t } = useLanguage();

  // Mode
  const queryParams   = new URLSearchParams(location.search);
  const initialSignup = queryParams.get('signup') === 'true';
  const [isSignup, setIsSignup] = useState(initialSignup);
  const [role, setRole]         = useState('Customer'); // 'Customer' | 'Seller'

  // Form fields
  const [fullName,  setFullName]  = useState('');
  const [sellerName, setSellerName] = useState(''); // name-based login for sellers
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [avatar,    setAvatar]    = useState(null); // base64 preview only
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isLoggedIn) navigate('/');
  }, [isLoggedIn, isLoading, navigate]);

  // Image upload preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2000000) {
      toast.error('File is too large. Please select an image under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
      toast.success('Profile photo uploaded!');
    };
    reader.readAsDataURL(file);
  };

  const triggerImagePicker = () => fileInputRef.current?.click();

  // ── FORM SUBMIT ─────────────────────────────────────────────────────────────
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    // Validation
    if (isSignup && !fullName.trim()) {
      toast.error('Please enter your full name.'); return;
    }
    // For seller login mode, use name-based credentials (same as seller page)
    const isSellerLogin = !isSignup && role === 'Seller';
    if (isSellerLogin && !sellerName.trim()) {
      toast.error('Please enter your full name.'); return;
    }
    if (!isSellerLogin && (!email.trim() || !email.includes('@'))) {
      toast.error('Please enter a valid email address.'); return;
    }
    if (!password.trim() || password.length < 4) {
      toast.error('Password must be at least 4 characters.'); return;
    }
    if (isSignup && (!phone.trim() || phone.length < 10)) {
      toast.error('Please enter a valid phone number (min 10 digits).'); return;
    }

    setSubmitting(true);

    try {
      if (isSignup) {
        // ── SIGNUP ───────────────────────────────────────────────────────────
        const payload = {
          email,
          password: password.length < 6 ? password.padEnd(6, '0') : password,
          full_name:    fullName,
          role:         role === 'Seller' ? 'seller' : 'buyer',
          phone_number: phone || undefined,
        };
        const data = await authService.signup(payload);
        login(data.user, data.session?.access_token);
        toast.success('Account created! Welcome to KariGhar.');
        navigate(role === 'Seller' ? '/seller/dashboard' : '/');

      } else if (isSellerLogin) {
        // ── SELLER LOGIN (name-based, same as seller page) ──────────────────
        const name = sellerName.trim();
        const generatedEmail = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@karigar.com`;
        const finalPassword = password.length < 6 ? password.padEnd(6, '0') : password;

        const data = await authService.login({ email: generatedEmail, password: finalPassword });

        if (data.user.role !== 'seller') {
          toast.error('This account is not a seller account.');
          return;
        }

        login(data.user, data.session?.access_token);
        toast.success(`Welcome back, ${data.user.full_name || name}!`);
        navigate('/seller/dashboard');

      } else {
        // ── CUSTOMER LOGIN ───────────────────────────────────────────────────
        const data = await authService.login({ email, password });
        login(data.user, data.session?.access_token);
        toast.success(`Welcome back, ${data.user.full_name || data.user.email}!`);
        navigate(data.user.role === 'seller' ? '/seller/dashboard' : '/');
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-split-card">

        {/* LEFT SIDE IMAGERY */}
        <div className="auth-visual-panel">
          <div>
            <h2 className="auth-visual-title">KariGhar</h2>
            <p className="auth-visual-quote">
              Step into a world where every stitch and stroke tells a story of ancient hands and modern hearts.
            </p>
          </div>

          <img
            src="/images/indigo-silk-stole.png"
            alt="Weaving hands threads"
            className="auth-visual-image"
          />

          <div style={{ fontSize: '11px', opacity: 0.7 }}>
            © 2026 KariGhar. Preserving Craft, Honoring Hands.
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="auth-form-panel">
          <form onSubmit={handleSubmitForm}>
            <h2 className="auth-welcome-title">
              {isSignup ? t('login.createAccount') : t('login.welcomeBack')}
            </h2>
            <p className="auth-welcome-sub">
              {isSignup ? t('login.joinMarketplace') : t('login.welcomeBackSub')}
            </p>

            {/* Customer / Seller Toggle */}
            <div className="auth-role-toggle-pill">
              <button type="button" onClick={() => setRole('Customer')}
                className={`auth-role-btn ${role === 'Customer' ? 'active' : 'inactive'}`}>
                {t('login.customer')}
              </button>
              <button type="button" onClick={() => setRole('Seller')}
                className={`auth-role-btn ${role === 'Seller' ? 'active' : 'inactive'}`}>
                {t('login.sellerArtisan')}
              </button>
            </div>

            {/* Photo Upload (Signup only) */}
            {isSignup && (
              <div className="auth-photo-uploader" onClick={triggerImagePicker}>
                <div className="photo-upload-circle">
                  {avatar ? <img src={avatar} alt="Avatar preview" /> : <FiCamera size={26} />}
                </div>
                <span className="photo-upload-text">
                  {avatar ? t('login.changeProfile') : t('login.uploadProfile')}
                </span>
                <input type="file" ref={fileInputRef} onChange={handleImageChange}
                  accept="image/*" style={{ display: 'none' }} />
              </div>
            )}

            {/* Full Name (Signup only) */}
            {isSignup && (
              <div className="auth-input-group">
                <label>{t('login.fullName')}</label>
                <input type="text" placeholder={t('login.enterName')} value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="auth-input-field" required />
              </div>
            )}

            {/* Email or Seller Name — seller login uses name-based credentials */}
            {!isSignup && role === 'Seller' ? (
              <div className="auth-input-group">
                <label>{t('login.fullName')}</label>
                <input type="text" placeholder="e.g. Aparna Devi" value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="auth-input-field" required />
              </div>
            ) : (
              <div className="auth-input-group">
                <label>{t('login.emailAddress')}</label>
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input-field" required />
              </div>
            )}

            {/* Password */}
            <div className="auth-input-group">
              <label>{t('login.password')}</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input-field" required />
            </div>

            {/* Phone (Signup only) */}
            {isSignup && (
              <div className="auth-input-group">
                <label>{t('login.phoneNumber')}</label>
                <input type="tel" placeholder="e.g. 9876543210" value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="auth-input-field" required />
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="btn-primary" disabled={submitting}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '10px', opacity: submitting ? 0.7 : 1 }}>
              {submitting
                ? (isSignup ? t('login.creatingAccount') : t('login.signingIn'))
                : (isSignup ? t('login.createAccount') : t('login.logIn'))}
            </button>

            <div className="auth-divider-line">{t('login.orConnect')}</div>

            {/* Google (UI only — no Supabase OAuth yet) */}
            <button type="button" className="btn-google-signon"
              onClick={() => toast('Google sign-in coming soon!', { icon: '🚀' })}>
              <FcGoogle size={20} style={{ marginRight: '10px' }} />
              {t('login.continueGoogle')}
            </button>

            {/* Toggle Mode */}
            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--warm-charcoal-muted)' }}>
              {isSignup ? (
                <span>{t('login.alreadyHaveAccount')}{' '}
                  <button type="button" onClick={() => setIsSignup(false)}
                    style={{ color: 'var(--primary-terracotta)', fontWeight: '700' }}>{t('login.logIn')}</button>
                </span>
              ) : (
                <span>{t('login.dontHaveAccount')}{' '}
                  <button type="button" onClick={() => setIsSignup(true)}
                    style={{ color: 'var(--primary-terracotta)', fontWeight: '700' }}>{t('login.signUp')}</button>
                </span>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;
