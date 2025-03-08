/**
 * Environment configuration
 * Centralizes access to environment variables
 */

/**
 * Gets an environment variable from various possible sources
 * @param {Object} event - The Cloudflare Worker event object
 * @param {string} key - The environment variable key to retrieve
 * @param {string|null} defaultValue - Optional default value if not found
 * @returns {string|null} - The environment variable value or default
 */
function getEnv(event, key, defaultValue = null) {
  // Try global scope first (for production)
  if (typeof globalThis[key] !== 'undefined') {
    return globalThis[key];
  }
  
  // Then try event.env (for newer Workers runtime)
  if (event && event.env && typeof event.env[key] !== 'undefined') {
    return event.env[key];
  }
  
  // Finally, return default value if provided
  return defaultValue;
}

module.exports = {
  getEnv
}; 