const express = require('express');
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;
const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'https://api.weatherapi.com/v1';

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, '/')));

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Weather API endpoint
app.get('/api/weather', async (req, res) => {
    try {
        const { city, lat, lon } = req.query;
        
        let queryParam;
        if (city) {
            queryParam = `q=${encodeURIComponent(city)}`;
        } else if (lat && lon) {
            queryParam = `q=${lat},${lon}`;
        } else {
            return res.status(400).json({ error: 'City name or coordinates are required' });
        }
        
        const response = await fetch(`${BASE_URL}/current.json?key=${API_KEY}&${queryParam}&aqi=yes`);
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        console.error('Weather API error:', error);
        res.status(500).json({ error: 'Error fetching weather data' });
    }
});

// Forecast API endpoint
app.get('/api/forecast', async (req, res) => {
    try {
        const { city, lat, lon, days = 5 } = req.query;
        
        let queryParam;
        if (city) {
            queryParam = `q=${encodeURIComponent(city)}`;
        } else if (lat && lon) {
            queryParam = `q=${lat},${lon}`;
        } else {
            return res.status(400).json({ error: 'City name or coordinates are required' });
        }
        
        const response = await fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&${queryParam}&days=${days}&aqi=no&alerts=no`);
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        console.error('Forecast API error:', error);
        res.status(500).json({ error: 'Error fetching forecast data' });
    }
});

// Search cities API endpoint
app.get('/api/cities', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.length < 3) {
            return res.json([]);
        }
        
        const response = await fetch(`${BASE_URL}/search.json?key=${API_KEY}&q=${encodeURIComponent(q)}`);
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        console.error('Cities API error:', error);
        res.status(500).json({ error: 'Error searching for cities' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Press Ctrl+C to stop');
}); 