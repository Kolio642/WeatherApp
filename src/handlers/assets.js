/**
 * Simple static asset serving without using kv-asset-handler
 * @param {FetchEvent} event - The fetch event
 * @returns {Response} - The response with the static asset
 */
export async function serveStaticAsset(event) {
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