/**
 * GraamSehat ASHA Worker App - Firebase SDK Configuration
 * Path: /src/firebase/config.js
 * Initializes Firebase core app, Firestore database, and authentication services.
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCb9XFg1zTu-tTmP-0PgWol768E1fPMaIM",
  authDomain: "graamsehat-d5ede.firebaseapp.com",
  projectId: "graamsehat-d5ede",
  storageBucket: "graamsehat-d5ede.firebasestorage.app",
  messagingSenderId: "800774314027",
  appId: "1:800774314027:web:6621fdf508d2f0f48eb26e",
  measurementId: "G-J39ZV4ZZYD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

export default app;
