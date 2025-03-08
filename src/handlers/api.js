// API request handlers
import { fetchFromApi } from '../utils/fetch';
import { API_ENDPOINTS, HTTP_STATUS } from '../constants/api';
import { addCorsHeaders, handleOptions } from '../middleware/cors';

/**
 * Handle API requests by proxying to the Weather API
 * @param {Request} request - The request object
 * @param {string} apiKey - The Weather API key
 * @returns {Response} - The API response
 */
export async function handleApiRequest(request, apiKey) {
  const url = new URL(request.url);
  const path = url.pathname;
  const queryParams = url.searchParams;

  // Add CORS headers for preflight requests
  if (request.method === 'OPTIONS') {
    return handleOptions();
  }
  
  // Handle different API endpoints
  try {
    if (path === '/api/weather') {
      return await handleWeatherRequest(queryParams, apiKey);
    }
    
    if (path === '/api/forecast') {
      return await handleForecastRequest(queryParams, apiKey);
    }
    
    if (path === '/api/cities') {
      return await handleCitiesRequest(queryParams, apiKey);
    }
    
    // Handle unknown API endpoints
    return addCorsHeaders(new Response(JSON.stringify({ error: 'API endpoint not found' }), {
      status: HTTP_STATUS.NOT_FOUND,
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    console.error('API handler error:', error);
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
}

/**
 * Handle current weather requests
 * @param {URLSearchParams} queryParams - The query parameters
 * @param {string} apiKey - The Weather API key
 * @returns {Response} - The API response
 */
async function handleWeatherRequest(queryParams, apiKey) {
  const city = queryParams.get('city');
  const lat = queryParams.get('lat');
  const lon = queryParams.get('lon');
  
  if (!city && (!lat || !lon)) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'City name or coordinates are required' }), {
      status: HTTP_STATUS.BAD_REQUEST,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
  
  let apiUrl;
  if (city) {
    apiUrl = `${API_ENDPOINTS.WEATHER}?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=yes`;
  } else {
    apiUrl = `${API_ENDPOINTS.WEATHER}?key=${apiKey}&q=${lat},${lon}&aqi=yes`;
  }
  
  const response = await fetchFromApi(apiUrl);
  return addCorsHeaders(response);
}

/**
 * Handle weather forecast requests
 * @param {URLSearchParams} queryParams - The query parameters
 * @param {string} apiKey - The Weather API key
 * @returns {Response} - The API response
 */
async function handleForecastRequest(queryParams, apiKey) {
  const city = queryParams.get('city');
  const lat = queryParams.get('lat');
  const lon = queryParams.get('lon');
  const days = queryParams.get('days') || 5;
  
  if (!city && (!lat || !lon)) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'City name or coordinates are required' }), {
      status: HTTP_STATUS.BAD_REQUEST,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
  
  let apiUrl;
  if (city) {
    apiUrl = `${API_ENDPOINTS.FORECAST}?key=${apiKey}&q=${encodeURIComponent(city)}&days=${days}&aqi=no&alerts=no`;
  } else {
    apiUrl = `${API_ENDPOINTS.FORECAST}?key=${apiKey}&q=${lat},${lon}&days=${days}&aqi=no&alerts=no`;
  }
  
  const response = await fetchFromApi(apiUrl);
  return addCorsHeaders(response);
}

/**
 * Handle city search requests
 * @param {URLSearchParams} queryParams - The query parameters
 * @param {string} apiKey - The Weather API key
 * @returns {Response} - The API response
 */
async function handleCitiesRequest(queryParams, apiKey) {
  const q = queryParams.get('q');
  
  if (!q || q.length < 3) {
    return addCorsHeaders(new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' }
    }));
  }
  
  const apiUrl = `${API_ENDPOINTS.SEARCH}?key=${apiKey}&q=${encodeURIComponent(q)}`;
  const response = await fetchFromApi(apiUrl);
  return addCorsHeaders(response);
} 