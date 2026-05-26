/**
 * @file auth.js
 * @description Provides authentication abstraction layer for the application using Firebase Auth.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "./config";

/**
 * Register a new user with Email and Password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export const signUpUser = async (email, password) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error signing up user:", error);
    throw error;
  }
};

/**
 * Log in an existing user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export const logInUser = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

/**
 * Log out the currently authenticated user
 * @returns {Promise<void>}
 */
export const logOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out user:", error);
    throw error;
  }
};

/**
 * Send password reset email to a user
 * @param {string} email
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

/**
 * Subscribe to authentication state changes
 * @param {Function} callback - The callback executed on auth change
 * @returns {import("firebase/auth").Unsubscribe}
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

