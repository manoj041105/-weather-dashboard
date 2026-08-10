/**
 * Skyline — Weather Dashboard
 * Talks to the OpenWeather "Current Weather Data" REST API.
 *
 * Get a free API key at https://openweathermap.org/api and paste it below,
 * or set it once in the browser console:
 *   localStorage.setItem('OPENWEATHER_API_KEY', 'yourKeyHere')
 */

const API_KEY = "YOUR_OPENWEATHER_API_KEY"; // <-- put your key here
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const state = {
  unit: "metric", // "metric" = °C, "imperial" = °F
  lastQuery: null,
  lastData: null,
};

const els = {
  form: document.getElementById("searchForm"),
  input: document.getElementById("cityInput"),
  status: document.getElementById("statusBanner"),
  dashboard: document.getElementById("dashboard"),
  empty: document.getElementById("emptyState"),
  heroDate: document.getElementById("heroDate"),
  heroCity: document.getElementById("heroCity"),
  heroTemp: document.getElementById("heroTemp"),
  heroCondition: document.getElementById("heroCondition"),
  heroFeels: document.getElementById("heroFeels"),
  glyph: document.getElementById("conditionGlyph"),
  statHumidity: document.getElementById("statHumidity"),
  statWind: document.getElementById("statWind"),
  statPressure: document.getElementById("statPressure"),
  statVisibility: document.getElementById("statVisibility"),
  statSunrise: document.getElementById("statSunrise"),
  statSunset: document.getElementById("statSunset"),
  lastUpdated: document.getElementById("lastUpdated"),
  unitC: document.getElementById("unitC"),
  unitF: document.getElementById("unitF"),
  sky: document.getElementById("sky"),
};

function getApiKey() {
  return localStorage.getItem("OPENWEATHER_API_KEY") || API_KEY;
}

function showStatus(message, isError = false) {
  els.status.textContent = message;
  els.status.hidden = false;
  els.status.classList.toggle("is-error", isError);
}

function clearStatus() {
  els.status.hidden = true;
  els.status.classList.remove("is-error");
}

const CONDITION_GLYPHS = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Drizzle: "🌦️",
  Thunderstorm: "⛈️",
  Snow: "❄️",
  Mist: "🌫️",
  Fog: "🌫️",
  Haze: "🌫️",
  Smoke: "🌫️",
  Dust: "🌫️",
  Sand: "🌫️",
  Ash: "🌫️",
  Squall: "💨",
  Tornado: "🌪️",
};

function windLabel(speedMs, unit) {
  if (unit === "imperial") return `${speedMs.toFixed(1)} mph`;
  return `${speedMs.toFixed(1)} m/s`;
}

function formatTime(unixSeconds, timezoneOffsetSeconds) {
  const date = new Date((unixSeconds + timezoneOffsetSeconds) * 1000);
  return date.toUTCString().match(/(\d{2}:\d{2}):\d{2}/)[1];
}

function updateSkyMood(tempCelsius, isNight) {
  // Cold -> deep blue, mild -> teal/blue, hot -> warm amber. Signature ambient background.
  let stops;
  if (isNight) {
    stops = ["#0b1330", "#1c2a52", "#3a3f6b"];
  } else if (tempCelsius <= 5) {
    stops = ["#1c3a5e", "#3f6f9c", "#cfe7e0"];
  } else if (tempCelsius <= 18) {
    stops = ["#274472", "#5b8bb0", "#cfe7e0"];
  } else if (tempCelsius <= 28) {
    stops = ["#2b6777", "#52a68d", "#e8e5b8"];
  } else {
    stops = ["#7a3b26", "#d9773f", "#f6d78b"];
  }
  els.sky.style.background = `linear-gradient(160deg, ${stops[0]}, ${stops[1]} 55%, ${stops[2]} 100%)`;
}

function toCelsius(kelvinBasedTempInCurrentUnit) {
  // Not used directly — we re-fetch per unit to keep the API contract simple.
  return kelvinBasedTempInCurrentUnit;
}

async function fetchWeather(city) {
  const key = getApiKey();
  if (!key || key === "YOUR_OPENWEATHER_API_KEY") {
    showStatus(
      "Add your OpenWeather API key in script.js (API_KEY) or via localStorage.setItem('OPENWEATHER_API_KEY', 'key') to fetch live data.",
      true
    );
    return null;
  }

  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&units=${state.unit}&appid=${key}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Couldn't find a city called "${city}". Check the spelling and try again.`);
    }
    if (response.status === 401) {
      throw new Error("Invalid API key. Double-check the key in script.js.");
    }
    throw new Error(`Weather service error (status ${response.status}).`);
  }

  return response.json();
}

function render(data) {
  const tempUnit = state.unit === "metric" ? "°C" : "°F";
  const condition = data.weather?.[0]?.main ?? "Clear";
  const description = data.weather?.[0]?.description ?? "";
  const isNight = data.weather?.[0]?.icon?.endsWith("n") ?? false;

  els.heroDate.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  els.heroCity.textContent = `${data.name}, ${data.sys?.country ?? ""}`.trim();
  els.heroTemp.textContent = `${Math.round(data.main.temp)}${tempUnit}`;
  els.heroCondition.textContent = description || condition;
  els.heroFeels.textContent = `Feels like ${Math.round(data.main.feels_like)}${tempUnit}`;
  els.glyph.textContent = CONDITION_GLYPHS[condition] || "🌤️";

  els.statHumidity.textContent = `${data.main.humidity}%`;
  els.statWind.textContent = windLabel(data.wind?.speed ?? 0, state.unit);
  els.statPressure.textContent = `${data.main.pressure} hPa`;
  els.statVisibility.textContent = data.visibility != null ? `${(data.visibility / 1000).toFixed(1)} km` : "—";

  const tzOffset = data.timezone ?? 0;
  els.statSunrise.textContent = data.sys?.sunrise ? formatTime(data.sys.sunrise, tzOffset) : "—";
  els.statSunset.textContent = data.sys?.sunset ? formatTime(data.sys.sunset, tzOffset) : "—";

  els.lastUpdated.textContent = `Updated ${new Date().toLocaleTimeString()}`;

  const tempCelsius = state.unit === "metric" ? data.main.temp : ((data.main.temp - 32) * 5) / 9;
  updateSkyMood(tempCelsius, isNight);

  els.dashboard.hidden = false;
  els.empty.hidden = true;
}

async function search(city) {
  if (!city.trim()) return;
  clearStatus();
  els.dashboard.hidden = true;

  try {
    const data = await fetchWeather(city.trim());
    if (!data) return; // missing API key case already messaged
    state.lastQuery = city.trim();
    state.lastData = data;
    localStorage.setItem("lastCity", state.lastQuery);
    render(data);
  } catch (err) {
    showStatus(err.message, true);
    els.empty.hidden = false;
  }
}

els.form.addEventListener("submit", (e) => {
  e.preventDefault();
  search(els.input.value);
});

[els.unitC, els.unitF].forEach((btn) => {
  btn.addEventListener("click", () => {
    const unit = btn.dataset.unit;
    if (unit === state.unit) return;
    state.unit = unit;
    els.unitC.classList.toggle("is-active", unit === "metric");
    els.unitF.classList.toggle("is-active", unit === "imperial");
    if (state.lastQuery) search(state.lastQuery);
  });
});

// Restore the last searched city on load, if any.
window.addEventListener("DOMContentLoaded", () => {
  const savedCity = localStorage.getItem("lastCity");
  if (savedCity) {
    els.input.value = savedCity;
    search(savedCity);
  }
});
