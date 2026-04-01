import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CloudRain, MapPin, Thermometer, Droplets, Gauge, Wind, Loader2, Sun, TreePine, Wind as AirIcon, RefreshCw, History } from 'lucide-react';
import { useWeather, getWeatherDescription, getWeatherEmoji, getAqiLabel, getUvLabel, getPollenLabel } from '@/hooks/useWeather';
import { useHealthData } from '@/hooks/useHealthData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function MetricTile({ icon, value, unit, label, colorClass }: {
  icon: React.ReactNode;
  value: string;
  unit?: string;
  label: string;
  colorClass?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/40" role="status" aria-label={`${label}: ${value}${unit ?? ''}`}>
      <div className="shrink-0 text-muted-foreground" aria-hidden="true">{icon}</div>
      <div className="min-w-0">
        <p className={cn('text-sm font-semibold tabular-nums leading-tight', colorClass)}>
          {value}{unit && <span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>}
        </p>
        <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
      </div>
    </div>
  );
}

export function WeatherWidget() {
  const { loading, error, locationDenied, requestLocation, getTodayWeather, hasData, backfillWeatherForLogs } = useWeather();
  const { logs, updateLogWeather } = useHealthData();
  const today = getTodayWeather();

  const logsWithoutWeather = logs.filter(l => !l.weather).length;

  const handleBackfill = async () => {
    const updated = await backfillWeatherForLogs(logs, updateLogWeather);
    if (updated > 0) {
      toast.success(`Added weather data to ${updated} past log${updated !== 1 ? 's' : ''}`);
    } else {
      toast.info('No logs to backfill — all logs already have weather data');
    }
  };

  if (!hasData && !loading) {
    return (
      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <CloudRain className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 className="font-semibold text-sm">Environmental Triggers</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Track weather, air quality, pollen, and UV alongside your symptoms to identify environmental triggers.
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
  const pressureColor = Math.abs(today.pressureChange) > 3
    ? 'border-severity-high text-severity-high'
    : 'border-muted-foreground text-muted-foreground';
  const aqiInfo = getAqiLabel(today.aqi);
  const uvInfo = getUvLabel(today.uvIndex);
  const pollenInfo = getPollenLabel(today.pollenTotal);

  const alerts: { emoji: string; text: string }[] = [];
  if (Math.abs(today.pressureChange) > 5) {
    alerts.push({
      emoji: '⚠️',
      text: `Significant pressure change (${today.pressureChange > 0 ? '+' : ''}${today.pressureChange} hPa) — may trigger barometric-sensitive symptoms.`,
    });
  }
  if (today.uvIndex !== null && today.uvIndex >= 8) {
    alerts.push({
      emoji: '☀️',
      text: `Very high UV (${today.uvIndex.toFixed(0)}) — UV-sensitive conditions may flare. Limit sun exposure.`,
    });
  }
  if (today.aqi !== null && today.aqi >= 60) {
    alerts.push({
      emoji: '🌫️',
      text: `Poor air quality (AQI ${Math.round(today.aqi)}) — may worsen respiratory symptoms or fatigue.`,
    });
  }

  return (
    <Card className="p-4 sm:p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl leading-none" aria-hidden="true">{getWeatherEmoji(today.weatherCode)}</span>
          <div>
            <h3 className="font-semibold text-sm leading-tight">{getWeatherDescription(today.weatherCode)}</h3>
            <p className="text-[10px] text-muted-foreground">Today's conditions</p>
          </div>
        </div>
        <Badge variant="outline" className={cn('text-[10px]', pressureColor)}>
          Pressure {pressureStatus}
        </Badge>
      </div>

      {/* Core weather — 2×2 grid */}
      <div className="grid grid-cols-2 gap-2">
        <MetricTile
          icon={<Thermometer className="h-4 w-4" />}
          value={today.temperature.toFixed(0)}
          unit="°C"
          label="Temperature"
        />
        <MetricTile
          icon={<Droplets className="h-4 w-4" />}
          value={today.humidity.toFixed(0)}
          unit="%"
          label="Humidity"
        />
        <MetricTile
          icon={<Gauge className="h-4 w-4" />}
          value={today.pressure.toFixed(0)}
          unit="hPa"
          label="Pressure"
        />
        <MetricTile
          icon={<Wind className="h-4 w-4" />}
          value={today.windSpeed.toFixed(0)}
          unit="km/h"
          label="Wind Speed"
        />
      </div>

      {/* Environmental health metrics */}
      {(today.aqi !== null || today.uvIndex !== null || today.pollenTotal !== null) && (
        <>
          <div className="border-t pt-3">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Environmental Health</p>
            <div className="grid grid-cols-2 gap-2">
              {today.aqi !== null && (
                <MetricTile
                  icon={<AirIcon className="h-4 w-4" />}
                  value={aqiInfo.label}
                  unit={`(${Math.round(today.aqi)})`}
                  label="Air Quality"
                  colorClass={aqiInfo.color}
                />
              )}
              {today.uvIndex !== null && (
                <MetricTile
                  icon={<Sun className="h-4 w-4" />}
                  value={today.uvIndex.toFixed(0)}
                  label={`UV — ${uvInfo.label}`}
                  colorClass={uvInfo.color}
                />
              )}
              {today.pollenTotal !== null && (
                <MetricTile
                  icon={<TreePine className="h-4 w-4" />}
                  value={pollenInfo.label}
                  label="Pollen"
                  colorClass={pollenInfo.color}
                />
              )}
            </div>
          </div>

          {/* Pollen breakdown */}
          {today.pollenTotal !== null && today.pollenTotal > 0 && (
            <div className="flex gap-3 text-[10px] text-muted-foreground px-1">
              {today.pollenGrass !== null && today.pollenGrass > 0 && <span>Grass: {Math.round(today.pollenGrass)}</span>}
              {today.pollenBirch !== null && today.pollenBirch > 0 && <span>Birch: {Math.round(today.pollenBirch)}</span>}
              {today.pollenRagweed !== null && today.pollenRagweed > 0 && <span>Ragweed: {Math.round(today.pollenRagweed)}</span>}
              <span className="ml-auto">grains/m³</span>
            </div>
          )}
        </>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-1.5">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-start gap-2 text-xs p-2.5 rounded-lg bg-destructive/5 border border-destructive/10">
              <span className="shrink-0 leading-none">{a.emoji}</span>
              <p className="text-muted-foreground leading-snug">{a.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Refresh */}
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-muted-foreground" onClick={requestLocation}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>
    </Card>
  );
}
