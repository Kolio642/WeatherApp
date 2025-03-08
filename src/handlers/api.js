// API request handlers
import { fetchFromApi } from '../utils/fetch';

// Base WeatherAPI URL
const BASE_URL = 'https://api.weatherapi.com/v1';

/**
 * Handle API requests by proxying to the Weather API
 * @param {FetchEvent} event - The fetch event
 * @param {string} apiKey - The Weather API key
 * @returns {Response} - The API response
 */
export async function handleApiRequest(event, apiKey) {
  const url = new URL(event.request.url);
  const path = url.pathname;
  const queryParams = url.searchParams;
  
  // Handle different API endpoints
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
  return new Response(JSON.stringify({ error: 'API endpoint not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
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
  
  let apiUrl;
  if (city) {
    apiUrl = `${BASE_URL}/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=yes`;
  } else if (lat && lon) {
    apiUrl = `${BASE_URL}/current.json?key=${apiKey}&q=${lat},${lon}&aqi=yes`;
  } else {
    return new Response(JSON.stringify({ error: 'City name or coordinates are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return await fetchFromApi(apiUrl);
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
  
  let apiUrl;
  if (city) {
    apiUrl = `${BASE_URL}/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=${days}&aqi=no&alerts=no`;
  } else if (lat && lon) {
    apiUrl = `${BASE_URL}/forecast.json?key=${apiKey}&q=${lat},${lon}&days=${days}&aqi=no&alerts=no`;
  } else {
    return new Response(JSON.stringify({ error: 'City name or coordinates are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return await fetchFromApi(apiUrl);
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
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const apiUrl = `${BASE_URL}/search.json?key=${apiKey}&q=${encodeURIComponent(q)}`;
  return await fetchFromApi(apiUrl);
} 