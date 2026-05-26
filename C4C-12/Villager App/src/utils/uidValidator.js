/**
 * src/utils/uidValidator.js
 * Performs Luhn checksum validation on 6-digit Health IDs.
 */

/**
 * Validates whether a 6-digit UID string passes the Luhn checksum.
 * @param {string} uidStr - The 6-digit UID to validate
 * @returns {boolean} True if valid
 */
export function validateLuhn(uidStr) {
  if (!uidStr || typeof uidStr !== 'string') return false;
  
  // Clean input - only allow numbers
  const cleaned = uidStr.replace(/\D/g, '');
  if (cleaned.length !== 6) return false;

  let sum = 0;
  let shouldDouble = false; // Check digit (index 7) is not doubled

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);
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
