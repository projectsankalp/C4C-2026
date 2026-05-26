/**
 * src/firebase/config.js
 * Firebase initialization config.
 * Implements a mock fallback mode when credentials are not reachable or offline,
 * ensuring the application can operate 100% offline.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCb9XFg1zTu-tTmP-0PgWol768E1fPMaIM",
  authDomain: "graamsehat-d5ede.firebaseapp.com",
  projectId: "graamsehat-d5ede",
  storageBucket: "graamsehat-d5ede.firebasestorage.app",
  messagingSenderId: "800774314027",
  appId: "1:800774314027:web:6621fdf508d2f0f48eb26e",
  measurementId: "G-J39ZV4ZZYD"
};

let app;
let db;
let isFirebaseMock = false;

const isConfigured =
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "PLACEHOLDER_API_KEY" &&
  !firebaseConfig.apiKey.startsWith("YOUR_");

if (isConfigured) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization failed. Falling back to Mock mode:", error);
    isFirebaseMock = true;
  }
} else {
  isFirebaseMock = true;
}

export { app, db, isFirebaseMock };
