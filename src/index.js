// Import required modules
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables from .env file
dotenv.config();

// Create Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Get API key from environment variables
const WEATHER_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Middleware setup
app.use(express.json());  // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded request bodies

// CORS Configuration
// This prevents "Same-Origin Policy" errors when your frontend tries to call your backend
app.use(cors({
  origin: '*',  // In production, you should specify your frontend domain
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Simple health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Weather API is running' });
});

// Weather endpoint - Current weather
app.get('/api/weather/current', async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }
    
    const response = await axios.get(`${WEATHER_API_BASE_URL}/weather`, {
      params: {
        q: city,
        units: 'metric',  // Use metric units (Celsius)
        appid: WEATHER_API_KEY
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching current weather:', error.response?.data || error.message);
    
    // Return appropriate error message
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      message: error.message 
    });
  }
});

// Weather endpoint - 5-day forecast
app.get('/api/weather/forecast', async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }
    
    const response = await axios.get(`${WEATHER_API_BASE_URL}/forecast`, {
      params: {
        q: city,
        units: 'metric',
        appid: WEATHER_API_KEY
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching forecast:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch forecast data',
      message: error.message 
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', message: 'The requested resource does not exist' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Weather Dashboard server running on port ${PORT}`);
  console.log(`Access the API at http://localhost:${PORT}/api/health`);
  console.log(`Access the frontend at http://localhost:${PORT}`);
  
  // Ladybug fact
  console.log('\nFun Fact: Ladybugs can eat up to 5,000 aphids in their lifetime, making them excellent natural pest controllers for gardeners!');
});