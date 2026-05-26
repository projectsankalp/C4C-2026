/**
 * GraamSehat ASHA Worker App - Authentication Context
 * Path: /src/context/AuthContext.jsx
 * Listens to Firebase Authentication state, resolves ASHA profiles from Firestore,
 * and maintains active user credentials.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { fetchAshaProfile, logoutUser, loginWithEmailAndPassword } from "../firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [ashaProfile, setAshaProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setAuthError(null);
      
      if (user) {
        try {
          // Resolve ASHA profile from Firestore
          const profile = await fetchAshaProfile(user.uid);
          
          if (profile && (profile.role === "asha" || profile.role === "admin")) {
            setCurrentUser(user);
            setAshaProfile(profile);
          } else {
            setAuthError("role_invalid");
            setCurrentUser(null);
            setAshaProfile(null);
            // Sign out invalid role users automatically
            await logoutUser();
          }
        } catch (error) {
          console.error("Error loading ASHA profile", error);
          setAuthError("profile_fetch_failed");
          setCurrentUser(null);
          setAshaProfile(null);
        }
      } else {
        setCurrentUser(null);
        setAshaProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      await loginWithEmailAndPassword(email, password);
    } catch (error) {
      setAuthError(error.code || error.message);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setCurrentUser(null);
      setAshaProfile(null);
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    ashaProfile,
    loading,
    authError,
    isAuthenticated: !!currentUser && (ashaProfile?.status === "approved" || ashaProfile?.role === "admin"),
    isPendingApproval: !!currentUser && ashaProfile?.status !== "approved" && ashaProfile?.role !== "admin",
    ashaWorkerId: currentUser?.uid || null,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
