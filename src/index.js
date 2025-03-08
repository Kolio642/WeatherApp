// Main worker entry point
import { handleApiRequest } from './handlers/api';
import { serveStaticAsset } from './handlers/assets';

// Define event listener
addEventListener('fetch', event => {
  event.respondWith(handleEvent(event));
});

// Get API key from environment variables - note the proper way to access environment variables
const WEATHER_API_KEY = typeof WEATHER_API_KEY !== 'undefined' ? WEATHER_API_KEY : '';

// Handle requests
async function handleEvent(event) {
  const url = new URL(event.request.url);
  const path = url.pathname;
  
  try {
    // Handle API requests
    if (path.startsWith('/api/')) {
      return await handleApiRequest(event, WEATHER_API_KEY);
    }

    // Serve static files
    return await serveStaticAsset(event);
  } catch (e) {
    return new Response('Internal Error: ' + e.message, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
} 