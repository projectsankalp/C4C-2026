import { Link } from 'react-router-dom';
import GovHeader from '../components/layout/GovHeader';
import NavBar from '../components/layout/NavBar';
import GovFooter from '../components/layout/GovFooter';
import AQIBadge from '../components/ui/AQIBadge';
import Button from '../components/ui/Button';
import { latestUpdates } from '../data/mockData';
import { Wind, Shield, Activity, Users, Map as MapIcon } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
const LandingPage = () => {
  return (
    <div className="flex-col" style={{ minHeight: '100vh' }}>
      <GovHeader />
      <NavBar />
      
      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <div style={{ 
          backgroundColor: 'var(--color-secondary)', 
          color: 'white', 
          padding: '64px 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Abstract background pattern for gov look */}
          <div style={{ position: 'absolute', right: 0, top: 0, opacity: 0.1 }}>
            <svg width="400" height="400" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="50" cy="50" r="20" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          </div>
          
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: '600px' }}>
              <h1 className="h1" style={{ color: 'white', fontSize: '42px', marginBottom: '24px' }}>
                Protecting Rural India with <span style={{ color: 'var(--color-primary)' }}>Real-Time</span> Air Quality Intelligence
              </h1>
              <p style={{ fontSize: '18px', color: '#E5E7EB', marginBottom: '32px', lineHeight: '1.6' }}>
                Swachh Vayu is a comprehensive IoT-based environmental governance platform designed to monitor, 
                predict, and alert rural communities about air quality and pollution levels.
              </p>
              <div className="flex gap-4">
                <Link to="/register">
                  <Button variant="primary" size="lg">Citizen Registration</Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="lg" style={{ borderColor: 'white', color: 'white' }}>Login to Portal</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Live Stats Bar */}
        <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '16px 0' }}>
          <div className="container flex justify-between items-center">
            <span style={{ fontWeight: '600' }}>National AQI Overview:</span>
            <div className="flex gap-6">
              <div className="flex items-center gap-2"><span style={{ color: '#FFDDBA' }}>Khedgaon Village:</span> <AQIBadge aqi={47} size="sm" /></div>
              <div className="flex items-center gap-2"><span style={{ color: '#FFDDBA' }}>Pimpalgaon Village:</span> <AQIBadge aqi={132} size="sm" /></div>
            </div>
          </div>
        </div>

        {/* Features / Services */}
        <div className="container" style={{ padding: '64px 16px' }}>
          <h2 className="h2" style={{ textAlign: 'center', marginBottom: '48px' }}>Key Services & Features</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {[
              { title: 'Real-Time Monitoring', desc: 'Solar-powered IoT sensors providing 24/7 PM2.5, PM10, and gas readings.', icon: <Activity size={32} color="var(--color-primary)" /> },
              { title: 'Predictive Alerts', desc: 'AI-driven forecasting and early warnings via SMS, IVR, and local sirens.', icon: <Wind size={32} color="var(--color-primary)" /> },
              { title: 'Data-Driven Governance', desc: 'Comprehensive dashboards for local administration to enforce NCAP guidelines.', icon: <Shield size={32} color="var(--color-primary)" /> },
              { title: 'Community Engagement', desc: 'Multilingual support, voice assistants, and village rankings to drive awareness.', icon: <Users size={32} color="var(--color-primary)" /> }
            ].map((feature, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
                <div style={{ display: 'inline-block', padding: '16px', backgroundColor: 'var(--color-primary-light)', borderRadius: '50%', marginBottom: '24px' }}>
                  {feature.icon}
                </div>
                <h3 className="h3" style={{ fontSize: '18px', marginBottom: '16px' }}>{feature.title}</h3>
                <p className="text-muted">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Updates Section */}
        <div style={{ backgroundColor: 'white', padding: '64px 0', borderTop: '1px solid var(--color-border)' }}>
          <div className="container">
            <h2 className="h2" style={{ marginBottom: '32px' }}>Latest Updates & Circulars</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div className="card">
                <h3 className="h3" style={{ fontSize: '18px', borderBottom: '2px solid var(--color-primary)', paddingBottom: '8px', marginBottom: '16px' }}>Recent Announcements</h3>
                <ul style={{ padding: 0, margin: 0 }}>
                  {latestUpdates.map(update => (
                    <li key={update.id} style={{ padding: '12px 0', borderBottom: '1px dashed var(--color-border)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: '600', display: 'block', marginBottom: '4px' }}>{update.date}</span>
                      <Link to="/about" style={{ color: 'var(--color-secondary)', fontSize: '14px', display: 'block', lineHeight: '1.4', textDecoration: 'none' }}>{update.title}</Link>
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: '16px', textAlign: 'right' }}>
                  <Link to="/about" style={{ color: 'var(--color-primary)', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>View All Announcements &rarr;</Link>
                </div>
              </div>
              
              <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <h3 className="h3" style={{ fontSize: '18px', padding: '16px', margin: 0, borderBottom: '1px solid var(--color-border)', backgroundColor: '#F9FAFB', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapIcon size={20} color="var(--color-primary)" /> Village Map Preview
                </h3>
                <div style={{ height: '300px', width: '100%', position: 'relative', zIndex: 0 }}>
                  <MapContainer center={[18.5204, 73.8567]} zoom={11} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false} scrollWheelZoom={false}>
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; OpenStreetMap'
                    />
                    {/* Sample points */}
                    <CircleMarker center={[18.5195, 73.8553]} radius={6} pathOptions={{ fillColor: '#F59E0B', color: 'white', weight: 2, fillOpacity: 1 }} />
                    <CircleMarker center={[18.5305, 73.8475]} radius={6} pathOptions={{ fillColor: '#16A34A', color: 'white', weight: 2, fillOpacity: 1 }} />
                    <CircleMarker center={[18.5080, 73.8120]} radius={6} pathOptions={{ fillColor: '#DC2626', color: 'white', weight: 2, fillOpacity: 1 }} />
                  </MapContainer>
                </div>
                <div style={{ padding: '16px', backgroundColor: 'var(--color-secondary)', color: 'white' }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>Live Rural Network</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#9CA3AF' }}>Monitoring Khedgaon & Pimpalgaon rural network.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <GovFooter />
    </div>
  );
};

export default LandingPage;
