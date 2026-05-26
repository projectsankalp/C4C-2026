// KariGhar - Helper Utilities

/**
 * Formats a number to Indian Rupee (INR) currency style
 * @param {number} amount - The numeric amount
 * @returns {string} - Formatted currency (e.g. ₹4,250)
 */
export const formatPrice = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

/**
 * Calculates subtotal for items in the shopping cart
 * @param {Array} items - Array of cart item objects
 * @returns {number} - Subtotal cost
 */
export const getCartSubtotal = (items) => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

/**
 * Simulates shipping price calculation
 * @param {number} subtotal - Cart subtotal cost
 * @returns {number} - Shipping cost
 */
export const getShippingCost = (subtotal) => {
  if (subtotal === 0) return 0;
  return subtotal > 5000 ? 0 : 250; // Free shipping above ₹5000
};

/**
 * Generates a mock 4-digit numeric OTP code
 * @returns {string} - "1234" (default for ease) or random
 */
export const generateMockOTP = () => {
  return "1234";
};
