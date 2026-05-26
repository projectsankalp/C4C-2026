/**
 * @file validators.js
 * @description Helper functions for validating client-side inputs for login, signup, and OTP verification.
 */

/**
 * Validates signup details for ASHA Workers
 * @param {Object} data - The form data object
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateSignup = (data) => {
  const errors = {};

  if (!data.name || data.name.trim().length < 3) {
    errors.name = "Full Name must be at least 3 characters long.";
  }

  if (!data.employeeId || data.employeeId.trim().length < 4) {
    errors.employeeId = "Valid Employee ID is required (min 4 characters).";
  }

  if (!data.district || data.district.trim().length < 2) {
    errors.district = "District name is required.";
  }

  if (!data.subCentre || data.subCentre.trim().length < 2) {
    errors.subCentre = "Sub-Centre name is required.";
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  if (!data.phone || !phoneRegex.test(data.phone)) {
    errors.phone = "Enter a valid 10-digit Indian phone number starting with 6-9.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!data.password || data.password.length < 6) {
    errors.password = "Password must be at least 6 characters long.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates login details
 * @param {string} email
 * @param {string} password
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateLogin = (email, password) => {
  const errors = {};

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password || password.length < 6) {
    errors.password = "Password must be at least 6 characters long.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
