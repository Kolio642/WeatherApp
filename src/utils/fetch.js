import { HTTP_STATUS } from '../constants/api';

/**
 * Helper function to fetch from the Weather API
 * @param {string} apiUrl - The API URL to fetch from
 * @returns {Response} - The response from the API
 */
export async function fetchFromApi(apiUrl) {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    // Check if the API returned an error
    if (!response.ok) {
      console.error('Weather API error:', data);
      return new Response(JSON.stringify({ 
        error: 'Weather API error', 
        details: data.error ? data.error.message : 'Unknown error' 
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Pass through the successful response from the Weather API
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=1800' // Cache for 30 minutes
      }
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return new Response(JSON.stringify({ 
      error: 'Error fetching from Weather API',
      details: error.message
    }), {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      headers: { 
        'Content-Type': 'application/json'
      }
    });
  }
} 