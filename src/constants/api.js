/**
 * API Constants
 * Centralizes API endpoints and other constants
 */

const API_ENDPOINTS = {
  WEATHER: 'https://api.weatherapi.com/v1/current.json',
  FORECAST: 'https://api.weatherapi.com/v1/forecast.json',
  SEARCH: 'https://api.weatherapi.com/v1/search.json'
};

const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

module.exports = {
  API_ENDPOINTS,
  HTTP_STATUS,
  CORS_HEADERS
}; 