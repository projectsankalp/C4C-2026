/**
 * @file AuthContext.jsx
 * @description Authentication context provider. Manages Firebase Auth listener, fetches user profiles, and exposes credentials.
 */

import React, { createContext, useState, useEffect } from "react";
import { subscribeToAuthChanges, signUpUser, logInUser, logOutUser, resetPassword } from "../firebase/auth";
import { createUserProfile, getUserProfile } from "../firebase/firestore";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Helper to fetch user profile from Firestore
  const fetchUserProfile = async (uid) => {
    try {
      const profile = await getUserProfile(uid);
      if (profile) {
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Failed to fetch user profile from Firestore:", error);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    let unsubscribe;
    try {
      unsubscribe = subscribeToAuthChanges(async (user) => {
        setLoading(true);
        if (user) {
          setCurrentUser(user);
          await fetchUserProfile(user.uid);
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      });
    } catch (error) {
      console.error("Firebase Auth initialization error. Check credentials in src/firebase/config.js.", error);
      setAuthError("Firebase not initialized properly. Check console for details.");
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await logInUser(email, password);
      await fetchUserProfile(userCredential.user.uid);
      return userCredential;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, profileData) => {
    setLoading(true);
    try {
      const userCredential = await signUpUser(email, password);
      // Immediately write user profile to Firestore
      await createUserProfile(userCredential.user.uid, {
        email,
        ...profileData,
      });
      await fetchUserProfile(userCredential.user.uid);
      return userCredential;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logOutUser();
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetUserPassword = async (email) => {
    try {
      await resetPassword(email);
    } catch (error) {
      console.error("Password reset failed:", error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchUserProfile(currentUser.uid);
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    authError,
    login,
    signup,
    logout,
    resetUserPassword,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
