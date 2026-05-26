/**
 * GraamSehat ASHA Worker App - Input Validators & Encryption Utilities
 * Path: /src/utils/validators.js
 * Validates Aadhaar numbers, phone numbers, names, and provides light client-side
 * encryption/decryption for storing Aadhaar securely in Dexie.js.
 */

/**
 * Validates a 12-digit Aadhaar number
 * @param {string} aadhaar - Aadhaar input
 * @returns {boolean} True if valid 12-digit format
 */
export function validateAadhaar(aadhaar) {
  if (!aadhaar) return false;
  const clean = aadhaar.replace(/\D/g, "");
  return clean.length === 12;
}

/**
 * Validates a 10-digit Indian mobile number
 * @param {string} phone - Phone input
 * @returns {boolean} True if valid 10-digit number starting with 6-9
 */
export function validatePhone(phone) {
  if (!phone) return false;
  const clean = phone.replace(/\D/g, "");
  return /^[6-9]\d{9}$/.test(clean);
}

/**
 * Validates patient name (no special characters, min 2 chars)
 * @param {string} name - Name input
 * @returns {boolean} True if valid
 */
export function validateName(name) {
  if (!name) return false;
  const clean = name.trim();
  return clean.length >= 2 && /^[a-zA-Z\s.]+$/.test(clean);
}

// Secret key for client-side Aadhaar encryption (in production this should be dynamic or KMS backed)
const AADHAAR_CIPHER_KEY = 42;

/**
 * Encrypts an Aadhaar number using a basic XOR cipher and base64.
 * Demonstrates local encryption before saving to IndexedDB.
 * @param {string} aadhaar - Raw 12-digit Aadhaar
 * @returns {string} Encrypted string representation
 */
export function encryptAadhaar(aadhaar) {
  if (!aadhaar) return "";
  const clean = aadhaar.replace(/\D/g, "");
  
  // Custom XOR character shift
  let encrypted = "";
  for (let i = 0; i < clean.length; i++) {
    const charCode = clean.charCodeAt(i);
    // XOR operation
    const xorCode = charCode ^ AADHAAR_CIPHER_KEY;
    encrypted += String.fromCharCode(xorCode);
  }
  
  // Base64 encode the XORed string to make it database-friendly
  return btoa(encrypted);
}

/**
 * Decrypts an encrypted Aadhaar string.
 * @param {string} encryptedAadhaar - Base64 encoded XORed Aadhaar
 * @returns {string} Decrypted 12-digit Aadhaar
 */
export function decryptAadhaar(encryptedAadhaar) {
  if (!encryptedAadhaar) return "";
  
  try {
    const XORed = atob(encryptedAadhaar);
    let decrypted = "";
    for (let i = 0; i < XORed.length; i++) {
      const charCode = XORed.charCodeAt(i);
      const originalCode = charCode ^ AADHAAR_CIPHER_KEY;
      decrypted += String.fromCharCode(originalCode);
    }
    return decrypted;
  } catch (error) {
    console.error("Aadhaar decryption failed", error);
    return "";
  }
}
