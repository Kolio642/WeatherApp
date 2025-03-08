# Weather Website

A responsive web application that allows users to check current weather conditions and forecasts for any city around the world. Built with modern web technologies and powered by WeatherAPI.com.

## Features

- **Live Weather Data**: Get real-time weather information from WeatherAPI.com
- **City Search**: Search for weather by city name with autocomplete suggestions
- **Geolocation**: Get weather for your current location
- **Detailed Weather Information**:
  - Current temperature with feels-like data
  - Weather conditions with descriptive icons
  - Humidity, wind speed, and pressure
  - Sunrise and sunset times
- **5-Day Forecast**: Plan ahead with a 5-day weather forecast
- **Temperature Units**: Toggle between Celsius and Fahrenheit
- **Dark Mode**: Switch between light and dark themes for comfortable viewing
- **Responsive Design**: Works on all device sizes (desktop, tablet, mobile)
- **Data Persistence**: Remembers your last searched city and theme preference
- **Server-side Caching**: Minimizes API requests and improves performance

## Screenshots

The application provides a clean, intuitive interface for checking weather conditions:

- Main weather display with current conditions
- 5-day forecast section
- Dark mode for evening use
- Mobile-responsive layout

## Setup and Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (included with Node.js)
- A free API key from [WeatherAPI.com](https://www.weatherapi.com/my/)

### Installation Steps

1. Clone this repository:
   ```
   git clone <repository-url>
   cd weather-website
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory (copy from `.env.example`):
   ```
   cp .env.example .env
   ```

4. Replace the API key in the `.env` file with your own WeatherAPI.com key

5. Start the development server:
   ```
   npm run dev
   ```
   or run `.\start.bat` on Windows

6. Open your browser and navigate to:
   ```
   http://localhost:4000
   ```

## How to Get a WeatherAPI.com API Key

1. Go to [WeatherAPI.com](https://www.weatherapi.com/my/) and create a free account
2. After signing up, verify your email address
3. Navigate to your dashboard and copy your API key
4. Open the `.env` file and replace `your_api_key_here` with your actual API key

## Using the Application

1. **Search for a City**:
   - Enter a city name in the search box
   - Suggestions will appear after typing 3 characters
   - Click on a suggestion or press Enter to search

2. **Use Your Current Location**:
   - Click the location icon (📍) to get weather for your current position
   - Allow location access when prompted by your browser

3. **Toggle Temperature Units**:
   - Switch between Celsius and Fahrenheit using the temperature unit buttons
   - All temperature values update automatically

4. **View Forecast**:
   - Scroll down to see the 5-day weather forecast
   - Each day shows average temperature and conditions

5. **Change Theme**:
   - Toggle between light and dark mode using the theme button (🌙/☀️)
   - Your preference is remembered for future visits

## Troubleshooting

### Common Issues:

1. **Server Won't Start**:
   - Check if another process is using port 4000
   - Try changing the PORT value in .env file
   - Ensure Node.js is properly installed

2. **API Key Issues**:
   - Verify your WeatherAPI.com key is active
   - Check the .env file format is correct
   - Make sure you're connected to the internet

3. **Geolocation Not Working**:
   - Allow location access in your browser settings
   - Try using a different browser if problems persist
   - Some corporate networks may block geolocation

4. **Loading Issues**:
   - Clear your browser cache
   - Check your internet connection
   - Verify the WeatherAPI.com is not down

## Implementation Details

### Frontend
- Pure HTML, CSS, and JavaScript
- Responsive design with CSS variables
- Autocomplete for city search
- Geolocation support
- Dark/light mode theme toggle
- Local storage for user preferences

### Backend
- Node.js with Express server
- Server-side API proxy to protect API key
- Caching with node-cache to minimize API requests (30 minutes TTL for weather data)

### API Integration
- WeatherAPI.com for weather data
- Current weather endpoint
- Forecast endpoint
- Location autocomplete search

## Browser Compatibility

The application is compatible with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Future Improvements

- Weather maps visualization
- Historical weather data charts
- Weather alerts for severe conditions
- Unit tests for critical components
- Progressive Web App (PWA) functionality for offline access
- Internationalization support for multiple languages

## License

MIT 