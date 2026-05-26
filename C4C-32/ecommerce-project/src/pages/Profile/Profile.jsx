import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { formatPrice } from '../../utils/helpers';
import { FiUser, FiMail, FiPhone, FiTag, FiEdit2, FiLogOut, FiHeart, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const { products } = useProducts();
  const { t } = useLanguage();

  // Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

  if (!isLoggedIn) {
    return (
      <div className="container text-center" style={{ padding: '80px 0', animation: 'fadeIn 0.6s ease-out' }}>
        <h2 className="serif-title" style={{ fontSize: '32px', marginBottom: '16px' }}>{t('login.title')}</h2>
        <p style={{ color: 'var(--warm-charcoal-muted)', marginBottom: '24px' }}>{t('login.sub')}</p>
        <Link to="/login" className="btn-primary">{t('login.signInRegister')}</Link>
      </div>
    );
  }

  const handleProfileSave = (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim() || !editPhone.trim()) {
      toast.error("Please fill in all profile fields.");
      return;
    }

    const updatedUser = {
      ...user,
      name: editName,
      email: editEmail,
      phone: editPhone
    };

    // Update in Context & Storage
    localStorage.setItem('karighar_user', JSON.stringify(updatedUser));
    toast.success("Profile details updated successfully!");
    setIsEditing(false);
    
    // Refresh page state (simulate reloading local states)
    window.location.reload();
  };

  // Mock Wishlist display (Get 2 pottery products for demonstration)
  const wishlistItems = products.slice(0, 2);

  return (
    <div className="container" style={{ padding: '60px 24px', animation: 'fadeIn 0.6s ease-out' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '50px', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN: VISUAL ACCOUNT BLOCK */}
        <div style={{
          background: 'var(--cream-card)',
          border: '1px solid var(--cream-border)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '40px 30px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <img 
            src={user.avatar} 
            alt={user.name} 
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--gold-accent)',
              boxShadow: 'var(--shadow-premium)'
            }}
          />

          <div>
            <h2 className="serif-title" style={{ fontSize: '24px' }}>{user.name}</h2>
            <span className="badge-handmade" style={{ marginTop: '8px' }}>{user.role} {t('profile.partner')}</span>
          </div>

          <div style={{
            width: '100%',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontSize: '14px',
            borderTop: '1px solid var(--cream-border)',
            paddingTop: '20px',
            marginTop: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--warm-charcoal)' }}>
              <FiMail style={{ color: 'var(--primary-terracotta)' }} /> <span>{user.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--warm-charcoal)' }}>
              <FiPhone style={{ color: 'var(--primary-terracotta)' }} /> <span>{user.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--warm-charcoal)' }}>
              <FiTag style={{ color: 'var(--primary-terracotta)' }} /> <span>{t('profile.collectorId')}: {user.id}</span>
            </div>
          </div>

          <button 
            onClick={() => { logout(); toast.success("Successfully logged out."); navigate('/'); }} 
            className="btn-secondary" 
            style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--cream-border)', color: 'var(--warm-charcoal-muted)' }}
          >
            <FiLogOut /> {t('nav.signOut')}
          </button>
        </div>

        {/* RIGHT COLUMN: EDIT FORM & COLLECTOR LISTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* PROFILE DETAIL PANEL */}
          <div style={{
            background: 'var(--white-pure)',
            border: '1px solid var(--cream-border)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '40px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 className="serif-title" style={{ fontSize: '22px' }}>{t('profile.accountSettings')}</h3>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  <FiEdit2 /> {t('profile.editProfile')}
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="auth-input-group">
                    <label>{t('login.fullName')}</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="auth-input-field"
                      required
                    />
                  </div>
                  <div className="auth-input-group">
                    <label>{t('login.phoneNumber')}</label>
                    <input 
                      type="tel" 
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="auth-input-field"
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>{t('login.emailAddress')}</label>
                  <input 
                    type="email" 
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="auth-input-field"
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>{t('profile.saveChanges')}</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary" style={{ padding: '10px 24px' }}>{t('profile.cancel')}</button>
                </div>
              </form>
            ) : (
              <div style={{ fontSize: '14px', color: 'var(--warm-charcoal-muted)' }}>
                <p style={{ marginBottom: '8px' }}>{t('profile.welcomeProfile')}</p>
                <p>{t('profile.statusLabel')} <span style={{ color: 'var(--primary-terracotta)', fontWeight: '700' }}>{t('profile.activeVerification')}</span></p>
              </div>
            )}
          </div>

          {/* WISHLIST SECTION */}
          <div style={{
            background: 'var(--white-pure)',
            border: '1px solid var(--cream-border)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '40px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h3 className="serif-title" style={{ fontSize: '22px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiHeart style={{ fill: 'var(--primary-terracotta)', color: 'var(--primary-terracotta)' }} />
              {t('profile.wishlistTitle')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {wishlistItems.map(prod => (
                <Link to={`/product/${prod.id}`} key={prod.id} style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px',
                  border: '1px solid var(--cream-border)',
                  borderRadius: 'var(--border-radius-md)',
                  background: 'var(--cream-card)',
                  transition: 'var(--transition-smooth)'
                }} className="product-card-container">
                  <img 
                    src={prod.images[0]} 
                    alt={prod.title} 
                    style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--warm-charcoal)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                      {prod.title}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--primary-terracotta)', fontWeight: '700', marginTop: '2px' }}>
                      {formatPrice(prod.price)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;
