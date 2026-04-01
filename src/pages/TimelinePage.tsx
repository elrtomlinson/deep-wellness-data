import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useHealthData } from '@/hooks/useHealthData';
import { AppLayout } from '@/components/AppLayout';
import { getSeverityLevel, DailyLog, WeatherSnapshot, FOOD_TAGS } from '@/types/health';
import { getWeatherDescription, getWeatherEmoji, getAqiLabel, getUvLabel, getPollenLabel } from '@/hooks/useWeather';
import { cn } from '@/lib/utils';
import {
  Stethoscope, Pill, Heart, Activity, AlertTriangle,
  TrendingDown, Calendar, ClipboardList,
  Thermometer, Droplets, Gauge, Wind, Sun, TreePine,
} from 'lucide-react';

interface TimelineEvent {
  date: string;
  type: 'condition_added' | 'medication_started' | 'medication_stopped' | 'treatment_started' | 'treatment_stopped' | 'flare' | 'improvement' | 'log' | 'daily_log';
  title: string;
  subtitle?: string;
  severity?: number;
  icon: React.ReactNode;
  color: string;
  dailyLog?: DailyLog;
}

function WeatherInline({ weather }: { weather: WeatherSnapshot }) {
  const aqiInfo = getAqiLabel(weather.aqi);
  const uvInfo = getUvLabel(weather.uvIndex);
  const pollenInfo = getPollenLabel(weather.pollenTotal);

  return (
    <div className="mt-2 p-2.5 rounded-lg bg-muted/40 space-y-1.5">
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        <span>{getWeatherEmoji(weather.weatherCode)}</span>
        <span>{getWeatherDescription(weather.weatherCode)}</span>
      </div>
      <div className="grid grid-cols-4 gap-x-3 gap-y-1 text-[11px]">
        <div className="flex items-center gap-1">
          <Thermometer className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="tabular-nums">{weather.temperature.toFixed(0)}°C</span>
        </div>
        <div className="flex items-center gap-1">
          <Droplets className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="tabular-nums">{weather.humidity.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Gauge className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="tabular-nums">{weather.pressure.toFixed(0)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="tabular-nums">{weather.windSpeed.toFixed(0)} km/h</span>
        </div>
      </div>
      {(weather.aqi !== null || weather.uvIndex !== null || weather.pollenTotal !== null) && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px]">
          {weather.aqi !== null && (
            <span className={cn('flex items-center gap-1', aqiInfo.color)}>
              AQI: {aqiInfo.label} ({Math.round(weather.aqi)})
            </span>
          )}
          {weather.uvIndex !== null && (
            <span className={cn('flex items-center gap-1', uvInfo.color)}>
              <Sun className="h-2.5 w-2.5" /> UV {weather.uvIndex.toFixed(0)}
            </span>
          )}
          {weather.pollenTotal !== null && weather.pollenTotal > 0 && (
            <span className={cn('flex items-center gap-1', pollenInfo.color)}>
              <TreePine className="h-2.5 w-2.5" /> {pollenInfo.label}
            </span>
          )}
        </div>
      )}
      {Math.abs(weather.pressureChange) > 3 && (
        <p className="text-[10px] text-severity-moderate">
          ⚠ Pressure {weather.pressureChange > 0 ? 'rose' : 'dropped'} {Math.abs(weather.pressureChange).toFixed(1)} hPa
        </p>
      )}
    </div>
  );
}

export default function TimelinePage() {
  const { conditions, medications, treatments, logs, symptoms } = useHealthData();
  const [showAllLogs, setShowAllLogs] = useState(false);

  const events = useMemo(() => {
    const all: TimelineEvent[] = [];

    // Condition additions
    conditions.forEach(c => {
      all.push({
        date: c.createdAt,
        type: 'condition_added',
        title: c.name,
        subtitle: 'Condition added',
        icon: <Stethoscope className="h-4 w-4" />,
        color: 'text-primary',
      });
    });

    // Medication starts
    medications.forEach(m => {
      all.push({
        date: m.id,
        type: 'medication_started',
        title: m.name,
        subtitle: `Started${m.dosage ? ` · ${m.dosage}` : ''}`,
        icon: <Pill className="h-4 w-4" />,
        color: 'text-chart-2',
      });
    });

    // Treatment starts  
    treatments.forEach(t => {
      all.push({
        date: t.id,
        type: 'treatment_started',
        title: t.name,
        subtitle: 'Treatment started',
        icon: <Heart className="h-4 w-4" />,
        color: 'text-chart-4',
      });
    });

    // Daily logs — always add as entries
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    sorted.forEach((log, i) => {
      // Daily log entry
      const topSymptoms = log.symptoms
        .filter(s => s.severity >= 3)
        .sort((a, b) => b.severity - a.severity)
        .slice(0, 3)
        .map(s => {
          const sym = symptoms.find(sy => sy.id === s.symptomId);
          return sym ? `${sym.name} ${s.severity}/10` : null;
        })
        .filter(Boolean);

      const medsTaken = log.medications.filter(m => m.taken).length;
      const medsTotal = log.medications.length;
      const parts: string[] = [];
      parts.push(`Pain ${log.overallPain}/10 · Sleep ${log.sleepQuality}/10 · Mood ${log.mood}/10`);
      if (medsTotal > 0) parts.push(`Meds ${medsTaken}/${medsTotal}`);
      if (topSymptoms.length > 0) parts.push(topSymptoms.join(', '));

      all.push({
        date: log.date,
        type: 'daily_log',
        title: `Daily Log`,
        subtitle: parts.join(' · '),
        severity: log.overallPain,
        icon: <ClipboardList className="h-4 w-4" />,
        color: log.overallPain >= 7 ? 'text-severity-high' : log.overallPain >= 4 ? 'text-severity-moderate' : 'text-primary',
        dailyLog: log,
      });

      // Flare detection
      if (i > 0) {
        const prev = sorted[i - 1];
        const painDelta = log.overallPain - prev.overallPain;

        if (painDelta >= 3) {
          const flareSymptoms = log.symptoms
            .filter(s => s.severity >= 5)
            .map(s => symptoms.find(sy => sy.id === s.symptomId)?.name)
            .filter(Boolean)
            .slice(0, 3);
          all.push({
            date: log.date,
            type: 'flare',
            title: 'Symptom flare detected',
            subtitle: flareSymptoms.length > 0
              ? `High: ${flareSymptoms.join(', ')}`
              : `Pain jumped from ${prev.overallPain} to ${log.overallPain}`,
            severity: log.overallPain,
            icon: <AlertTriangle className="h-4 w-4" />,
            color: 'text-severity-severe',
          });
        } else if (painDelta <= -3) {
          all.push({
            date: log.date,
            type: 'improvement',
            title: 'Notable improvement',
            subtitle: `Pain dropped from ${prev.overallPain} to ${log.overallPain}`,
            severity: log.overallPain,
            icon: <TrendingDown className="h-4 w-4" />,
            color: 'text-severity-low',
          });
        }
      }
    });

    return all.sort((a, b) => b.date.localeCompare(a.date));
  }, [conditions, medications, treatments, logs, symptoms]);

  // Group by month
  const grouped = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    events.forEach(e => {
      let monthKey: string;
      try {
        const d = parseISO(e.date);
        monthKey = isNaN(d.getTime()) ? 'Unknown' : format(d, 'MMMM yyyy');
      } catch {
        monthKey = 'Unknown';
      }
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(e);
    });
    return groups;
  }, [events]);

  const monthKeys = Object.keys(grouped);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Timeline</h2>
          </div>
          {logs.length > 0 && (
            <Button
              variant={showAllLogs ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowAllLogs(!showAllLogs)}
            >
              {showAllLogs ? 'Milestones only' : 'Show all logs'}
            </Button>
          )}
        </div>

        {events.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <Calendar className="h-10 w-10 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-medium">No events yet</h3>
            <p className="text-muted-foreground text-sm">
              Add conditions, log symptoms, and track medications to build your health timeline.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {monthKeys.map(month => {
              const monthEvents = grouped[month].filter(e =>
                showAllLogs || e.type !== 'daily_log'
              );
              if (monthEvents.length === 0) return null;

              return (
                <div key={month}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 sticky top-0 bg-background py-1 z-10">
                    {month}
                  </h3>
                  <div className="relative">
                    <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

                    <div className="space-y-1">
                      {monthEvents.map((event, i) => {
                        let dateLabel: string;
                        try {
                          const d = parseISO(event.date);
                          dateLabel = isNaN(d.getTime()) ? '' : format(d, 'MMM d');
                        } catch {
                          dateLabel = '';
                        }
                        return (
                          <div key={`${event.date}-${event.type}-${i}`} className="flex gap-3 relative">
                            <div className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10',
                              'bg-card border border-border',
                              event.color,
                            )}>
                              {event.icon}
                            </div>

                            <div className="flex-1 pb-4 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium">{event.title}</p>
                                  {event.subtitle && (
                                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{event.subtitle}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {event.severity !== undefined && (
                                    <Badge variant="outline" className={cn('text-[10px]', {
                                      'text-severity-low border-severity-low': getSeverityLevel(event.severity) === 'low',
                                      'text-severity-moderate border-severity-moderate': getSeverityLevel(event.severity) === 'moderate',
                                      'text-severity-high border-severity-high': getSeverityLevel(event.severity) === 'high',
                                      'text-severity-severe border-severity-severe': getSeverityLevel(event.severity) === 'severe',
                                    })}>
                                      {event.severity}/10
                                    </Badge>
                                  )}
                                  {dateLabel && (
                                    <span className="text-[10px] text-muted-foreground">{dateLabel}</span>
                                  )}
                                </div>
                              </div>

                              {/* Weather snapshot for daily logs */}
                              {event.type === 'daily_log' && event.dailyLog?.weather && (
                                <WeatherInline weather={event.dailyLog.weather} />
                              )}

                              {/* Notes */}
                              {event.type === 'daily_log' && event.dailyLog?.notes && (
                                <p className="mt-1.5 text-[11px] text-muted-foreground italic leading-snug">
                                  "{event.dailyLog.notes}"
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
