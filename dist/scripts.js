// DOM elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const weatherContainer = document.getElementById('weather-container');
const cityNameElement = document.getElementById('city-name');
const weatherIcon = document.getElementById('weather-icon');
const temperatureElement = document.getElementById('temperature');
const weatherDescriptionElement = document.getElementById('weather-description');
const feelsLikeElement = document.getElementById('feels-like');
const humidityElement = document.getElementById('humidity');
const windElement = document.getElementById('wind');
const pressureElement = document.getElementById('pressure');
const sunriseElement = document.getElementById('sunrise');
const sunsetElement = document.getElementById('sunset');
const forecastElement = document.getElementById('forecast');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('error-message');
const loadingElement = document.getElementById('loading');
const celsiusBtn = document.getElementById('celsius');
const fahrenheitBtn = document.getElementById('fahrenheit');
const themeToggleBtn = document.getElementById('theme-toggle');
const autocompleteContainer = document.createElement('div');
autocompleteContainer.className = 'autocomplete-container';
document.querySelector('.search-container').appendChild(autocompleteContainer);

// API configuration - works both locally and when deployed
const API_BASE_URL = window.location.origin;

// Fallback for local testing without proper backend
function isLocalhost() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.startsWith('192.168.') ||
           window.location.hostname === '';
}

// Add a function to check if the API is available
async function checkApiAvailability() {
    try {
        // Try to fetch a city to see if API is working
        const testResponse = await fetch(`${API_BASE_URL}/api/cities?q=London`);
        if (!testResponse.ok) {
            throw new Error('API test failed');
        }
        
        // API is available, do nothing
        return true;
    } catch (error) {
        console.warn('API availability check failed:', error);
        
        // Show banner for Cloudflare deployment
        const banner = document.createElement('div');
        banner.className = 'api-warning-banner';
        banner.innerHTML = `
            <p><strong>Notice:</strong> The API endpoints need to be configured for this deployment.</p>
            <p>Please set up the WEATHER_API_KEY environment variable in your Cloudflare dashboard.</p>
            <button id="dismiss-banner">Dismiss</button>
        `;
        document.body.prepend(banner);
        
        // Add dismiss functionality
        document.getElementById('dismiss-banner').addEventListener('click', () => {
            banner.remove();
        });
        
        return false;
    }
}

// Variables
let currentTempCelsius = 0;
let currentTempFahrenheit = 0;
let currentFeelsLikeCelsius = 0;
let currentFeelsLikeFahrenheit = 0;
let currentUnit = 'celsius';
let autocompleteTimeout = null;
let forecastData = null;
let isLoading = false;

// Event listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
        // Clear autocomplete when searching
        autocompleteContainer.innerHTML = '';
    } else {
        showError('Please enter a city name');
    }
});

cityInput.addEventListener('keyup', (event) => {
    const searchText = cityInput.value.trim();
    
    if (event.key === 'Enter') {
        if (searchText) {
            getWeatherData(searchText);
            autocompleteContainer.innerHTML = '';
        } else {
            showError('Please enter a city name');
        }
    } else if (searchText.length >= 3) {
        clearTimeout(autocompleteTimeout);
        autocompleteTimeout = setTimeout(() => {
            getCityAutocomplete(searchText);
        }, 500); // Debounce for 500ms
    } else {
        autocompleteContainer.innerHTML = '';
    }
});

cityInput.addEventListener('blur', () => {
    // Delay hiding the autocomplete to allow for clicking on suggestions
    setTimeout(() => {
        autocompleteContainer.innerHTML = '';
    }, 200);
});

locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        showLoading();
        
        // Show feedback that we're attempting to get location
        showTemporaryMessage('Requesting your location...');
        
        // Improved geolocation options
        const geolocationOptions = {
            enableHighAccuracy: true,  // Try to get the most accurate position
            timeout: 15000,            // Increased timeout to 15 seconds (from 10)
            maximumAge: 0              // Force fresh location
        };
        
        navigator.geolocation.getCurrentPosition(
            // Success callback
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherDataByCoords(latitude, longitude);
            },
            // Error callback - enhanced with more detailed error messages and fallback
            (error) => {
                hideLoading();
                let errorMessage = 'Geolocation error: ';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied. Please check your browser settings and ensure location access is enabled for this site.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable. This could be due to:';
                        errorMessage += '<ul>';
                        errorMessage += '<li>Poor GPS signal or no GPS hardware</li>';
                        errorMessage += '<li>Being inside a building with poor reception</li>';
                        errorMessage += '<li>Network connectivity issues</li>';
                        errorMessage += '<li>Using a VPN that blocks location services</li>';
                        errorMessage += '</ul>';
                        errorMessage += 'Try searching for your city by name instead.';
                        showErrorWithFallback(errorMessage);
                        return; // Use special error handler with fallback
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out. Please try again or search for your city by name.';
                        break;
                    default:
                        errorMessage = `Error getting location: ${error.message}`;
                }
                
                showError(errorMessage);
            },
            geolocationOptions
        );
    } else {
        showError('Geolocation is not supported by your browser. Please search for your city by name instead.');
    }
});

celsiusBtn.addEventListener('click', () => {
    if (currentUnit !== 'celsius') {
        currentUnit = 'celsius';
        updateTemperatureDisplay();
        // Update forecast display as well
        const forecastTemps = document.querySelectorAll('.forecast-temp');
        forecastTemps.forEach((el, i) => {
            if (i < forecastData?.forecast?.forecastday?.length) {
                const day = forecastData.forecast.forecastday[i];
                el.textContent = `${Math.round(day.day.avgtemp_c)}°C`;
            }
        });
        toggleActiveClass(celsiusBtn, fahrenheitBtn);
        
        // Update ARIA attributes
        celsiusBtn.setAttribute('aria-pressed', 'true');
        fahrenheitBtn.setAttribute('aria-pressed', 'false');
    }
});

fahrenheitBtn.addEventListener('click', () => {
    if (currentUnit !== 'fahrenheit') {
        currentUnit = 'fahrenheit';
        updateTemperatureDisplay();
        // Update forecast display as well
        const forecastTemps = document.querySelectorAll('.forecast-temp');
        forecastTemps.forEach((el, i) => {
            if (i < forecastData?.forecast?.forecastday?.length) {
                const day = forecastData.forecast.forecastday[i];
                el.textContent = `${Math.round(day.day.avgtemp_f)}°F`;
            }
        });
        toggleActiveClass(fahrenheitBtn, celsiusBtn);
        
        // Update ARIA attributes
        fahrenheitBtn.setAttribute('aria-pressed', 'true');
        celsiusBtn.setAttribute('aria-pressed', 'false');
    }
});

// Dark mode toggle
themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Update toggle button text
    themeToggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    
    // Save preference to local storage
    localStorage.setItem('theme', newTheme);
});

// Functions
async function getWeatherData(city) {
    try {
        if (isLoading) return; // Prevent multiple simultaneous requests
        isLoading = true;
        
        showLoading();
        hideError();
        
        // Get current weather from our backend API
        const weatherResponse = await fetch(
            `${API_BASE_URL}/api/weather?city=${encodeURIComponent(city)}`
        );
        
        if (!weatherResponse.ok) {
            const errorData = await weatherResponse.json();
            throw new Error(errorData.error || `City not found or API error: ${weatherResponse.statusText}`);
        }
        
        const weatherData = await weatherResponse.json();
        
        // Get 5-day forecast from our backend API
        const forecastResponse = await fetch(
            `${API_BASE_URL}/api/forecast?city=${encodeURIComponent(city)}`
        );
        
        if (!forecastResponse.ok) {
            const errorData = await forecastResponse.json();
            throw new Error(errorData.error || `Forecast data not available: ${forecastResponse.statusText}`);
        }
        
        // Store forecast data globally to use when toggling units
        forecastData = await forecastResponse.json();
        
        displayWeatherData(weatherData, forecastData);
        
        // Save to local storage
        localStorage.setItem('lastCity', city);
    } catch (error) {
        console.error('Weather data error:', error);
        showError(error.message);
    } finally {
        hideLoading();
        isLoading = false;
    }
}

async function getWeatherDataByCoords(lat, lon) {
    try {
        if (isLoading) return; // Prevent multiple simultaneous requests
        isLoading = true;
        
        showLoading();
        hideError();
        
        // Get current weather from our backend API
        const weatherResponse = await fetch(
            `${API_BASE_URL}/api/weather?lat=${lat}&lon=${lon}`
        );
        
        if (!weatherResponse.ok) {
            const errorData = await weatherResponse.json();
            throw new Error(errorData.error || `Weather data not available: ${weatherResponse.statusText}`);
        }
        
        const weatherData = await weatherResponse.json();
        
        // Get 5-day forecast from our backend API
        const forecastResponse = await fetch(
            `${API_BASE_URL}/api/forecast?lat=${lat}&lon=${lon}`
        );
        
        if (!forecastResponse.ok) {
            const errorData = await forecastResponse.json();
            throw new Error(errorData.error || `Forecast data not available: ${forecastResponse.statusText}`);
        }
        
        // Store forecast data globally to use when toggling units
        forecastData = await forecastResponse.json();
        
        displayWeatherData(weatherData, forecastData);
        
        // Update input field with city name
        cityInput.value = weatherData.location.name;
    } catch (error) {
        console.error('Geolocation weather error:', error);
        showError(error.message);
    } finally {
        hideLoading();
        isLoading = false;
    }
}

function displayWeatherData(weatherData, forecastData) {
    try {
        // Check if weather data is valid
        if (!weatherData?.location || !weatherData?.current || !forecastData?.forecast?.forecastday) {
            throw new Error('Invalid weather data received');
        }
        
        // Display current weather using WeatherAPI.com data format
        const { location, current } = weatherData;
        
        cityNameElement.textContent = `${location.name}, ${location.country}`;
        
        // WeatherAPI.com provides icons with different format
        if (current.condition?.icon) {
            weatherIcon.src = `https:${current.condition.icon}`;
            weatherIcon.alt = current.condition.text || 'Weather icon';
        }
        
        // Store both temperature values
        currentTempCelsius = Math.round(current.temp_c);
        currentTempFahrenheit = Math.round(current.temp_f);
        currentFeelsLikeCelsius = Math.round(current.feelslike_c);
        currentFeelsLikeFahrenheit = Math.round(current.feelslike_f);
        
        updateTemperatureDisplay();
        
        weatherDescriptionElement.textContent = current.condition.text || '';
        
        humidityElement.textContent = `${current.humidity}%`;
        windElement.textContent = `${current.wind_kph.toFixed(1)} km/h`;
        pressureElement.textContent = `${current.pressure_mb} hPa`;
        
        // WeatherAPI.com includes astronomy data in the forecast endpoint
        const astronomy = forecastData.forecast.forecastday[0]?.astro;
        if (astronomy) {
            sunriseElement.textContent = astronomy.sunrise || 'N/A';
            sunsetElement.textContent = astronomy.sunset || 'N/A';
        }
        
        // Display forecast
        displayForecast(forecastData);
        
        // Show the weather container
        weatherContainer.classList.remove('hidden');
    } catch (error) {
        console.error('Display error:', error);
        showError('Error displaying weather data: ' + error.message);
    }
}

function displayForecast(forecastData) {
    try {
        forecastElement.innerHTML = '';
        
        // Check if forecast data exists
        if (!forecastData?.forecast?.forecastday || !Array.isArray(forecastData.forecast.forecastday)) {
            throw new Error('Invalid forecast data');
        }
        
        // WeatherAPI.com already provides daily forecasts
        const dailyForecasts = forecastData.forecast.forecastday;
        
        // Create forecast elements
        dailyForecasts.forEach(day => {
            if (!day?.date || !day?.day) return; // Skip invalid days
            
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            
            // Choose the right temperature based on currently selected unit
            const tempDisplay = currentUnit === 'celsius' 
                ? `${Math.round(day.day.avgtemp_c)}°C` 
                : `${Math.round(day.day.avgtemp_f)}°F`;
            
            forecastItem.innerHTML = `
                <div class="forecast-date">${dayName}, ${dateStr}</div>
                <img class="forecast-icon" src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
                <div class="forecast-temp">${tempDisplay}</div>
                <div class="forecast-desc">${day.day.condition.text}</div>
            `;
            
            forecastElement.appendChild(forecastItem);
        });
    } catch (error) {
        console.error('Forecast display error:', error);
        // Don't show an error to the user, just log it
        forecastElement.innerHTML = '<p>Forecast data unavailable</p>';
    }
}

function updateTemperatureDisplay() {
    if (currentUnit === 'celsius') {
        temperatureElement.textContent = `${currentTempCelsius}°C`;
        feelsLikeElement.textContent = `${currentFeelsLikeCelsius}°C`;
    } else {
        temperatureElement.textContent = `${currentTempFahrenheit}°F`;
        feelsLikeElement.textContent = `${currentFeelsLikeFahrenheit}°F`;
    }
}

function toggleActiveClass(activeBtn, inactiveBtn) {
    activeBtn.classList.add('active');
    inactiveBtn.classList.remove('active');
}

function showError(message) {
    errorMessage.textContent = message || 'An error occurred';
    errorContainer.classList.remove('hidden');
    weatherContainer.classList.add('hidden');
    hideLoading();
}

function hideError() {
    errorContainer.classList.add('hidden');
}

function showLoading() {
    loadingElement.style.display = 'flex';
    loadingElement.classList.remove('hidden');
    loadingElement.setAttribute('aria-busy', 'true');
    weatherContainer.classList.add('hidden');
    errorContainer.classList.add('hidden');
}

function hideLoading() {
    // Force hide the loading element
    loadingElement.style.display = 'none';
    loadingElement.classList.add('hidden');
    loadingElement.setAttribute('aria-busy', 'false');
    
    if (!errorContainer.classList.contains('hidden')) {
        // If there's an error, keep the weather container hidden
        weatherContainer.classList.add('hidden');
    } else {
        // If no error, show the weather container
        weatherContainer.classList.remove('hidden');
    }
}

async function getCityAutocomplete(search) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/cities?q=${encodeURIComponent(search)}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to get city suggestions');
        }
        
        const cities = await response.json();
        displayCitySuggestions(cities);
    } catch (error) {
        console.error('Autocomplete error:', error);
        autocompleteContainer.innerHTML = '';
    }
}

function displayCitySuggestions(cities) {
    autocompleteContainer.innerHTML = '';
    
    if (!cities || cities.length === 0) {
        return;
    }
    
    cities.forEach(city => {
        const suggestion = document.createElement('div');
        suggestion.className = 'suggestion';
        suggestion.textContent = city.name || '';
        
        suggestion.addEventListener('click', () => {
            cityInput.value = city.name;
            autocompleteContainer.innerHTML = '';
            getWeatherData(city.name);
        });
        
        autocompleteContainer.appendChild(suggestion);
    });
}

// New function to show temporary messages
function showTemporaryMessage(message) {
    const tempMessage = document.createElement('div');
    tempMessage.className = 'temp-message';
    tempMessage.textContent = message;
    tempMessage.style.position = 'fixed';
    tempMessage.style.bottom = '20px';
    tempMessage.style.left = '50%';
    tempMessage.style.transform = 'translateX(-50%)';
    tempMessage.style.backgroundColor = 'var(--primary-color)';
    tempMessage.style.color = 'white';
    tempMessage.style.padding = '10px 20px';
    tempMessage.style.borderRadius = '4px';
    tempMessage.style.zIndex = '1000';
    tempMessage.style.boxShadow = 'var(--shadow)';
    
    document.body.appendChild(tempMessage);
    
    // Remove after 3 seconds
    setTimeout(() => {
        tempMessage.style.opacity = '0';
        tempMessage.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            if (tempMessage.parentNode) {
                document.body.removeChild(tempMessage);
            }
        }, 500);
    }, 3000);
}

// Function to show error with a fallback option to search by city name
function showErrorWithFallback(errorMessage) {
    errorContainer.innerHTML = '';
    
    const errorParagraph = document.createElement('p');
    errorParagraph.id = 'error-message';
    errorParagraph.innerHTML = errorMessage;
    
    const suggestionDiv = document.createElement('div');
    suggestionDiv.className = 'error-suggestion';
    suggestionDiv.innerHTML = `
        <p>Popular cities:</p>
        <div class="city-suggestions">
            <button class="city-suggestion" data-city="London">London</button>
            <button class="city-suggestion" data-city="New York">New York</button>
            <button class="city-suggestion" data-city="Tokyo">Tokyo</button>
            <button class="city-suggestion" data-city="Paris">Paris</button>
            <button class="city-suggestion" data-city="Sydney">Sydney</button>
        </div>
    `;
    
    errorContainer.appendChild(errorParagraph);
    errorContainer.appendChild(suggestionDiv);
    errorContainer.classList.remove('hidden');
    weatherContainer.classList.add('hidden');
    
    // Add event listeners to city suggestion buttons
    const cityButtons = document.querySelectorAll('.city-suggestion');
    cityButtons.forEach(button => {
        button.addEventListener('click', () => {
            const city = button.dataset.city;
            cityInput.value = city;
            getWeatherData(city);
        });
    });
}

// Call the check when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Hide loading initially
    loadingElement.style.display = 'none';
    loadingElement.classList.add('hidden');
    
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
    
    // Check API availability before loading data
    const apiAvailable = await checkApiAvailability();
    
    // Load last searched city if API is available
    if (apiAvailable) {
        const lastCity = localStorage.getItem('lastCity');
        if (lastCity) {
            cityInput.value = lastCity;
            getWeatherData(lastCity);
        }
    }
}); 