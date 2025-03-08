/**
 * CORS Middleware
 * Handles Cross-Origin Resource Sharing headers
 */

const { CORS_HEADERS } = require('../constants/api');

/**
 * Adds CORS headers to a response
 * @param {Response} response - The response object
 * @returns {Response} - The response with CORS headers
 */
function addCorsHeaders(response) {
  const corsResponse = new Response(response.body, response);
  
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    corsResponse.headers.set(key, value);
  });
  
  return corsResponse;
}

/**
 * Handles preflight OPTIONS requests
 * @returns {Response} - A response for OPTIONS requests
 */
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

module.exports = {
  addCorsHeaders,
  handleOptions
}; 