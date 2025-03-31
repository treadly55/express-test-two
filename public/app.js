document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const cityInput = document.getElementById('cityInput');
    const searchButton = document.getElementById('searchButton');
    const currentWeatherDiv = document.getElementById('currentWeather');
    const forecastDiv = document.getElementById('forecast');
    const errorMessageDiv = document.getElementById('errorMessage');
    
    // Add event listeners
    searchButton.addEventListener('click', fetchWeatherData);
    cityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            fetchWeatherData();
        }
    });
    
    // Function to fetch weather data
    function fetchWeatherData() {
        const city = cityInput.value.trim();
        
        if (!city) {
            showError('Please enter a city name');
            return;
        }
        
        // Clear previous data and errors
        currentWeatherDiv.innerHTML = '<p>Loading...</p>';
        forecastDiv.innerHTML = '';
        errorMessageDiv.textContent = '';
        
        // Fetch current weather
        fetch(`/api/weather/current?city=${encodeURIComponent(city)}`)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Failed to fetch current weather');
                    });
                }
                return response.json();
            })
            .then(data => {
                displayCurrentWeather(data);
                
                // After successful current weather, fetch forecast
                return fetch(`/api/weather/forecast?city=${encodeURIComponent(city)}`);
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Failed to fetch forecast');
                    });
                }
                return response.json();
            })
            .then(data => {
                displayForecast(data);
            })
            .catch(error => {
                showError(error.message);
                currentWeatherDiv.innerHTML = '';
            });
    }
    
    // Function to display current weather
    function displayCurrentWeather(data) {
        const temp = Math.round(data.main.temp);
        const weatherDescription = data.weather[0].description;
        const cityName = data.name;
        const country = data.sys.country;
        
        currentWeatherDiv.innerHTML = `
            <h2>${cityName}, ${country}</h2>
            <p class="temperature">${temp}°C</p>
            <p class="description">${weatherDescription}</p>
            <p>Humidity: ${data.main.humidity}%</p>
            <p>Wind: ${data.wind.speed} m/s</p>
        `;
    }
    
    // Function to display forecast
    function displayForecast(data) {
        // Get one forecast per day (every 8th item, as it's 3-hour increments)
        const dailyForecasts = data.list.filter((item, index) => index % 8 === 0);
        
        forecastDiv.innerHTML = '';
        
        dailyForecasts.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const temp = Math.round(forecast.main.temp);
            const description = forecast.weather[0].description;
            
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <p>${dayName}</p>
                <p>${temp}°C</p>
                <p>${description}</p>
            `;
            
            forecastDiv.appendChild(forecastItem);
        });
    }
    
    // Function to show error message
    function showError(message) {
        errorMessageDiv.textContent = message;
    }
});