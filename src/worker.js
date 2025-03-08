import { handleApiRequest } from './handlers/api';
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

async function handleRequest(event) {
  const url = new URL(event.request.url);
  
  // Debug endpoint to check bindings
  if (url.pathname === '/debug') {
    const debugInfo = {
      url: event.request.url,
      kv_assets_available: typeof KV_ASSETS !== 'undefined',
      static_content_available: typeof __STATIC_CONTENT !== 'undefined',
      env_available: event.env !== undefined,
      env_properties: event.env ? Object.keys(event.env) : [],
      manifest_available: typeof __STATIC_CONTENT_MANIFEST !== 'undefined',
      assets_binding_available: event.env && event.env.ASSETS !== undefined
    };
    
    return new Response(JSON.stringify(debugInfo, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api')) {
    return handleApiRequest(event.request, event.env);
  }

  // Normalize the path - ensure / serves index.html
  const path = url.pathname === '/' || url.pathname === '' ? '/index.html' : url.pathname;
  const assetKey = path.startsWith('/') ? path.slice(1) : path;

  // Serve static assets
  try {
    // First try to serve using fetch-based API (preferred method)
    if (event.env && event.env.ASSETS) {
      console.log('Using ASSETS binding to fetch: ', path);
      try {
        return await event.env.ASSETS.fetch(event.request);
      } catch (fetchError) {
        console.error("Error using ASSETS.fetch:", fetchError);
        // Fall through to other methods
      }
    }
    
    // For local development with wrangler
    let options = {};
    let assetNamespace = null;
    
    // Check if we're in a production environment
    if (typeof KV_ASSETS !== 'undefined') {
      console.log('Using global KV_ASSETS');
      assetNamespace = KV_ASSETS;
      options = {
        ASSET_NAMESPACE: KV_ASSETS,
        ASSET_MANIFEST: __STATIC_CONTENT_MANIFEST,
        mapRequestToAsset: req => new Request(new URL(path, req.url), req)
      };
    } else if (event.env && event.env.KV_ASSETS) {
      console.log('Using env.KV_ASSETS');
      assetNamespace = event.env.KV_ASSETS;
      options = {
        ASSET_NAMESPACE: event.env.KV_ASSETS,
        ASSET_MANIFEST: event.env.__STATIC_CONTENT_MANIFEST,
        mapRequestToAsset: req => new Request(new URL(path, req.url), req)
      };
    } else if (typeof __STATIC_CONTENT !== 'undefined') {
      console.log('Using __STATIC_CONTENT');
      // Try to use the built-in __STATIC_CONTENT if available
      return await serveFromStaticContent(event.request, path, assetKey);
    } else {
      throw new Error('No static asset bindings are available');
    }
    
    if (!assetNamespace) {
      throw new Error('Asset namespace is unavailable');
    }
    
    console.log('Trying getAssetFromKV');
    try {
      return await getAssetFromKV(event, options);
    } catch (kvError) {
      // Log detailed error about getAssetFromKV
      console.error("getAssetFromKV error:", kvError);
      
      // Try direct access to KV namespace as a fallback
      console.log(`Attempting direct KV access for key "${assetKey}"`);
      try {
        const asset = await assetNamespace.get(assetKey, {type: 'text'});
        if (asset) {
          return new Response(asset, {
            headers: {
              'Content-Type': getContentType(path),
              'Cache-Control': 'public, max-age=3600'
            }
          });
        } else {
          console.error(`Asset not found in KV: ${assetKey}`);
        }
      } catch (directKvError) {
        console.error(`Direct KV access failed for key "${assetKey}":`, directKvError);
      }
      
      // If we got here and no asset was found, try __STATIC_CONTENT as a last resort
      if (typeof __STATIC_CONTENT !== 'undefined') {
        try {
          return await serveFromStaticContent(event.request, path, assetKey);
        } catch (fallbackError) {
          console.error("__STATIC_CONTENT fallback failed:", fallbackError);
        }
      }
      
      // Re-throw original error if all fallbacks fail
      throw kvError;
    }
  } catch (e) {
    console.error("Error serving static assets:", e);
    
    // Try fallback method if all other methods fail
    if (typeof __STATIC_CONTENT !== 'undefined') {
      try {
        return await serveFromStaticContent(event.request, path, assetKey);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    }
    
    // Generate a response with all available diagnostic information
    const errorDetail = e.message || 'Unknown error';
    const errorStack = e.stack || '';
    
    // Provide detailed diagnostic information
    const diagnosticInfo = {
      path,
      error: errorDetail,
      stack: errorStack,
      kv_assets_available: typeof KV_ASSETS !== 'undefined',
      static_content_available: typeof __STATIC_CONTENT !== 'undefined',
      env_available: event.env !== undefined,
      env_properties: event.env ? Object.keys(event.env) : [],
      assets_binding_available: event.env && event.env.ASSETS !== undefined
    };
    
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Error (${path})</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          pre { background: #f0f0f0; padding: 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>Error serving: ${path}</h1>
        <p>${errorDetail}</p>
        <h2>Diagnostic Information:</h2>
        <pre>${JSON.stringify(diagnosticInfo, null, 2)}</pre>
      </body>
      </html>`, 
      { 
        status: 404,
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      }
    );
  }
}

/**
 * Fallback function to serve assets directly from __STATIC_CONTENT
 */
async function serveFromStaticContent(request, path = null, assetKey = null) {
  const url = new URL(request.url);
  
  // Use provided path or get from URL
  path = path || url.pathname;
  
  // Adjust path for the default route
  if (path === '/' || path === '') {
    path = '/index.html';
  }
  
  // Use provided assetKey or calculate from path
  assetKey = assetKey || path.replace(/^\//, '');
  
  console.log(`Serving from __STATIC_CONTENT with key: ${assetKey}`);
  
  try {
    // Try to get the asset
    const asset = await __STATIC_CONTENT.get(assetKey);
    
    if (!asset) {
      // Special case for index.html
      if (assetKey === 'index.html') {
        console.error('Critical: index.html not found in __STATIC_CONTENT');
        
        // Try listing keys in __STATIC_CONTENT to see what's available
        try {
          const keys = await __STATIC_CONTENT.list();
          console.log('Available keys in __STATIC_CONTENT:', keys);
        } catch (listError) {
          console.error('Unable to list keys in __STATIC_CONTENT:', listError);
        }
      }
      
      // If the exact path is not found, try with index.html for directories
      if (path.endsWith('/')) {
        const indexAsset = await __STATIC_CONTENT.get(assetKey + 'index.html');
        if (indexAsset) {
          return new Response(indexAsset.body, {
            status: 200,
            headers: {
              'Content-Type': 'text/html;charset=UTF-8',
              'Cache-Control': 'public, max-age=3600'
            }
          });
        }
      }
      
      return new Response(`Not Found: ${path}`, { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // Determine content type based on file extension
    const contentType = getContentType(path);
    
    // Return the asset with appropriate headers
    return new Response(asset.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (e) {
    throw new Error(`Error serving ${path} from __STATIC_CONTENT: ${e.message}`);
  }
}

// Helper function to determine content type
function getContentType(path) {
  const ext = path.split('.').pop().toLowerCase();
  const types = {
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
  return types[ext] || 'text/plain';
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event));
}); 