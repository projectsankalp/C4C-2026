/**
 * asyncHandler wraps an asynchronous express route handler/middleware
 * and catches any thrown errors or rejected promises, passing them to next().
 * This prevents the server from hanging or crashing.
 *
 * @param {Function} fn - Asynchronous route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
