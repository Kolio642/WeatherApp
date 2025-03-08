addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Handle API requests
  const url = new URL(request.url)
  if (url.pathname.startsWith('/api/')) {
    // You'll need to implement API proxying in Cloudflare Workers
    // This is a simplified version - you'd need to add more logic
    return new Response(JSON.stringify({ error: 'API endpoints need configuration in Workers' }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Serve static files by default
  return fetch(request)
} 