/**
 * GraamSehat Admin Dashboard - Formatters Utility
 * Location: /src/utils/formatters.js
 */

/**
 * Formats a Firebase Timestamp or Date string into readable format.
 * @param {object|string|number} timestamp 
 * @returns {string}
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  let date;
  if (timestamp.seconds !== undefined) {
    // Firebase Timestamp
    date = new Date(timestamp.seconds * 1000);
  } else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    date = timestamp.toDate();
  } else {
    date = new Date(timestamp);
  }
  
  if (isNaN(date.getTime())) return 'N/A';
  
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-IN', options);
};

/**
 * Formats date and time.
 * @param {object|string} timestamp 
 * @returns {string}
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  let date;
  if (timestamp.seconds !== undefined) {
    date = new Date(timestamp.seconds * 1000);
  } else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    date = timestamp.toDate();
  } else {
    date = new Date(timestamp);
  }
  
  if (isNaN(date.getTime())) return 'N/A';
  
  const options = { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
  };
  return date.toLocaleDateString('en-IN', options);
};

/**
 * Masks the Aadhaar number leaving only the last 4 digits visible.
 * @param {string} aadhaar 
 * @returns {string}
 */
export const maskAadhaar = (aadhaar) => {
  if (!aadhaar) return 'XXXX-XXXX-XXXX';
  const clean = aadhaar.replace(/\s+/g, '').replace(/-/g, '');
  if (clean.length < 4) return aadhaar;
  const last4 = clean.slice(-4);
  return `XXXX-XXXX-${last4}`;
};

/**
 * Capitalizes a string.
 * @param {string} text 
 * @returns {string}
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Standardizes risk level formatting.
 * @param {string} risk 
 * @returns {string}
 */
export const formatRiskLevel = (risk) => {
  if (!risk) return 'Unknown';
  return capitalize(risk);
};
