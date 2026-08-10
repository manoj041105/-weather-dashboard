# Skyline — Weather Dashboard

A responsive weather application that displays real-time weather information
for any city, powered by the OpenWeather REST API.

**Stack:** HTML, CSS, JavaScript, REST API

## What it does

- Developed a responsive weather application using the OpenWeather API to
  display real-time weather information.
- Implemented city-based search, temperature, humidity, wind speed, and
  weather condition updates.
- Extras: °C/°F unit toggle, sunrise/sunset, pressure & visibility,
  an ambient background that shifts tone with the temperature and
  day/night, and the last-searched city is remembered between visits.

## Getting started

1. Get a free API key from [openweathermap.org/api](https://openweathermap.org/api).
2. Open `script.js` and set:
   ```js
   const API_KEY = "YOUR_OPENWEATHER_API_KEY";
   ```
   (or, without editing the file, open the browser console on the page and run
   `localStorage.setItem('OPENWEATHER_API_KEY', 'yourKeyHere')`)
3. Open `index.html` directly in a browser, or serve the folder locally:
   ```bash
   python3 -m http.server 8000
   # then visit http://localhost:8000
   ```

No build step or dependencies — plain HTML/CSS/JS.

## Project structure

```
weather-dashboard/
├── index.html     # markup / layout
├── style.css       # responsive, ambient "sky" theme
├── script.js       # OpenWeather fetch logic, rendering, unit toggle
└── README.md
```

## Deploying

Since this is a static site, it deploys directly to **GitHub Pages**:

1. Push the repo to GitHub (see root deployment instructions).
2. In the repo settings, go to **Pages** → set source to the `main` branch, root folder.
3. Your dashboard will be live at `https://<username>.github.io/weather-dashboard/`.
