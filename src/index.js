// Main worker entry point
import { handleApiRequest } from './handlers/api';
import { serveStaticAsset } from './handlers/assets';

// Get API key from environment
const WEATHER_API_KEY = typeof WEATHER_API_KEY !== 'undefined' ? WEATHER_API_KEY : '';

addEventListener('fetch', event => {
  event.respondWith(handleEvent(event));
});

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