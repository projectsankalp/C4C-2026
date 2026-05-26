/**
 * GraamSehat Admin Dashboard - Firebase Initialization & Common Utilities
 * Location: /src/firebase/config.js
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
export const db = getFirestore(app);

/**
 * Logs admin activity in the adminActivityLog collection.
 * @param {string} adminId - The Firebase Auth UID of the admin
 * @param {string} action - Describe the action performed
 * @param {object} details - Additional information about the action
 */
export const logAdminActivity = async (adminId, action, details = {}) => {
  try {
    if (!adminId) return;
    await addDoc(collection(db, 'adminActivityLog'), {
      adminId,
      action,
      details,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
};
