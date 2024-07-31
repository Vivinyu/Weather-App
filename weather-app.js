const API_KEY = '517312147ee30a756992ca854f7e4f40';
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const searchHistory = document.getElementById('search-history');
const currentWeather = document.getElementById('current-weather');
const forecastCards = document.getElementById('forecast-cards');

searchForm.addEventListener('submit', handleSearch);

function handleSearch(e) {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
        addToSearchHistory(city);
        cityInput.value = '';
    }
}

function getWeatherData(city) {
    const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;

    fetch(geocodingUrl)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0];
                const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
                return fetch(weatherUrl);
            } else {
                throw new Error('City not found');
            }
        })
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data);
            displayForecast(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while fetching weather data, this city is not found. Please try again.');
        });
}

function displayCurrentWeather(data) {
    const current = data.list[0];
    const cityName = data.city.name;
    const date = new Date(current.dt * 1000).toLocaleDateString();
    const iconUrl = `http://openweathermap.org/img/wn/${current.weather[0].icon}.png`;
    const temp = Math.round(current.main.temp);
    const humidity = current.main.humidity;
    const windSpeed = current.wind.speed;

    console.log('Current Weather Data:', current);

    currentWeather.innerHTML = `
        <h2>${cityName}</h2>
        <p>${date}</p>
        <img src="${iconUrl}" alt="Weather icon">
        <p>Temperature: ${temp}°C</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind Speed: ${windSpeed} m/s</p>
    `;
}

function displayForecast(data) {
    forecastCards.innerHTML = '';
    for (let i = 1; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const date = new Date(forecast.dt * 1000).toLocaleDateString();
        const iconUrl = `http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;
        const temp = Math.round(forecast.main.temp);
        const humidity = forecast.main.humidity;
        const windSpeed = forecast.wind.speed;

        const forecastCard = document.createElement('div');
        forecastCard.classList.add('forecast-card');
        forecastCard.innerHTML = `
            <p>${date}</p>
            <img src="${iconUrl}" alt="Weather icon">
            <p>Temp: ${temp}°C</p>
            <p>Humidity: ${humidity}%</p>
            <p>Wind: ${windSpeed} m/s</p>
        `;
        forecastCards.appendChild(forecastCard);
    }
}

function addToSearchHistory(city) {
    const historyItem = document.createElement('div');
    historyItem.classList.add('history-item');
    historyItem.textContent = city;
    historyItem.addEventListener('click', () => getWeatherData(city));
    searchHistory.prepend(historyItem);

    // Save to localStorage
    let history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
    history.unshift(city);
    history = [...new Set(history)].slice(0, 5); // Keep only unique cities, max 5
    localStorage.setItem('weatherSearchHistory', JSON.stringify(history));
}

// Load search history from localStorage
function loadSearchHistory() {
    const history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
    history.forEach(city => {
        const historyItem = document.createElement('div');
        historyItem.classList.add('history-item');
        historyItem.textContent = city;
        historyItem.addEventListener('click', () => getWeatherData(city));
        searchHistory.appendChild(historyItem);
    });
}

loadSearchHistory();