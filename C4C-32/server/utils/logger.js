/**
 * Structured logger utility supporting console output, log levels, and timestamps.
 * Formats as colored output in development and JSON objects in production.
 */
const logger = {
  info: (msg, meta = {}) => {
    const timestamp = new Date().toISOString();
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify({ level: 'info', timestamp, message: msg, ...meta }));
    } else {
      console.log(`\x1b[32m[INFO]\x1b[0m [${timestamp}] ${msg}`, Object.keys(meta).length ? meta : '');
    }
  },
  warn: (msg, meta = {}) => {
    const timestamp = new Date().toISOString();
    if (process.env.NODE_ENV === 'production') {
      console.warn(JSON.stringify({ level: 'warn', timestamp, message: msg, ...meta }));
    } else {
      console.warn(`\x1b[33m[WARN]\x1b[0m [${timestamp}] ${msg}`, Object.keys(meta).length ? meta : '');
    }
  },
  error: (msg, meta = {}) => {
    const timestamp = new Date().toISOString();
    if (process.env.NODE_ENV === 'production') {
      console.error(JSON.stringify({ level: 'error', timestamp, message: msg, ...meta }));
    } else {
      console.error(`\x1b[31m[ERROR]\x1b[0m [${timestamp}] ${msg}`, Object.keys(meta).length ? meta : '');
    }
  },
};

module.exports = logger;
