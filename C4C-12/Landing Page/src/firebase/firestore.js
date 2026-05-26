/**
 * @file firestore.js
 * @description Provides Firestore database operations, including creating/getting user profiles and tracking OTP verification logs.
 */

import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

/**
 * Create a new user profile in Firestore
 * @param {string} uid - The Firebase Auth User ID
 * @param {Object} profileData - The user details
 * @returns {Promise<void>}
 */
export const createUserProfile = async (uid, profileData) => {
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      ...profileData,
      role: profileData.role || "asha", // default role is asha
      status: profileData.status || "pending", // pending admin approval
      createdAt: serverTimestamp(),
      phone_verified: false,
      approvedBy: null,
      approvedAt: null
    });
  } catch (error) {
    console.error("Error creating user profile in Firestore:", error);
    throw error;
  }
};

/**
 * Retrieve user profile from Firestore
 * @param {string} uid
 * @returns {Promise<Object|null>}
 */
export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile from Firestore:", error);
    throw error;
  }
};

/**
 * Save simulated OTP log to Firestore
 * @param {string} uid
 * @param {string} otp
 * @returns {Promise<void>}
 */
export const saveOtpLog = async (uid, otp) => {
  try {
    const otpRef = doc(db, "otpLogs", uid);
    await setDoc(otpRef, {
      otp,
      generatedAt: serverTimestamp(),
      verified: false,
      attempts: 0
    });
  } catch (error) {
    console.error("Error logging OTP in Firestore:", error);
    throw error;
  }
};

/**
 * Verify OTP in Firestore and mark user's phone as verified
 * @param {string} uid
 * @returns {Promise<void>}
 */
export const verifyOtpInDb = async (uid) => {
  try {
    const otpRef = doc(db, "otpLogs", uid);
    const userRef = doc(db, "users", uid);

    await updateDoc(otpRef, {
      verified: true
    });

    await updateDoc(userRef, {
      phone_verified: true
    });
  } catch (error) {
    console.error("Error updating OTP verification status in Firestore:", error);
    throw error;
  }
};

/**
 * Increment the OTP verification attempt counter
 * @param {string} uid
 * @param {number} currentAttempts
 * @returns {Promise<void>}
 */
export const incrementOtpAttempts = async (uid, currentAttempts) => {
  try {
    const otpRef = doc(db, "otpLogs", uid);
    await updateDoc(otpRef, {
      attempts: currentAttempts + 1
    });
  } catch (error) {
    console.error("Error updating OTP attempts:", error);
  }
};
