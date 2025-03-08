// Main worker entry point
import { handleApiRequest } from './handlers/api';
import { serveStaticAsset } from './handlers/assets';

// Define event listener
addEventListener('fetch', event => {
  event.respondWith(handleEvent(event));
});

// Handle requests
async function handleEvent(event) {
  const url = new URL(event.request.url);
  const path = url.pathname;
  
  // Get API key from environment variables
  // This is the correct way to access environment variables in Cloudflare Workers
  const apiKey = event.env && event.env.WEATHER_API_KEY ? event.env.WEATHER_API_KEY : '';
  
  try {
    // Handle API requests
    if (path.startsWith('/api/')) {
      return await handleApiRequest(event, apiKey);
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