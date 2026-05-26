import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import L from 'leaflet'
import './index.css'
import App from './App.jsx'

// Expose Leaflet globally for plugins (e.g. leaflet.heat)
window.L = L;
// Dynamically load leaflet.heat after window.L is set
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js';
script.async = true;
document.head.appendChild(script);
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
