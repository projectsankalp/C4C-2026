/**
 * GraamSehat ASHA Worker App - Entrypoint
 * Path: /src/main.jsx
 * Mounts the root React components under browser contexts and registers
 * the static asset-caching Service Worker.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Context Providers
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { SyncProvider } from "./context/SyncContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <SyncProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SyncProvider>
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>
);

// Register PWA Service Worker for offline-first operation
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("ServiceWorker registered successfully with scope: ", registration.scope);
      })
      .catch((error) => {
        console.error("ServiceWorker registration failed: ", error);
      });
  });
}
