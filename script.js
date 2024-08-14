const apiKey = 'ef9bd537117990e76047052a1226d814'; 


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


function saveCityToLocalStorage(city) {
    let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    
    cities = [city, ...cities.filter(c => c !== city)].slice(0, 5);
    localStorage.setItem('recentCities', JSON.stringify(cities));
    populateDropdown(cities);
}


function populateDropdown(cities = JSON.parse(localStorage.getItem('recentCities')) || []) {
    const select = document.getElementById('recentCitiesSelect');
    select.innerHTML = '<option disabled selected>Recent City</option>'; 

   
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        select.appendChild(option);
    });

   
    if (cities.length > 0) {
        select.classList.remove('hidden');
    } else {
        select.classList.add('hidden');
    }
}


function fetchWeather() {
    const city = document.getElementById('cityInput').value;
    if (city) {
        getWeather(city);
        saveCityToLocalStorage(city);
    } else {
        alert('Please enter a city name');
    }
}


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


function getWeather(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => updateWeather(data))
        .catch(error => handleError(error));
}

function getWeatherByCoordinates(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => updateWeather(data))
        .catch(error => handleError(error));
}


function updateWeather(data) {
    document.getElementById('city').innerText = data.name;
    document.getElementById('date').innerText = new Date().toLocaleDateString();
    document.getElementById('temp').innerText = `${Math.round(data.main.temp)}°C`;
    document.getElementById('description').innerText = data.weather[0].description;
    document.getElementById('feelsLike').innerText = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById('humidity').innerText = `${data.main.humidity}%`;
    document.getElementById('windSpeed').innerText = `${data.wind.speed} km/h`;
    document.getElementById('pressure').innerText = `${data.main.pressure} hPa`;
    document.getElementById('uvIndex').innerText = 'N/A'; 


    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${data.name}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => updateForecast(data))
        .catch(error => handleError(error));
}


function updateForecast(data) {
    const hourlyContainer = document.getElementById('hourly');
    const forecastContainer = document.getElementById('forecast');
    hourlyContainer.innerHTML = '';
    forecastContainer.innerHTML = '';


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

 
    for (let i = 0; i < 5; i++) {
        const forecastElement = document.createElement('div');
        forecastElement.className = 'bg-gray-700 p-4 rounded shadow text-center';
        const forecastDay = data.list[i * 8];
        forecastElement.innerHTML = `
            <div class="text-lg font-bold">${new Date(forecastDay.dt_txt).toLocaleDateString()}</div>
            <div class="text-2xl font-bold">${Math.round(forecastDay.main.temp)}°C</div>
            <div class="text-sm">${forecastDay.weather[0].description}</div>
        `;
        forecastContainer.appendChild(forecastElement);
    }
}

function handleError(error) {
    console.error('Error fetching weather data:', error);
    alert('Failed to retrieve weather data. Please try again later.');
}
