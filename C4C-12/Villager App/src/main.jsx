/**
 * src/main.jsx
 * App entrypoint. Renders React tree and registers the PWA service worker.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker to enable 100% offline startup caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('GraamSehat Villager Service Worker registered. Scope:', reg.scope);
      })
      .catch((err) => {
        console.error('GraamSehat Villager Service Worker registration failed:', err);
      });
  });
}
