import { handleApiRequest } from './handlers/api';

async function handleRequest(request, env) {
  const url = new URL(request.url);
  
  // Handle API requests
  if (url.pathname.startsWith('/api')) {
    return handleApiRequest(request, env);
  }

  // Serve static assets using the ASSETS binding
  try {
    // Try to serve the asset directly using the ASSETS binding
    return env.ASSETS.fetch(request);
  } catch (e) {
    return new Response('Internal Error: ' + e.message, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
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
  event.respondWith(handleRequest(event.request, event.env));
}); 