/**
 * Validation helpers for input safety.
 */

const validateEmail = (email) => {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const validatePassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

const validateUUID = (id) => {
  if (typeof id !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

const validatePrice = (price) => {
  const num = Number(price);
  if (isNaN(num) || num < 0) return false;
  // Ensure it has at most 2 decimals
  const str = price.toString();
  const dotIndex = str.indexOf('.');
  if (dotIndex !== -1 && str.length - dotIndex - 1 > 2) return false;
  return true;
};

const validatePagination = (page, limit) => {
  const p = Number(page);
  const l = Number(limit);
  return Number.isInteger(p) && p > 0 && Number.isInteger(l) && l > 0 && l <= 100;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUUID,
  validatePrice,
  validatePagination,
};
