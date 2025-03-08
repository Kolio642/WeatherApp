// Use native Cloudflare Workers APIs instead of kv-asset-handler
// This avoids the dependency on @cloudflare/kv-asset-handler

const WEATHER_API_KEY = typeof WEATHER_API_KEY !== 'undefined' ? WEATHER_API_KEY : '';

async function handleEvent(event) {
  const url = new URL(event.request.url);
  const path = url.pathname;
  
  try {
    // Handle API requests
    if (path.startsWith('/api/')) {
      return await handleApiRequest(event);
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

// Handle API requests by proxying to the Weather API
async function handleApiRequest(event) {
  const url = new URL(event.request.url);
  const path = url.pathname;
  const queryParams = url.searchParams;
  
  // Base WeatherAPI URL
  const BASE_URL = 'https://api.weatherapi.com/v1';
  
  // Handle different API endpoints
  if (path === '/api/weather') {
    const city = queryParams.get('city');
    const lat = queryParams.get('lat');
    const lon = queryParams.get('lon');
    
    let apiUrl;
    if (city) {
      apiUrl = `${BASE_URL}/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(city)}&aqi=yes`;
    } else if (lat && lon) {
      apiUrl = `${BASE_URL}/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&aqi=yes`;
    } else {
      return new Response(JSON.stringify({ error: 'City name or coordinates are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return await fetchFromApi(apiUrl);
  }
  
  if (path === '/api/forecast') {
    const city = queryParams.get('city');
    const lat = queryParams.get('lat');
    const lon = queryParams.get('lon');
    const days = queryParams.get('days') || 5;
    
    let apiUrl;
    if (city) {
      apiUrl = `${BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(city)}&days=${days}&aqi=no&alerts=no`;
    } else if (lat && lon) {
      apiUrl = `${BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=${days}&aqi=no&alerts=no`;
    } else {
      return new Response(JSON.stringify({ error: 'City name or coordinates are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return await fetchFromApi(apiUrl);
  }
  
  if (path === '/api/cities') {
    const q = queryParams.get('q');
    
    if (!q || q.length < 3) {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const apiUrl = `${BASE_URL}/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(q)}`;
    return await fetchFromApi(apiUrl);
  }
  
  // Handle unknown API endpoints
  return new Response(JSON.stringify({ error: 'API endpoint not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Simple static asset serving (replaces kv-asset-handler)
async function serveStaticAsset(event) {
  const url = new URL(event.request.url);
  let path = url.pathname;
  
  // Adjust path for the default route
  if (path === '/') {
    path = '/index.html';
  }
  
  // Try to fetch from Cloudflare's default asset handling
  try {
    // Fetch from default asset handler
    return await fetch(event.request);
  } catch (e) {
    // If the asset doesn't exist, return a 404
    return new Response(`Not Found: ${path}`, { 
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Helper function to fetch from the Weather API
async function fetchFromApi(apiUrl) {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    // Pass through the response from the Weather API
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=1800', // Cache for 30 minutes
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching from Weather API' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Event listeners
addEventListener('fetch', event => {
  event.respondWith(handleEvent(event));
}); 