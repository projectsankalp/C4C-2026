import { Link } from 'react-router-dom';
import GovHeader from '../components/layout/GovHeader';
import GovFooter from '../components/layout/GovFooter';
import { ArrowLeft, BookOpen, Mail, Shield, FileText, Scale, LinkIcon, Info } from 'lucide-react';

const pageContent = {
  'About Swachh Vayu & NCAP': {
    icon: <Info size={28} color="var(--color-primary)" />,
    sections: [
      { heading: 'What is Swachh Vayu?', body: 'Swachh Vayu is a low-cost IoT-based rural air quality monitoring and prediction system designed for India. It uses ESP32 microcontrollers with MQ135 gas sensors, LoRa long-range communication, and Raspberry Pi hubs to create a real-time pollution monitoring network for rural villages.' },
      { heading: 'Our Mission', body: 'To bring affordable, real-time air quality monitoring to every rural village in India. We believe clean air is a fundamental right, and every community deserves access to actionable pollution data — not just metro cities.' },
      { heading: 'How It Works', body: '1. Solar-powered ESP32 sensor nodes are installed in villages.\n2. Sensors read pollution levels every 5 seconds.\n3. Data is transmitted via LoRa radio to a central Raspberry Pi hub.\n4. The hub processes data, runs AI predictions, and pushes it to the web dashboard.\n5. Citizens receive SMS and voice alerts when air quality deteriorates.\n6. Villages compete on a leaderboard to improve their air quality.' },
      { heading: 'Technology Stack', body: '• Hardware: ESP32, MQ135, LoRa SX1278, I2C LCD, SIM800L GSM\n• Backend: Python Flask, SQLite, Random Forest ML Model\n• Frontend: React.js with Leaflet Maps\n• Communication: LoRa (long range), SMS alerts, Voice TTS via Sarvam AI' },
    ]
  },
  'National Clean Air Programme (NCAP)': {
    icon: <Shield size={28} color="var(--color-primary)" />,
    sections: [
      { heading: 'About NCAP', body: 'The National Clean Air Programme (NCAP) is a comprehensive strategy launched by the Ministry of Environment, Forest and Climate Change to reduce air pollution levels across India. It targets a 20-30% reduction in PM2.5 and PM10 by 2024 (base year 2017).' },
      { heading: 'NCAP Objectives', body: '• Augment and strengthen the air quality monitoring network\n• Prepare city-specific clean air action plans\n• Build awareness and capacity for air quality management\n• Implement mitigation actions to reduce emissions from key sources' },
      { heading: 'How Swachh Vayu Aligns with NCAP', body: 'Swachh Vayu directly supports NCAP goals by extending air quality monitoring into rural areas, which are currently underserved. Our low-cost sensor network provides granular, village-level pollution data that can inform local policy decisions.' },
    ]
  },
  'Citizen Services': {
    icon: <BookOpen size={28} color="var(--color-primary)" />,
    sections: [
      { heading: 'Services Available', body: '• Real-time AQI monitoring on your mobile\n• SMS alerts when air quality becomes hazardous\n• Voice alerts in your local language (Hindi, Marathi, Kannada, Tamil, Telugu)\n• Village ranking and competition system\n• AI-powered 4-hour AQI predictions\n• Interactive pollution heatmap' },
      { heading: 'How to Register', body: 'Visit the registration page, enter your mobile number, village name, and preferred language. Use the map to pin your exact location. You will immediately start receiving air quality updates for your village.' },
      { heading: 'Need Help?', body: 'Contact your village panchayat or reach out to us via the Contact page. Our team is available to help with registration, node installation, and any technical issues.' },
    ]
  },
  'Air Quality Reports': {
    icon: <FileText size={28} color="var(--color-primary)" />,
    sections: [
      { heading: 'AQI Categories', body: '0-50: Good — Minimal impact\n51-100: Satisfactory — Minor breathing discomfort for sensitive people\n101-200: Moderate — Breathing discomfort for people with lung/heart disease\n201-300: Poor — Breathing discomfort on prolonged exposure\n301-400: Very Poor — Respiratory illness on prolonged exposure\n401-500: Severe — Affects healthy people, serious impact on those with existing conditions' },
      { heading: 'Understanding Your Data', body: 'The MQ135 sensor used in Swachh Vayu nodes measures gases like NH3, NOx, alcohol, benzene, smoke, and CO2. While not a direct PM2.5/PM10 particulate sensor, it provides a reliable proxy for overall air quality in rural settings where primary pollutants are biomass burning, agricultural waste, and vehicular emissions.' },
      { heading: 'Data Access', body: 'All air quality data is available in real-time on your dashboard after logging in. Historical data for the past 30 days is available in chart form. Admin users can export data for reporting purposes.' },
    ]
  },
  'Contact the Ministry': {
    icon: <Mail size={28} color="var(--color-primary)" />,
    sections: [
      { heading: 'Get In Touch', body: 'We welcome your feedback and questions about the Swachh Vayu platform.' },
      { heading: 'Email', body: 'support@swachhvayu.in' },
      { heading: 'Phone', body: '+91 20 1234 5678 (Mon-Sat, 9 AM - 6 PM IST)' },
      { heading: 'Address', body: 'Swachh Vayu Project Office\nEnvironmental Monitoring Division\nPune, Maharashtra 411001' },
      { heading: 'Report an Issue', body: 'If you notice a sensor node is malfunctioning, or if you have concerns about the air quality data in your village, please contact us immediately. Include your village name and a description of the issue.' },
    ]
  },
  'Rural Monitoring Guidelines': {
    icon: <BookOpen size={28} color="var(--color-primary)" />,
    sections: [
      { heading: 'Sensor Node Placement', body: '• Install nodes at a height of 2-3 meters above ground\n• Avoid placing directly next to cooking areas or exhaust vents\n• Ensure the MQ135 sensor has open air circulation\n• The LoRa antenna should have line-of-sight to the hub\n• Solar panels should face south for maximum sunlight exposure' },
      { heading: 'Maintenance Schedule', body: '• Weekly: Visual inspection of the node\n• Monthly: Clean the MQ135 sensor mesh with compressed air\n• Quarterly: Check battery and solar panel connections\n• Annually: Replace the MQ135 sensor for calibration accuracy' },
      { heading: 'Data Interpretation', body: 'Readings may spike temporarily during cooking hours (6-8 AM, 6-8 PM) and during agricultural burning seasons. These are expected patterns. Sustained high readings outside these windows indicate a genuine pollution concern.' },
    ]
  },
  'Privacy Policy': {
    icon: <Shield size={28} color="var(--color-primary)" />,
    sections: [
      { heading: 'Data We Collect', body: '• Mobile number (for SMS alerts)\n• Village name and location (for localized monitoring)\n• Language preference (for multilingual support)\n• Air quality sensor data from your village' },
      { heading: 'How We Use Your Data', body: 'Your personal information is used solely to deliver air quality alerts and provide localized monitoring services. We do not sell or share your data with third parties. Sensor data is aggregated and anonymized for research purposes.' },
      { heading: 'Data Retention', body: 'Your account data is retained as long as you are a registered user. Sensor readings are stored for historical analysis. You can request account deletion by contacting us.' },
      { heading: 'Security', body: 'All passwords are encrypted using bcrypt. API communications are secured via JWT tokens. We follow industry-standard security practices to protect your data.' },
    ]
  },
  'Terms of Use': {
    icon: <Scale size={28} color="var(--color-primary)" />,
    sections: [
      { heading: 'Acceptance of Terms', body: 'By using Swachh Vayu, you agree to these terms. The platform is provided as-is for informational and community welfare purposes.' },
      { heading: 'Use of Data', body: 'Air quality data provided by Swachh Vayu is indicative and based on MQ135 gas sensor readings. It should not be used as the sole basis for medical decisions. Always consult official government air quality indices for health-critical decisions.' },
      { heading: 'User Responsibilities', body: '• Provide accurate registration information\n• Do not attempt to tamper with sensor hardware\n• Report any data anomalies to the admin team\n• Do not use the platform for unauthorized commercial purposes' },
      { heading: 'Limitations', body: 'The MQ135 sensor is a gas sensor and may not reflect exact PM2.5/PM10 levels. Predictions from the AI model are estimates based on historical patterns and should be treated as advisory, not definitive.' },
    ]
  },
};

const ContentPage = ({ title }) => {
  const content = pageContent[title];

  return (
    <div className="flex-col" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-alt)' }}>
      <GovHeader />
      
      {/* Page Banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-secondary), #1e40af)', padding: '40px 0' }}>
        <div className="container">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#93C5FD', fontSize: '13px', textDecoration: 'none', marginBottom: '12px', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = '#93C5FD'}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {content?.icon && <div style={{ padding: '12px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px' }}>{content.icon}</div>}
            <h1 className="h1" style={{ color: 'white', margin: 0, fontSize: '28px' }}>{title}</h1>
          </div>
        </div>
      </div>

      <main className="container" style={{ padding: '40px 16px', flex: 1 }}>
        {content ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {content.sections.map((section, i) => (
              <div key={i} className="card" style={{ padding: '28px 32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-secondary)', marginBottom: '14px', paddingBottom: '10px', borderBottom: '2px solid var(--color-primary-light)' }}>
                  {section.heading}
                </h3>
                <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#374151', whiteSpace: 'pre-line' }}>
                  {section.body}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 500 }}>Page content is being prepared.</h3>
            <p style={{ marginTop: '8px' }}>Please check back soon.</p>
            <Link to="/" style={{ display: 'inline-block', marginTop: '16px', padding: '10px 24px', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
              Return to Home
            </Link>
          </div>
        )}
      </main>

      <GovFooter />
    </div>
  );
};

export default ContentPage;
