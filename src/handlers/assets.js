import { HTTP_STATUS } from '../constants/api';

/**
 * Static asset handler for Cloudflare Workers Sites
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
    // Get the asset from KV namespace
    const asset = await event.env.KV_ASSETS.get(path.slice(1));
    
    if (!asset) {
      // If the exact path is not found, try with index.html
      if (path.endsWith('/')) {
        const indexAsset = await event.env.KV_ASSETS.get(path.slice(1) + 'index.html');
        if (indexAsset) {
          return new Response(indexAsset.body, {
            status: HTTP_STATUS.OK,
            headers: {
              'Content-Type': indexAsset.contentType || 'text/html;charset=UTF-8',
              'Cache-Control': 'public, max-age=3600'
            }
          });
        }
      }
      
      return new Response(`Not Found: ${path}`, { 
        status: HTTP_STATUS.NOT_FOUND,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Determine content type based on file extension
    const contentType = getContentType(path);
    
    // Return the asset with appropriate headers
    return new Response(asset.body, {
      status: HTTP_STATUS.OK,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (e) {
    return new Response(`Error serving ${path}: ${e.message}`, { 
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/**
 * Get content type based on file extension
 * @param {string} path - The file path
 * @returns {string} - The content type
 */
function getContentType(path) {
  const ext = path.split('.').pop().toLowerCase();
  const contentTypes = {
    'html': 'text/html;charset=UTF-8',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon'
  };
  
  return contentTypes[ext] || 'text/plain';
} 