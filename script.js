const apiKey = 'ef9bd537117990e76047052a1226d814'; 

// Add event listeners to buttons and dropdown
document.getElementById('searchBtn').addEventListener('click', fetchWeather);
document.getElementById('currentLocation').addEventListener('click', fetchCurrentLocationWeather);
document.getElementById('themeToggle').addEventListener('click', toggleTheme);
document.getElementById('recentCitiesSelect').addEventListener('change', () => {
    const selectedCity = document.getElementById('recentCitiesSelect').value;
    if (selectedCity) {
        getWeather(selectedCity);
    }
});
document.addEventListener('DOMContentLoaded', () => {
    populateDropdown();
});

// Toggle between light and dark modes
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    const themeToggle = document.getElementById('themeToggle');
    body.classList.toggle('light-mode');
    if (body.classList.contains('light-mode')) {
        themeIcon.innerText = '☀️';
        themeToggle.innerHTML = `<span id="themeIcon">☀️</span> Light Mode`;
    } else {
        themeIcon.innerText = '🌙';
        themeToggle.innerHTML = `<span id="themeIcon">🌙</span> Dark Mode`;
    }
}

// Save city to local storage and update the dropdown
function saveCityToLocalStorage(city) {
    let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    
    // Add city to the beginning of the list, remove duplicates, and limit to 5 cities
    cities = [city, ...cities.filter(c => c !== city)].slice(0, 5);
    localStorage.setItem('recentCities', JSON.stringify(cities));
    populateDropdown(cities);
}

// Populate the recent cities dropdown
function populateDropdown(cities = JSON.parse(localStorage.getItem('recentCities')) || []) {
    const select = document.getElementById('recentCitiesSelect');
    select.innerHTML = '<option disabled selected>Recent City</option>'; 

    // Add each city to the dropdown
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        select.appendChild(option);
    });

    // Show or hide the dropdown based on the number of cities
    if (cities.length > 0) {
        select.classList.remove('hidden');
    } else {
        select.classList.add('hidden');
    }
}

// Fetch weather data for a given city
function fetchWeather() {
    const city = document.getElementById('cityInput').value;
    if (city) {
        getWeather(city);
        saveCityToLocalStorage(city);
    } else {
        alert('Please enter a city name');
    }
}

// Fetch weather data based on the user's current location
function fetchCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherByCoordinates(lat, lon);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// Fetch weather data from the API using a city name
function getWeather(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => updateWeather(data))
        .catch(error => handleError(error));
}

// Fetch weather data from the API using latitude and longitude
function getWeatherByCoordinates(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => updateWeather(data))
        .catch(error => handleError(error));
}

// Update the weather display with data from the API
function updateWeather(data) {
    document.getElementById('city').innerText = data.name;
    document.getElementById('date').innerText = new Date().toLocaleDateString();
    document.getElementById('temp').innerText = `${Math.round(data.main.temp)}°C`;
    document.getElementById('description').innerText = data.weather[0].description;
    document.getElementById('feelsLike').innerText = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById('humidity').innerText = `${data.main.humidity}%`;
    document.getElementById('windSpeed').innerText = `${data.wind.speed} km/h`;
    document.getElementById('pressure').innerText = `${data.main.pressure} hPa`;
    

    // Fetch and update the 5-day forecast
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${data.name}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => updateForecast(data))
        .catch(error => handleError(error));
}

// Update the hourly and 5-day forecast displays with data from the API
function updateForecast(data) {
    const hourlyContainer = document.getElementById('hourly');
    const forecastContainer = document.getElementById('forecast');
    hourlyContainer.innerHTML = '';
    forecastContainer.innerHTML = '';

    // Display hourly forecast (up to 6 hours)
    data.list.slice(0, 6).forEach(forecast => {
        const hourlyElement = document.createElement('div');
        hourlyElement.className = 'bg-gray-700 p-4 rounded shadow text-center';
        hourlyElement.innerHTML = `
            <div class="text-lg font-bold">${new Date(forecast.dt_txt).getHours()}:00</div>
            <div class="text-2xl font-bold">${Math.round(forecast.main.temp)}°C</div>
            <div class="text-sm">${forecast.weather[0].description}</div>
        `;
        hourlyContainer.appendChild(hourlyElement);
    });

    // Display 5-day forecast (one forecast per day)
    for (let i = 0; i < 5; i++) {
        const forecastElement = document.createElement('div');
        forecastElement.className = 'bg-gray-700 p-4 rounded shadow text-center';
        const forecastDay = data.list[i * 8]; // Each day has 8 data points (every 3 hours)
        forecastElement.innerHTML = `
            <div class="text-lg font-bold">${new Date(forecastDay.dt_txt).toLocaleDateString()}</div>
            <div class="text-2xl font-bold">${Math.round(forecastDay.main.temp)}°C</div>
            <div class="text-sm">${forecastDay.weather[0].description}</div>
        `;
        forecastContainer.appendChild(forecastElement);
    }
}

// Handle errors during data fetching
function handleError(error) {
    console.error('Error fetching weather data:', error);
    alert('Failed to retrieve weather data. Please try again later.');
}
