import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/auth';
import GovHeader from '../components/layout/GovHeader';
import GovFooter from '../components/layout/GovFooter';
import { MapPin } from 'lucide-react';

/* ── Mini Location Map ─────────────────────────────────── */
const LocationMap = ({ lat, lng }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!lat || !lng) return;

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

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
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lng], 13);
        return;
      }
      const map = L.map(mapRef.current, {
        zoomControl: false, dragging: false, scrollWheelZoom: false,
        doubleClickZoom: false, boxZoom: false, keyboard: false,
        touchZoom: false,
      }).setView([lat, lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OSM', maxZoom: 18,
      }).addTo(map);

      L.circleMarker([lat, lng], {
        radius: 8, fillColor: '#FF6B00', color: '#fff', weight: 2, fillOpacity: 0.9,
      }).addTo(map).bindPopup('📍 Your location').openPopup();

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, [lat, lng]);

  if (!lat || !lng) return null;
  return <div ref={mapRef} style={{ width: '100%', height: '140px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #E5E7EB' }} />;
};

/* ── Login Page ────────────────────────────────────────── */
const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ mobile_number: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [userLoc, setUserLoc] = useState({ lat: null, lng: null });
  const [locName, setLocName] = useState('');

  // Auto-detect user location on page load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLoc({ lat, lng });
          // Reverse geocode via Nominatim (free)
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`)
            .then(r => r.json())
            .then(data => {
              const addr = data.address || {};
              setLocName(addr.village || addr.town || addr.city || addr.county || 'Your area');
            })
            .catch(() => {});
        },
        () => {}, // silently fail
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await auth.login(form.mobile_number, form.password);
      if (data.user?.role === 'admin' || data.user?.role === 'officer') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-alt)' }}>
      <GovHeader />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '40px', width: '100%', maxWidth: '420px' }}>
          {/* Header strip */}
          <div style={{ background: 'var(--color-secondary)', borderRadius: '6px 6px 0 0', margin: '-40px -40px 28px', padding: '20px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px' }}>🍃</div>
            <h2 style={{ color: '#fff', margin: '8px 0 4px', fontSize: '20px', fontWeight: 700 }}>Citizen Login</h2>
            <p style={{ color: '#93C5FD', fontSize: '13px', margin: 0 }}>Swachh Vayu Monitoring Platform</p>
          </div>

          {/* Mini location map */}
          {userLoc.lat && (
            <>
              <LocationMap lat={userLoc.lat} lng={userLoc.lng} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '16px', fontSize: '13px', color: '#6B7280' }}>
                <MapPin size={14} color="var(--color-primary)" />
                <span>Logging in from <strong style={{ color: 'var(--color-secondary)' }}>{locName || 'your area'}</strong></span>
              </div>
            </>
          )}

          {error && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '6px', padding: '12px 16px', marginBottom: '20px', color: '#DC2626', fontSize: '14px' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px', color: 'var(--color-secondary)' }}>
                Mobile Number
              </label>
              <input
                type="tel"
                name="mobile_number"
                value={form.mobile_number}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px', color: 'var(--color-secondary)' }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px', background: loading ? '#9CA3AF' : 'var(--color-primary)',
                color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px',
                fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.5px'
              }}
            >
              {loading ? 'Signing In...' : 'Sign In →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6B7280' }}>
            New citizen? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Register here</Link>
          </div>

          {/* Demo credentials */}
          <div style={{ marginTop: '20px', padding: '12px', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '6px', fontSize: '12px', color: '#0369A1' }}>
            <strong>Demo:</strong> Admin → 9999999999 / securepassword123
          </div>
        </div>
      </main>
      <GovFooter />
    </div>
  );
};

export default LoginPage;
