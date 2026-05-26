/**
 * GraamSehat ASHA Worker App - UID Generator & Luhn Validator
 * Path: /src/utils/uidGenerator.js
 * Generates an 8-digit UID with state code 29 (Karnataka), 5-digit serial,
 * and a Luhn checksum digit. Includes validation utility.
 */

/**
 * Calculates the Luhn check digit for a given digit string.
 * @param {string} numberString - The numeric string (e.g. "2904821")
 * @returns {number} The check digit (0-9)
 */
export function calculateLuhnCheckDigit(numberString) {
  let sum = 0;
  // Starting from the rightmost digit, double every second digit
  // When appended, the check digit is at the last position (index 7).
  // Thus, the last character of the 7-digit numberString (index 6) gets doubled.
  // This corresponds to (length - 1 - i) % 2 === 0
  for (let i = numberString.length - 1; i >= 0; i--) {
    let digit = parseInt(numberString.charAt(i), 10);
    if (isNaN(digit)) continue;

    if ((numberString.length - 1 - i) % 2 === 0) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }
  return (10 - (sum % 10)) % 10;
}

/**
 * Generates a formatted 6-digit UID: "XXXXX-C"
 * @param {number|string} serial - The incremental serial number (e.g. 68558)
 * @returns {string} Formatted UID (e.g. "68558-6")
 */
export function generateUID(serial) {
  const paddedSerial = String(serial).padStart(5, "0");
  const checkDigit = calculateLuhnCheckDigit(paddedSerial);
  return `${paddedSerial}-${checkDigit}`;
}

/**
 * Validates a 6-digit UID (with or without hyphens)
 * Must pass Luhn checksum validation.
 * @param {string} uid - The UID to validate
 * @returns {boolean} True if valid
 */
export function validateUID(uid) {
  if (!uid) return false;
  
  // Strip hyphens
  const cleanUid = uid.replace(/-/g, "").trim();
  
  // Must be exactly 6 digits
  if (!/^\d{6}$/.test(cleanUid)) {
    return false;
  }
  
  // Validate Luhn
  let sum = 0;
  let shouldDouble = false;
  
  // Traverse from right to left
  for (let i = cleanUid.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanUid.charAt(i), 10);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
}

/**
 * Helper to clean and format a raw 6-digit number into "XXXXX-C"
 * @param {string} raw - Raw input digits
 * @returns {string} Formatted UID
 */
export function formatUID(raw) {
  const clean = raw.replace(/\D/g, "");
  if (clean.length <= 5) return clean;
  return `${clean.substring(0, 5)}-${clean.substring(5, 6)}`;
}
