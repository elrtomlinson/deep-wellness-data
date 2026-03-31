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
}

interface WeatherCache {
  data: WeatherData[];
  lat: number;
  lon: number;
  fetchedAt: string;
}

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

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

export function useWeather() {
  const [cache, setCache] = useLocalStorage<WeatherCache | null>('health-weather', null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        daily: 'temperature_2m_mean,relative_humidity_2m_mean,surface_pressure_mean,wind_speed_10m_max,weather_code',
        past_days: '14',
        forecast_days: '1',
        timezone: 'auto',
      });

      const res = await fetch(`${OPEN_METEO_URL}?${params}`);
      if (!res.ok) throw new Error('Weather API request failed');
      const json = await res.json();

      const days: WeatherData[] = json.daily.time.map((date: string, i: number) => {
        const pressure = json.daily.surface_pressure_mean[i] ?? 1013;
        const prevPressure = i > 0 ? (json.daily.surface_pressure_mean[i - 1] ?? pressure) : pressure;
        return {
          date,
          temperature: json.daily.temperature_2m_mean[i] ?? 0,
          humidity: json.daily.relative_humidity_2m_mean[i] ?? 0,
          pressure,
          windSpeed: json.daily.wind_speed_10m_max[i] ?? 0,
          weatherCode: json.daily.weather_code[i] ?? 0,
          pressureChange: +(pressure - prevPressure).toFixed(1),
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
