import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CloudRain, MapPin, Thermometer, Droplets, Gauge, Wind, Loader2 } from 'lucide-react';
import { useWeather, getWeatherDescription, getWeatherEmoji } from '@/hooks/useWeather';

export function WeatherWidget() {
  const { loading, error, locationDenied, requestLocation, getTodayWeather, hasData } = useWeather();
  const today = getTodayWeather();

  if (!hasData && !loading) {
    return (
      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <CloudRain className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 className="font-semibold text-sm">Environmental Triggers</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Track weather conditions alongside your symptoms to identify environmental triggers like barometric pressure changes.
        </p>
        <Button size="sm" onClick={requestLocation} disabled={loading}>
          <MapPin className="h-4 w-4 mr-1" />
          Enable weather tracking
        </Button>
        {locationDenied && (
          <p className="text-xs text-destructive">Location access was denied. Please allow location in your browser settings.</p>
        )}
        {error && !locationDenied && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </Card>
    );
  }

  if (loading && !today) {
    return (
      <Card className="p-5 flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Fetching weather...</span>
      </Card>
    );
  }

  if (!today) return null;

  const pressureStatus = today.pressureChange > 3 ? 'Rising' :
    today.pressureChange < -3 ? 'Dropping' : 'Stable';
  const pressureVariant = Math.abs(today.pressureChange) > 3 ? 'destructive' : 'secondary';

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">{getWeatherEmoji(today.weatherCode)}</span>
          <h3 className="font-semibold text-sm">{getWeatherDescription(today.weatherCode)}</h3>
        </div>
        <Badge variant={pressureVariant as 'destructive' | 'secondary'} className="text-xs">
          Pressure {pressureStatus}
        </Badge>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div className="text-center" role="status" aria-label={`Temperature ${today.temperature.toFixed(0)}°C`}>
          <Thermometer className="h-4 w-4 mx-auto text-muted-foreground mb-1" aria-hidden="true" />
          <p className="text-sm font-semibold tabular-nums">{today.temperature.toFixed(0)}°C</p>
          <p className="text-xs text-muted-foreground">Temp</p>
        </div>
        <div className="text-center" role="status" aria-label={`Humidity ${today.humidity.toFixed(0)}%`}>
          <Droplets className="h-4 w-4 mx-auto text-muted-foreground mb-1" aria-hidden="true" />
          <p className="text-sm font-semibold tabular-nums">{today.humidity.toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground">Humidity</p>
        </div>
        <div className="text-center" role="status" aria-label={`Pressure ${today.pressure.toFixed(0)} hPa`}>
          <Gauge className="h-4 w-4 mx-auto text-muted-foreground mb-1" aria-hidden="true" />
          <p className="text-sm font-semibold tabular-nums">{today.pressure.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">hPa</p>
        </div>
        <div className="text-center" role="status" aria-label={`Wind ${today.windSpeed.toFixed(0)} km/h`}>
          <Wind className="h-4 w-4 mx-auto text-muted-foreground mb-1" aria-hidden="true" />
          <p className="text-sm font-semibold tabular-nums">{today.windSpeed.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">km/h</p>
        </div>
      </div>

      {Math.abs(today.pressureChange) > 5 && (
        <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          ⚠️ Significant pressure change ({today.pressureChange > 0 ? '+' : ''}{today.pressureChange} hPa) — this may trigger symptoms for conditions sensitive to barometric changes (migraines, arthritis, POTS).
        </p>
      )}
    </Card>
  );
}
