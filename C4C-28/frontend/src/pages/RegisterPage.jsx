import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import GovHeader from '../components/layout/GovHeader';
import GovFooter from '../components/layout/GovFooter';
import { MapPin, Crosshair } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
];

/* ── Leaflet Map Picker Component ──────────────────────── */
const LocationPicker = ({ lat, lng, onChange }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Dynamically import leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet from CDN to avoid bundling issues
    const loadLeaflet = () => {
      return new Promise((resolve) => {
        if (window.L) { resolve(window.L); return; }
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve(window.L);
        document.head.appendChild(script);
      });
    };

    loadLeaflet().then((L) => {
      if (mapInstanceRef.current) return; // already initialized
      const map = L.map(mapRef.current).setView([lat || 19.0, lng || 73.0], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      const marker = L.marker([lat || 19.0, lng || 73.0], { draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChange(pos.lat.toFixed(6), pos.lng.toFixed(6));
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        onChange(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
      });

      mapInstanceRef.current = map;

      // If we already have coords, center on them
      if (lat && lng) {
        map.setView([lat, lng], 14);
        marker.setLatLng([lat, lng]);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // eslint-disable-line

  // Update marker when lat/lng change externally (e.g. auto-detect)
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && lat && lng) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng], 14);
    }
  }, [lat, lng]);

  return <div ref={mapRef} style={{ width: '100%', height: '220px', borderRadius: '8px', border: '1px solid #E5E7EB' }} />;
};

/* ── Register Page ──────────────────────────────────────── */
const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '', mobile_number: '', email: '', password: '', confirm_password: '',
    village_name: '', area_name: '', language_code: 'en', alert_mode: 'sms', role: 'user',
    latitude: null, longitude: null,
  });
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [locating, setLocating]   = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleMapChange = (lat, lng) => {
    setForm(f => ({ ...f, latitude: parseFloat(lat), longitude: parseFloat(lng) }));
  };

  const autoDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6)),
        }));
        setLocating(false);
      },
      (err) => {
        setError('Could not detect location. Please pick on the map.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm_password) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!form.latitude || !form.longitude) { setError('Please select your location on the map.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        full_name: form.full_name, mobile_number: form.mobile_number,
        email: form.email || undefined, password: form.password,
        village_name: form.village_name, area_name: form.area_name,
        latitude: form.latitude, longitude: form.longitude,
        language_code: form.language_code, alert_mode: form.alert_mode, role: form.role,
      });
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, name, type = 'text', placeholder = '', required = false) => (
    <div style={{ marginBottom: '18px' }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '5px', color: 'var(--color-secondary)' }}>
        {label}{required && ' *'}
      </label>
      <input type={type} name={name} value={form[name]} onChange={handleChange} placeholder={placeholder}
        required={required}
        style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-alt)' }}>
      <GovHeader />
      <main style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '40px', width: '100%', maxWidth: '620px' }}>
          
          {/* Header strip */}
          <div style={{ background: 'var(--color-secondary)', borderRadius: '6px 6px 0 0', margin: '-40px -40px 28px', padding: '20px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px' }}>🌱</div>
            <h2 style={{ color: '#fff', margin: '8px 0 4px', fontSize: '20px', fontWeight: 700 }}>Citizen Registration</h2>
            <p style={{ color: '#93C5FD', fontSize: '13px', margin: 0 }}>Join Swachh Vayu Monitoring Platform</p>
          </div>

          {error && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', color: '#DC2626', fontSize: '13px' }}>⚠️ {error}</div>}
          {success && <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', color: '#15803D', fontSize: '13px' }}>✅ {success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Personal Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>{field('Full Name', 'full_name', 'text', 'Your full name', true)}</div>
              {field('Mobile Number', 'mobile_number', 'tel', '10-digit number', true)}
              {field('Email', 'email', 'email', 'example@email.com')}
              {field('Password', 'password', 'password', 'Min 8 characters', true)}
              {field('Confirm Password', 'confirm_password', 'password', 'Re-enter password', true)}
              {field('Village / Gram Panchayat', 'village_name', 'text', 'e.g. Khedgaon', true)}
              {field('Area / Ward', 'area_name', 'text', 'e.g. North Zone')}
            </div>

            {/* Location Picker */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={15} /> Your Location *
                </label>
                <button type="button" onClick={autoDetectLocation} disabled={locating}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', fontSize: '12px', fontWeight: 600,
                    border: '1px solid var(--color-primary)', borderRadius: '6px',
                    background: locating ? '#F3F4F6' : '#FFF7ED',
                    color: 'var(--color-primary)', cursor: locating ? 'not-allowed' : 'pointer',
                  }}>
                  <Crosshair size={13} />
                  {locating ? 'Detecting...' : 'Auto-detect'}
                </button>
              </div>

              <LocationPicker
                lat={form.latitude}
                lng={form.longitude}
                onChange={handleMapChange}
              />

              {form.latitude && form.longitude && (
                <div style={{ marginTop: '6px', display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
                  <span>📍 Lat: <strong>{form.latitude}</strong></span>
                  <span>Lng: <strong>{form.longitude}</strong></span>
                </div>
              )}
              {!form.latitude && (
                <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#9CA3AF' }}>
                  Click on the map or use Auto-detect to set your location
                </p>
              )}
            </div>

            {/* Preferences */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '5px', color: 'var(--color-secondary)' }}>Language</label>
                <select name="language_code" value={form.language_code} onChange={handleChange}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '14px' }}>
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '5px', color: 'var(--color-secondary)' }}>Alert Mode</label>
                <select name="alert_mode" value={form.alert_mode} onChange={handleChange}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '14px' }}>
                  <option value="sms">SMS Only</option>
                  <option value="voice">Voice Only</option>
                  <option value="both">SMS + Voice</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', background: loading ? '#9CA3AF' : 'var(--color-primary)',
              color: '#fff', border: 'none', borderRadius: '6px', fontSize: '15px',
              fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px'
            }}>
              {loading ? 'Registering...' : 'Create Account →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6B7280' }}>
            Already registered? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </main>
      <GovFooter />
    </div>
  );
};

export default RegisterPage;
