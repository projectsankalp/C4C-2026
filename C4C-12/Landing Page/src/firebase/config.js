/**
 * @file config.js
 * @description Initializes the Firebase SDK. Loads credentials from environment variables or falls back to placeholders.
 */

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCb9XFg1zTu-tTmP-0PgWol768E1fPMaIM",
  authDomain: "graamsehat-d5ede.firebaseapp.com",
  projectId: "graamsehat-d5ede",
  storageBucket: "graamsehat-d5ede.firebasestorage.app",
  messagingSenderId: "800774314027",
  appId: "1:800774314027:web:6621fdf508d2f0f48eb26e",
  measurementId: "G-J39ZV4ZZYD"
};

// Prevent duplicate initialization in hot-reload environments
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
