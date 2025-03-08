/**
 * Modified static asset handler that doesn't rely on KV namespace
 * Instead, uses standard fetch against __STATIC_CONTENT
 * @param {FetchEvent} event - The fetch event
 * @returns {Response} - The response with the static asset
 */
export async function serveStaticAsset(event) {
  const url = new URL(event.request.url);
  let path = url.pathname;
  
  // Adjust path for the default route
  if (path === '/' || path === '') {
    path = '/index.html';
  }
  
  try {
    // Try to fetch the asset directly from the worker's built-in asset storage
    const response = await fetch(new Request(url.origin + path, {
      headers: event.request.headers,
      method: 'GET'
    }));
    
    if (response.status === 404) {
      return new Response(`Not Found: ${path}`, { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // Add appropriate caching headers
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'public, max-age=3600');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  } catch (e) {
    // If there was an error, return a 500
    return new Response(`Error serving ${path}: ${e.message}`, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
} 