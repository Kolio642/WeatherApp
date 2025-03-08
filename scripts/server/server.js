const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Cache setup (TTL: 30 minutes)
const weatherCache = new NodeCache({ stdTTL: 1800 });

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, '/')));

// Environment variables
const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'https://api.weatherapi.com/v1';

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API proxy endpoints
app.get('/api/weather', async (req, res) => {
    try {
        const { city, lat, lon } = req.query;
        let cacheKey;
        let apiUrl;

        if (city) {
            cacheKey = `weather_city_${city}`;
            apiUrl = `${BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=yes`;
        } else if (lat && lon) {
            // Validate coordinates
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);
            
            if (isNaN(latitude) || isNaN(longitude) || 
                latitude < -90 || latitude > 90 || 
                longitude < -180 || longitude > 180) {
                return res.status(400).json({ 
                    error: 'Invalid coordinates. Latitude must be between -90 and 90, and longitude between -180 and 180.' 
                });
            }
            
            cacheKey = `weather_coords_${lat}_${lon}`;
            apiUrl = `${BASE_URL}/current.json?key=${API_KEY}&q=${lat},${lon}&aqi=yes`;
        } else {
            return res.status(400).json({ error: 'City name or coordinates are required' });
        }

        // Check cache
        const cachedData = weatherCache.get(cacheKey);
        if (cachedData) {
            console.log('Cache hit for:', cacheKey);
            return res.json(cachedData);
        }

        // Fetch from API
        console.log('Cache miss for:', cacheKey);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('WeatherAPI error:', errorData);
            
            // Provide more helpful error messages
            if (lat && lon && response.status === 400) {
                throw new Error('Location not found with the provided coordinates. The coordinates may be in an uninhabited area or ocean.');
            }
            
            throw new Error(errorData.error?.message || `WeatherAPI error: ${response.statusText}`);
        }
        
        const weatherData = await response.json();
        
        // Store in cache
        weatherCache.set(cacheKey, weatherData);
        
        res.json(weatherData);
    } catch (error) {
        console.error('Weather API error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/forecast', async (req, res) => {
    try {
        const { city, lat, lon, days = 5 } = req.query;
        let cacheKey;
        let apiUrl;

        if (city) {
            cacheKey = `forecast_city_${city}_${days}`;
            apiUrl = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=${days}&aqi=no&alerts=no`;
        } else if (lat && lon) {
            // Validate coordinates
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);
            
            if (isNaN(latitude) || isNaN(longitude) || 
                latitude < -90 || latitude > 90 || 
                longitude < -180 || longitude > 180) {
                return res.status(400).json({ 
                    error: 'Invalid coordinates. Latitude must be between -90 and 90, and longitude between -180 and 180.' 
                });
            }
            
            cacheKey = `forecast_coords_${lat}_${lon}_${days}`;
            apiUrl = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=${days}&aqi=no&alerts=no`;
        } else {
            return res.status(400).json({ error: 'City name or coordinates are required' });
        }

        // Check cache
        const cachedData = weatherCache.get(cacheKey);
        if (cachedData) {
            console.log('Cache hit for:', cacheKey);
            return res.json(cachedData);
        }

        // Fetch from API
        console.log('Cache miss for:', cacheKey);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `WeatherAPI error: ${response.statusText}`);
        }
        
        const forecastData = await response.json();
        
        // Store in cache
        weatherCache.set(cacheKey, forecastData);
        
        res.json(forecastData);
    } catch (error) {
        console.error('Forecast API error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/cities', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.length < 3) {
            return res.json([]);
        }
        
        const cacheKey = `cities_${q}`;
        
        // Check cache
        const cachedData = weatherCache.get(cacheKey);
        if (cachedData) {
            console.log('Cache hit for:', cacheKey);
            return res.json(cachedData);
        }
        
        // WeatherAPI.com has a dedicated search/autocomplete API
        const apiUrl = `${BASE_URL}/search.json?key=${API_KEY}&q=${encodeURIComponent(q)}`;
        
        console.log('Cache miss for:', cacheKey);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `WeatherAPI error: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Format the response to match our expected structure
        const cities = data.map(item => ({
            name: `${item.name}, ${item.country}`,
            id: item.id
        }));
        
        // Store in cache (for 1 hour)
        weatherCache.set(cacheKey, cities, 3600);
        
        res.json(cities);
    } catch (error) {
        console.error('Cities API error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 