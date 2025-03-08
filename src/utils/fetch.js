/**
 * Helper function to fetch from the Weather API
 * @param {string} apiUrl - The API URL to fetch from
 * @returns {Response} - The response from the API
 */
export async function fetchFromApi(apiUrl) {
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