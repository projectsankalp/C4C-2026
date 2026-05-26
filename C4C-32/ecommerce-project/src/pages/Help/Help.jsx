import React from 'react';
import { FiUploadCloud, FiDollarSign, FiTruck, FiShield } from 'react-icons/fi';
import '../../styles/help.css';
import { useLanguage } from '../../context/LanguageContext';

const Help = () => {
  const { t } = useLanguage();
  return (
    <div className="container" style={{ animation: 'fadeIn 0.6s ease-out' }}>
      <div className="help-page-layout" style={{ gridTemplateColumns: '1fr', maxWidth: '850px', margin: '0 auto' }}>
        
        {/* LEFT COLUMN: SUPPORT HUB DETAILS */}
        <div className="support-hub-content" style={{ width: '100%' }}>
          <div>
            <span className="hero-badge-tag">{t('help.badge')}</span>
            <h1 className="support-hub-title" style={{ marginTop: '12px' }}>{t('help.title')}</h1>
          </div>

          {/* 4 support tiles */}
          <div className="help-cards-grid">
            
            <div className="help-card">
              <div className="help-card-icon"><FiUploadCloud /></div>
              <h3 className="help-card-title">{t('help.uploadTitle')}</h3>
              <p className="help-card-desc">
                {t('help.uploadDesc')}
              </p>
            </div>

            <div className="help-card">
              <div className="help-card-icon"><FiDollarSign /></div>
              <h3 className="help-card-title">{t('help.pricingTitle')}</h3>
              <p className="help-card-desc">
                {t('help.pricingDesc')}
              </p>
            </div>

            <div className="help-card">
              <div className="help-card-icon"><FiTruck /></div>
              <h3 className="help-card-title">{t('help.shippingTitle')}</h3>
              <p className="help-card-desc">
                {t('help.shippingDesc')}
              </p>
            </div>

            <div className="help-card">
              <div className="help-card-icon"><FiShield /></div>
              <h3 className="help-card-title">{t('help.pledgeTitle')}</h3>
              <p className="help-card-desc">
                {t('help.pledgeDesc')}
              </p>
            </div>

          </div>

          {/* Elegant separator */}
          <div className="help-divider-wrap">
            <div className="help-divider-line"></div>
            <div className="help-divider-flower">❀</div>
          </div>

          {/* Community Success Story */}
          <div className="help-community-story-box">
            <img 
              src="/images/meera-devi-potter.png" 
              alt="Pottery hands story" 
              className="help-community-story-img"
            />
            <div className="help-community-story-body">
              <span className="hero-badge-tag" style={{ fontSize: '9px', padding: '4px 10px' }}>{t('help.communityStory')}</span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '8px 0', color: 'var(--primary-terracotta)' }}>
                {t('help.storyTitle')}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--warm-charcoal-muted)', lineHeight: '1.6' }}>
                {t('help.storyDesc')}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Help;
