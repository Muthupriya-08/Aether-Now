const apiKey = '73c650faa4bb22f346018c4efdd8ecb3'; // Replace with your actual API key
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
let main;

// Select HTML elements
const locationInput = document.getElementById('location');
const getWeatherButton = document.getElementById('get-weather');
const weatherDetails = document.getElementById('weather-details');
const forecastContainer = document.getElementById('forecast');

// Add event listener to button
getWeatherButton.addEventListener('click', () => {
    const location = locationInput.value.trim();

    if (location) {
        fetchWeatherData(location);
        fetchWeatherForecast(location); // Fetch 5-day forecast for the entered city
    } else {
        alert('Please enter a location!');
    }
});

// Function to fetch weather data
function fetchWeatherData(location) {
    weatherDetails.innerHTML = '<p>Loading...</p>';
    const url = `${apiUrl}?q=${location}&appid=${apiKey}&units=metric`; // `units=metric` for Celsius

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
            
        })
        .then(data => {
            const weatherCondition = data.weather[0].main; // Example: 'Clear', 'Rain', etc.
            getWeatherRecommendation(weatherCondition);
            displayWeatherData(data);
        })
        .catch(error => {
            weatherDetails.innerHTML = `
                <p style="color: red; font-weight: bold;">Oops! Something went wrong: ${error.message}</p>
            `;
        });
    locationInput.value = '';
}

// Function to fetch weather forecast for the next 5 days
function fetchWeatherForecast(city) {
    forecastContainer.innerHTML = '<p>Loading forecast...</p>';
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`; 

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const forecast = data.list; // List of 3-hour intervals
            const groupedForecast = groupForecastByDay(forecast);
            displayForecast(groupedForecast);
        })
        .catch(error => {
            forecastContainer.innerHTML = `
                <p style="color: red; font-weight: bold;">Oops! Something went wrong: ${error.message}</p>
            `;
        });
}

// Function to group forecast data by day
function groupForecastByDay(forecast) {
    const grouped = [];

    forecast.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

        if (!grouped[dayOfWeek]) {
            grouped[dayOfWeek] = [];
        }

        grouped[dayOfWeek].push(item);
    });

    return grouped;
}

// Function to display weather data
function displayWeatherData(data) {
    const { name, main, weather, wind, sys } = data;
    const iconCode = weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

    changeBackground(weather[0].description); // Pass the weather description to change the background
    
    let textClass = '';
    if (weather[0].description.includes('clear')) {
        textClass = 'sunny';
    } else if (weather[0].description.includes('rain')) {
        textClass = 'rainy';
    } else if (weather[0].description.includes('cloud')) {
        textClass = 'cloudy';
    }
    weatherDetails.innerHTML = `
        <div class="weather-detail">
            <h3>${name}</h3>
            <img src="${iconUrl}" alt="${weather[0].description}" />
            <p>Temperature: ${main.temp}°C</p>
            <p>Humidity: ${main.humidity}%</p>
            <p>Wind Speed: ${wind.speed} m/s</p>
            <p>Pressure: ${main.pressure} hPa</p>
            <p>Condition: ${weather[0].description}</p>
            <p>Sunrise: ${new Date(sys.sunrise * 1000).toLocaleTimeString()}</p>
            <p>Sunset: ${new Date(sys.sunset * 1000).toLocaleTimeString()}</p>
        </div>
    `;
    document.querySelector('.weather-detail').classList.add('show');
}

// Function to change the background based on weather description
function changeBackground(weatherDescription) {
    const body = document.body;

    if (weatherDescription.includes("clear")) {
        body.style.backgroundImage = "url('clear-sky.jpg')";
    } else if (weatherDescription.includes("cloud")) {
        body.style.backgroundImage = "url('cloudy-sky.jpg')";
    } else if (weatherDescription.includes("rain")) {
        body.style.backgroundImage = "url('rainy-sky.jpg')";
    } else if (weatherDescription.includes("snow")) {
        body.style.backgroundImage = "url('snowy-sky.jpg')";
    } else {
        body.style.backgroundImage = "url('default-sky.jpg')";
    }

    body.style.backgroundSize = "cover";
    body.style.backgroundPosition = "center";
    body.style.backgroundAttachment = "fixed";
}

// Function to display the forecast
function displayForecast(groupedForecast) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.classList.add('show'); // Add the class to trigger slide-in animation
    Object.keys(groupedForecast).forEach(day => {
        const dayData = groupedForecast[day];
        const minTemp = Math.min(...dayData.map(item => item.main.temp));
        const maxTemp = Math.max(...dayData.map(item => item.main.temp));
        const weatherCondition = dayData[0].weather[0].description;

        const dayElement = document.createElement('div');
        dayElement.className = 'forecast-day';

        dayElement.innerHTML = `
            <h3>${day}</h3>
            <p>${weatherCondition}</p>
            <p>Min Temp: ${minTemp}°C</p>
            <p>Max Temp: ${maxTemp}°C</p>
        `;

        forecastContainer.appendChild(dayElement);
    });
}
// Modify fetchWeatherData to include weather alerts
function fetchWeatherData(location) {
    weatherDetails.innerHTML = '<p>Loading...</p>';
    const url = `${apiUrl}?q=${location}&appid=${apiKey}&units=metric`; // `units=metric` for Celsius

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            // Display the weather data
            displayWeatherData(data);

            // Check for weather alerts
            if (data.alerts) {
                displayWeatherAlerts(data.alerts);
            }
        })
        .catch(error => {
            weatherDetails.innerHTML = `
                <p style="color: red; font-weight: bold;">Oops! Something went wrong: ${error.message}</p>
            `;
        });

    locationInput.value = '';
}

// Function to display weather alerts
function displayWeatherAlerts(alerts) {
    const alertContainer = document.getElementById('weather-alerts');
    
    alerts.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = 'weather-alert';
        
        alertElement.innerHTML = `
            <h4>Weather Alert: ${alert.event}</h4>
            <p>From: ${new Date(alert.start * 1000).toLocaleString()} to ${new Date(alert.end * 1000).toLocaleString()}</p>
            <p>Details: ${alert.description}</p>
        `;
        
        alertContainer.appendChild(alertElement);
    });
}
//weater alert
function fetchWeatherAlerts(city) {
    // First, get the city's latitude and longitude (you can get this from a separate geocoding API or by calling OpenWeatherMap's weather API first)
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const lat = data.coord.lat;
            const lon = data.coord.lon;
            // Now fetch the weather alerts using the lat and lon
            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,daily&appid=${apiKey}`)
                .then(response => response.json())
                .then(data => {
                    const alerts = data.alerts;
                    if (alerts && alerts.length > 0) {
                        displayWeatherAlerts(alerts);
                    } else {
                        weatherAlerts.innerHTML = '<p>No weather alerts for this location.</p>';
                    }
                })
                .catch(error => console.error('Error fetching weather alerts:', error));
        })
        .catch(error => console.error('Error fetching location data:', error));
}
// display alerts
function displayWeatherAlerts(alerts) {
    weatherAlerts.innerHTML = ''; // Clear previous alerts

    alerts.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = 'weather-alert';
        alertElement.innerHTML = `
            <strong>${alert.event}</strong>
            <p>${alert.description}</p>
            <p><strong>Start:</strong> ${new Date(alert.start * 1000).toLocaleString()}</p>
            <p><strong>End:</strong> ${new Date(alert.end * 1000).toLocaleString()}</p>
        `;
        weatherAlerts.appendChild(alertElement);
    });
}
//weather notification
// Function to check weather for notifications
function checkWeatherForNotifications(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            const weatherCondition = data.weather[0].main;
            if (weatherCondition === 'Thunderstorm' || weatherCondition === 'Rain' || weatherCondition === 'Snow') {
                displayWeatherNotification(weatherCondition);
            }
        })
        .catch(error => console.error('Error fetching weather data for notifications:', error));
}

// Display Weather Notification
function displayWeatherNotification(weatherCondition) {
    const notification = document.createElement('div');
    notification.className = 'weather-notification';
    notification.innerHTML = `
        <strong>Weather Alert!</strong>
        <p>Current condition: ${weatherCondition}. Stay safe!</p>
    `;
    document.body.appendChild(notification);

    // Optionally, trigger browser notifications
    if (Notification.permission === "granted") {
        new Notification(`Weather Alert: ${weatherCondition}`, {
            body: "Stay safe, the weather is not ideal!",
            icon: 'weather-icon.png',
        });
    }
}

// Request permission for browser notifications
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

// Check weather periodically (e.g., every 30 minutes)
setInterval(() => {
    const city = locationInput.value.trim();
    if (city) {
        checkWeatherForNotifications(city);
    }
}, 1800000); // 30 minutes in milliseconds

// Function to display the weather recommendation
function displayWeatherRecommendation(recommendation) {
    const recommendationContainer = document.getElementById('weather-recommendation');
    
    if (!recommendationContainer) {
        const newContainer = document.createElement('div');
        newContainer.id = 'weather-recommendation';
        newContainer.className = 'recommendation-container';
        newContainer.innerHTML = `<p>${recommendation}</p>`;
        document.body.appendChild(newContainer);
    } else {
        recommendationContainer.innerHTML = `<p>${recommendation}</p>`;
    }
}
//rain-icon
const iconElement = document.createElement('img');
iconElement.src = iconUrl;
iconElement.alt = weather[0].description;

// Add class based on weather condition
if (weather[0].description.includes('rain')) {
    iconElement.classList.add('rain-icon');
}

weatherDetails.appendChild(iconElement);


