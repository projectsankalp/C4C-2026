import { Link } from 'react-router-dom';
import { t } from '../../services/i18n';

const GovFooter = () => {
  return (
    <footer style={{ backgroundColor: '#1A1C1E', color: 'white', borderTop: '4px solid var(--color-primary)' }}>
      <div className="container" style={{ padding: '48px 16px 24px 16px' }}>
        <div className="flex justify-between" style={{ flexWrap: 'wrap', gap: '32px' }}>
          
          <div style={{ flex: '1', minWidth: '250px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--color-primary)' }}>
              🍃 {t('brand')}
            </h3>
            <p style={{ fontSize: '14px', color: '#D1D5DB', lineHeight: '1.6' }}>
              {t('footerAbout')}
            </p>
          </div>

          <div style={{ flex: '1', minWidth: '200px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--color-primary)' }}>
              {t('quickLinks')}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px' }}>
              <li style={{ marginBottom: '8px' }}><Link to="/about" style={{ color: '#D1D5DB' }}>{t('aboutPlatform')}</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/guidelines" style={{ color: '#D1D5DB' }}>{t('monitoringGuide')}</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/contact" style={{ color: '#D1D5DB' }}>{t('contact')}</Link></li>
            </ul>
          </div>

          <div style={{ flex: '1', minWidth: '200px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--color-primary)' }}>
              {t('quickLinks')}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px' }}>
              <li style={{ marginBottom: '8px' }}><Link to="/privacy" style={{ color: '#D1D5DB' }}>{t('privacyPolicy')}</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/terms" style={{ color: '#D1D5DB' }}>{t('termsOfUse')}</Link></li>
            </ul>
          </div>

          <div style={{ flex: '1', minWidth: '200px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--color-primary)' }}>
              {t('visitorStats')}
            </h3>
            <div style={{ backgroundColor: '#2D3748', padding: '12px', borderRadius: '4px', display: 'inline-block' }}>
              <span style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '4px' }}>
                1,452,089
              </span>
            </div>
          </div>

        </div>

        <div style={{ borderTop: '1px solid #374151', marginTop: '32px', paddingTop: '24px', textAlign: 'center', fontSize: '12px', color: '#9CA3AF' }}>
          <p>{t('footerCopyright')}</p>
        </div>

      </div>
    </footer>
  );
};

export default GovFooter;
