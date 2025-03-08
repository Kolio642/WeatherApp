# Weather Website Assignment

## Overview

Create a responsive web application that allows users to query current weather conditions for any city. The application should have a clean, intuitive interface that displays relevant weather data without requiring page refreshes.

## Technical Requirements

### Frontend
- Build a responsive UI that works well on both desktop and mobile devices
- Implement a search box for city names with autocomplete suggestions if possible
- Display comprehensive weather information including:
  - Current temperature (with option to toggle between Celsius/Fahrenheit)
  - Weather conditions (sunny, cloudy, rainy, etc.) with appropriate icons
  - Humidity, wind speed, and direction
  - Precipitation chance
  - High/low temperatures
  - Sunrise/sunset times
  - 5-day forecast (if the chosen API provides this data)
- Implement proper error handling for invalid city names or API failures
- Add loading indicators during API requests
- Include geolocation support to automatically detect user's location (with permission)

### Backend
- Create a lightweight backend service to handle API requests
- Use server-side API calls to prevent exposing API keys in frontend code
- Implement proper caching mechanisms to limit redundant API calls (e.g., cache results for the same city for 10-30 minutes)
- Do NOT use databases as specified, rely only on temporary memory caching
- Include appropriate error handling and rate limiting to manage API usage

### API Integration
- Select a reliable weather API service. Recommended options:
  - [OpenWeatherMap](https://openweathermap.org/api)
  - [WeatherAPI](https://www.weatherapi.com/)
  - [AccuWeather](https://developer.accuweather.com/)
- Register for an API key and implement proper key management (environment variables)
- Study the chosen API's documentation to understand request limits, data format, and available endpoints

### Technical Stack (Recommendation)
- **Frontend**: React.js/Next.js with TypeScript for type safety
- **CSS Framework**: Tailwind CSS or styled-components for styling
- **Backend**: Node.js with Express or Next.js API routes
- **Deployment**: Vercel, Netlify, or similar platform for easy hosting

## Implementation Guidelines

1. **Project Setup**:
   - Initialize a new project with the chosen frontend framework
   - Set up the project structure with separate components for search, weather display, and forecast
   - Configure environment variables for API keys

2. **API Service Layer**:
   - Create a backend service to proxy requests to the weather API
   - Implement caching mechanisms to store recent requests
   - Set up proper error handling for API failures

3. **Frontend Components**:
   - Build a search component with form validation
   - Create weather display components that conditionally render based on data availability
   - Implement responsive design principles for all device sizes

4. **User Experience**:
   - Add loading states during API calls
   - Implement intelligent error messages
   - Save the last searched city in local storage for quick access on return visits
   - Add dark/light mode toggle based on user preference

5. **Testing**:
   - Write unit tests for key components
   - Test the application across different browsers and devices
   - Verify API error handling works correctly

## Deliverables

1. Complete source code in a GitHub repository
2. Deployment link to a working version of the application
3. README.md with:
   - Installation instructions
   - API key setup instructions
   - Features overview
   - Technologies used
   - Future improvements

## Technical Constraints

- Do NOT use any database (SQL, NoSQL, etc.)
- Each weather request must query the external API (with reasonable caching)
- The application must be responsive and work on mobile devices
- API keys must be properly secured (not exposed in frontend code)

## Bonus Features (If Time Permits)

- Weather maps visualization
- Historical weather data charts
- Weather alerts for severe conditions
- Unit tests for critical components
- Progressive Web App (PWA) functionality for offline access
- Internationalization support for multiple languages 