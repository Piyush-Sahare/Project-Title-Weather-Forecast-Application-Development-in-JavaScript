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
        select.style.display = 'block'; 
    } else {
        select.style.display = 'none';
    }
}

// Fetch weather data for a given city
function fetchWeather() {
    const city = document.getElementById('cityInput').value;
    if (city) {
        getWeather(city);
    }
}

// Fetch weather data for the current location
function fetchCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`)
                .then(response => response.json())
                .then(data => {
                    updateWeather(data);
                    saveCityToLocalStorage(data.name);
                })
                .catch(error => handleError(error));
        }, error => {
            console.error('Error fetching current location:', error);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// Fetch weather data for a city from the API
function getWeather(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                updateWeather(data);
                saveCityToLocalStorage(data.name);
            } else {
                alert('City not found!');
            }
        })
        .catch(error => handleError(error));
}

// Update the weather display with new data
function updateWeather(data) {
    document.getElementById('city').innerText = data.name;
    document.getElementById('date').innerText = new Date().toLocaleDateString();
    document.getElementById('temp').innerText = `${Math.round(data.main.temp)}°C`;
    document.getElementById('description').innerHTML = `
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].description}">
        ${data.weather[0].description}`;
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

// Update the 5-day forecast display
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
            <div class="text-sm">
                <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
                ${forecast.weather[0].description}
            </div>`;
        hourlyContainer.appendChild(hourlyElement);
    });

    // Display 5-day forecast (one forecast per day)
    for (let i = 0; i < 5; i++) {
        const forecastElement = document.createElement('div');
        forecastElement.className = 'bg-gray-700 p-4 rounded shadow text-center';
        const forecastDay = data.list[i * 8];
        forecastElement.innerHTML = `
            <div class="text-lg font-bold">${new Date(forecastDay.dt_txt).toLocaleDateString()}</div>
            <div class="text-2xl font-bold">${Math.round(forecastDay.main.temp)}°C</div>
            <div class="text-sm">
                <img src="https://openweathermap.org/img/wn/${forecastDay.weather[0].icon}.png" alt="${forecastDay.weather[0].description}">
                ${forecastDay.weather[0].description}
            </div>`;
        forecastContainer.appendChild(forecastElement);
    }
}

// Handle errors and display an alert message
function handleError(error) {
    console.error('Error:', error);
    alert('An error occurred while fetching the weather data.');
}
