import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

async function handleRequest(request, env) {
  const url = new URL(request.url);
  
  // Handle API requests
  if (url.pathname.startsWith('/api')) {
    return handleApiRequest(request, env);
  }

  // Serve static assets
  try {
    return await getAssetFromKV(request, {
      NAMESPACE: env.ASSETS,
      defaultMimeType: 'text/html'
    });
  } catch (e) {
    // If the asset is not found or there's an error, return the index.html for client-side routing
    if (e.status === 404) {
      const indexResponse = await getAssetFromKV(
        new Request(new URL('/index.html', request.url)),
        { NAMESPACE: env.ASSETS }
      );
      return new Response(indexResponse.body, {
        ...indexResponse,
        status: 200
      });
    }
    return new Response('Not Found', { status: 404 });
  }
}

async function handleApiRequest(request, env) {
  const url = new URL(request.url);
  
  // Handle weather API endpoint
  if (url.pathname === '/api/weather') {
    const city = url.searchParams.get('city');
    if (!city) {
      return new Response(JSON.stringify({ error: 'City parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const weatherApiKey = env.WEATHER_API_KEY;
      const weatherApiUrl = `http://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${encodeURIComponent(city)}`;
      
      const response = await fetch(weatherApiUrl);
      const data = await response.json();

      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'max-age=300' // Cache for 5 minutes
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch weather data' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Not Found', { status: 404 });
}

// Export the handler for the worker
export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env);
    } catch (e) {
      return new Response('Internal Error', { status: 500 });
    }
  }
}; 