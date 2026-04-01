import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface WeatherData {
  date: string; // YYYY-MM-DD
  temperature: number; // °C
  humidity: number; // %
  pressure: number; // hPa (barometric)
  windSpeed: number; // km/h
  weatherCode: number;
  pressureChange: number; // hPa change from previous day
  // Air quality
  aqi: number | null; // European AQI (1-5 scale mapped to descriptive)
  pm25: number | null; // µg/m³
  pm10: number | null; // µg/m³
  // UV
  uvIndex: number | null;
  // Pollen (grains/m³) — availability varies by region
  pollenGrass: number | null;
  pollenBirch: number | null;
  pollenRagweed: number | null;
  pollenTotal: number | null; // sum of available pollen
}

interface WeatherCache {
  data: WeatherData[];
  lat: number;
  lon: number;
  fetchedAt: string;
}

const OPEN_METEO_FORECAST = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_AIR_QUALITY = 'https://air-quality-api.open-meteo.com/v1/air-quality';

function getWeatherDescription(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Fog';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  if (code <= 86) return 'Snow showers';
  return 'Thunderstorm';
}

function getWeatherEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌧️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 86) return '🌨️';
  return '⛈️';
}

export function getAqiLabel(aqi: number | null): { label: string; color: string } {
  if (aqi === null) return { label: 'N/A', color: 'text-muted-foreground' };
  if (aqi <= 20) return { label: 'Good', color: 'text-severity-low' };
  if (aqi <= 40) return { label: 'Fair', color: 'text-chart-4' };
  if (aqi <= 60) return { label: 'Moderate', color: 'text-severity-moderate' };
  if (aqi <= 80) return { label: 'Poor', color: 'text-severity-high' };
  return { label: 'Very Poor', color: 'text-severity-severe' };
}

export function getUvLabel(uv: number | null): { label: string; color: string } {
  if (uv === null) return { label: 'N/A', color: 'text-muted-foreground' };
  if (uv <= 2) return { label: 'Low', color: 'text-severity-low' };
  if (uv <= 5) return { label: 'Moderate', color: 'text-severity-moderate' };
  if (uv <= 7) return { label: 'High', color: 'text-severity-high' };
  return { label: 'Very High', color: 'text-severity-severe' };
}

export function getPollenLabel(total: number | null): { label: string; color: string } {
  if (total === null || total === 0) return { label: 'None', color: 'text-muted-foreground' };
  if (total <= 20) return { label: 'Low', color: 'text-severity-low' };
  if (total <= 80) return { label: 'Moderate', color: 'text-severity-moderate' };
  if (total <= 200) return { label: 'High', color: 'text-severity-high' };
  return { label: 'Very High', color: 'text-severity-severe' };
}

/** Compute daily average from hourly array */
function dailyAvg(hourly: (number | null)[] | undefined, dayIndex: number): number | null {
  if (!hourly) return null;
  const start = dayIndex * 24;
  const slice = hourly.slice(start, start + 24).filter((v): v is number => v !== null && v !== undefined);
  if (slice.length === 0) return null;
  return +(slice.reduce((s, v) => s + v, 0) / slice.length).toFixed(1);
}

/** Get daily max from hourly array */
function dailyMax(hourly: (number | null)[] | undefined, dayIndex: number): number | null {
  if (!hourly) return null;
  const start = dayIndex * 24;
  const slice = hourly.slice(start, start + 24).filter((v): v is number => v !== null && v !== undefined);
  if (slice.length === 0) return null;
  return +Math.max(...slice).toFixed(1);
}

export function useWeather() {
  const [cache, setCache] = useLocalStorage<WeatherCache | null>('health-weather-v2', null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch weather + air quality in parallel
      const forecastParams = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        daily: 'temperature_2m_mean,relative_humidity_2m_mean,surface_pressure_mean,wind_speed_10m_max,weather_code',
        past_days: '14',
        forecast_days: '1',
        timezone: 'auto',
      });

      const aqParams = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        hourly: 'european_aqi,pm2_5,pm10,uv_index,grass_pollen,birch_pollen,ragweed_pollen',
        past_days: '14',
        forecast_days: '1',
        timezone: 'auto',
      });

      const [forecastRes, aqRes] = await Promise.all([
        fetch(`${OPEN_METEO_FORECAST}?${forecastParams}`),
        fetch(`${OPEN_METEO_AIR_QUALITY}?${aqParams}`).catch(() => null),
      ]);

      if (!forecastRes.ok) throw new Error('Weather API request failed');
      const forecastJson = await forecastRes.json();
      const aqJson = aqRes?.ok ? await aqRes.json() : null;

      const numDays = forecastJson.daily.time.length;

      const days: WeatherData[] = forecastJson.daily.time.map((date: string, i: number) => {
        const pressure = forecastJson.daily.surface_pressure_mean[i] ?? 1013;
        const prevPressure = i > 0 ? (forecastJson.daily.surface_pressure_mean[i - 1] ?? pressure) : pressure;

        // Air quality data (computed from hourly)
        let aqi: number | null = null;
        let pm25: number | null = null;
        let pm10: number | null = null;
        let uvIndex: number | null = null;
        let pollenGrass: number | null = null;
        let pollenBirch: number | null = null;
        let pollenRagweed: number | null = null;

        if (aqJson?.hourly) {
          aqi = dailyAvg(aqJson.hourly.european_aqi, i);
          pm25 = dailyAvg(aqJson.hourly.pm2_5, i);
          pm10 = dailyAvg(aqJson.hourly.pm10, i);
          uvIndex = dailyMax(aqJson.hourly.uv_index, i);
          pollenGrass = dailyAvg(aqJson.hourly.grass_pollen, i);
          pollenBirch = dailyAvg(aqJson.hourly.birch_pollen, i);
          pollenRagweed = dailyAvg(aqJson.hourly.ragweed_pollen, i);
        }

        const pollenValues = [pollenGrass, pollenBirch, pollenRagweed].filter((v): v is number => v !== null);
        const pollenTotal = pollenValues.length > 0 ? +pollenValues.reduce((s, v) => s + v, 0).toFixed(1) : null;

        return {
          date,
          temperature: forecastJson.daily.temperature_2m_mean[i] ?? 0,
          humidity: forecastJson.daily.relative_humidity_2m_mean[i] ?? 0,
          pressure,
          windSpeed: forecastJson.daily.wind_speed_10m_max[i] ?? 0,
          weatherCode: forecastJson.daily.weather_code[i] ?? 0,
          pressureChange: +(pressure - prevPressure).toFixed(1),
          aqi, pm25, pm10, uvIndex,
          pollenGrass, pollenBirch, pollenRagweed, pollenTotal,
        };
      });

      setCache({ data: days, lat, lon, fetchedAt: new Date().toISOString() });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  }, [setCache]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationDenied(false);
        fetchWeather(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLocationDenied(true);
        setError('Location access denied');
      },
      { timeout: 10000 }
    );
  }, [fetchWeather]);

  // Auto-refresh if cache is older than 4 hours
  useEffect(() => {
    if (!cache) return;
    const age = Date.now() - new Date(cache.fetchedAt).getTime();
    if (age > 4 * 60 * 60 * 1000) {
      fetchWeather(cache.lat, cache.lon);
    }
  }, []);

  const getTodayWeather = useCallback((): WeatherData | null => {
    if (!cache?.data) return null;
    const today = new Date().toISOString().split('T')[0];
    return cache.data.find(d => d.date === today) ?? cache.data[cache.data.length - 1] ?? null;
  }, [cache]);

  const getWeatherForDate = useCallback((date: string): WeatherData | null => {
    return cache?.data.find(d => d.date === date) ?? null;
  }, [cache]);

  const getRecentWeather = useCallback((days: number = 14): WeatherData[] => {
    if (!cache?.data) return [];
    return cache.data.slice(-days);
  }, [cache]);

  return {
    weather: cache?.data ?? [],
    loading,
    error,
    locationDenied,
    requestLocation,
    getTodayWeather,
    getWeatherForDate,
    getRecentWeather,
    getWeatherDescription,
    getWeatherEmoji,
    hasData: !!cache?.data?.length,
  };
}

export { getWeatherDescription, getWeatherEmoji };
