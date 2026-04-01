import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHealthData } from '@/hooks/useHealthData';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  pearson, getCorrelationStrength, generateInsight,
  type CorrelationResult,
} from '@/lib/correlation';

export function CorrelationAnalysis({ days = 14 }: { days?: number }) {
  const { symptoms, medications, treatments, getRecentLogs } = useHealthData();

  const recentLogs = getRecentLogs(days);

  const results = useMemo<CorrelationResult[]>(() => {
    if (recentLogs.length < 4) return [];

    // Build variable series aligned by date
    const series: Record<string, number[]> = {
      Pain: recentLogs.map(l => l.overallPain),
      Sleep: recentLogs.map(l => l.sleepQuality),
      Mood: recentLogs.map(l => l.mood),
      Energy: recentLogs.map(l => (l.energyLevel ?? 50) / 10),
    };

    // Symptom severities
    symptoms.forEach(sym => {
      const vals = recentLogs.map(l => {
        const sl = l.symptoms.find(s => s.symptomId === sym.id);
        return sl?.severity ?? 0;
      });
      if (vals.some(v => v > 0)) series[sym.name] = vals;
    });

    // Medication adherence
    medications.filter(m => m.active).forEach(med => {
      const vals = recentLogs.map(l => {
        const ml = l.medications.find(m => m.medicationId === med.id);
        return ml?.taken ? 1 : 0;
      });
      if (vals.some(v => v > 0)) series[`${med.name} (med)`] = vals;
    });

    // Treatment adherence
    treatments.filter(t => t.active).forEach(treat => {
      const vals = recentLogs.map(l => {
        const tl = (l.treatments ?? []).find(t => t.treatmentId === treat.id);
        return tl?.done ? 1 : 0;
      });
      if (vals.some(v => v > 0)) series[`${treat.name} (tx)`] = vals;
    });

    // Weather from stored log snapshots
    const logsWithWeather = recentLogs.filter(l => l.weather);
    if (logsWithWeather.length >= 4) {
      const temp: number[] = [];
      const hum: number[] = [];
      const pres: number[] = [];
      const presΔ: number[] = [];
      const aqi: number[] = [];
      const uv: number[] = [];
      const pollen: number[] = [];

      // Build weather series only for logs that have weather data
      // We need aligned indices, so rebuild all series for weather-having logs
      const weatherSeries: Record<string, number[]> = {};
      const weatherKeys = ['Temperature', 'Humidity', 'Pressure', 'Pressure Δ', 'Air Quality', 'UV Index', 'Pollen'];

      logsWithWeather.forEach(l => {
        const w = l.weather!;
        temp.push(w.temperature);
        hum.push(w.humidity);
        pres.push(w.pressure);
        presΔ.push(w.pressureChange);
        aqi.push(w.aqi ?? 0);
        uv.push(w.uvIndex ?? 0);
        pollen.push(w.pollenTotal ?? 0);
      });

      // If all logs have weather, add directly to main series
      if (logsWithWeather.length === recentLogs.length) {
        series['Temperature'] = temp;
        series['Humidity'] = hum;
        series['Pressure'] = pres;
        series['Pressure Δ'] = presΔ;
        if (aqi.some(v => v > 0)) series['Air Quality'] = aqi;
        if (uv.some(v => v > 0)) series['UV Index'] = uv;
        if (pollen.some(v => v > 0)) series['Pollen'] = pollen;
      } else {
        // Partial weather: correlate weather variables only against each other and
        // against the health metrics for the subset of logs that have weather
        const subPain = logsWithWeather.map(l => l.overallPain);
        const subSleep = logsWithWeather.map(l => l.sleepQuality);
        const subMood = logsWithWeather.map(l => l.mood);

        const weatherVars: Record<string, number[]> = { Temperature: temp, Humidity: hum, Pressure: pres, 'Pressure Δ': presΔ };
        if (aqi.some(v => v > 0)) weatherVars['Air Quality'] = aqi;
        if (uv.some(v => v > 0)) weatherVars['UV Index'] = uv;
        if (pollen.some(v => v > 0)) weatherVars['Pollen'] = pollen;
        const healthVars: Record<string, number[]> = { Pain: subPain, Sleep: subSleep, Mood: subMood };

        // Cross-correlate weather vs health for partial data
        Object.entries(weatherVars).forEach(([wName, wVals]) => {
          Object.entries(healthVars).forEach(([hName, hVals]) => {
            const r = pearson(wVals, hVals);
            if (r === null) return;
            const strength = getCorrelationStrength(r);
            if (strength !== 'none') {
              // Will be added to results below
              series[`_partial_${wName}`] = wVals;
            }
          });
        });
        // Add weather to main series for partial correlation (will align with subset)
        // Actually simpler: just add them and let the pairwise handle it below
        // Only add full-length series to main, handle partial separately in results
      }
    }

    // Compute all pairwise correlations
    const keys = Object.keys(series);
    const all: CorrelationResult[] = [];
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const r = pearson(series[keys[i]], series[keys[j]]);
        if (r === null) continue;
        const strength = getCorrelationStrength(r);
        if (strength === 'none') continue; // skip noise
        all.push({
          varA: keys[i],
          varB: keys[j],
          r,
          strength,
          direction: r > 0 ? 'positive' : 'negative',
          insight: generateInsight(keys[i], keys[j], r),
        });
      }
    }

    // Sort by absolute r descending
    return all.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
  }, [recentLogs, symptoms, medications, treatments]);

  if (results.length === 0) return null;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
        <h3 className="font-semibold text-sm">Correlation Analysis</h3>
        <Badge variant="secondary" className="text-[10px] ml-auto">
          {results.length} found
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Mathematical correlations between your tracked variables over the last {days} days.
      </p>

      <div className="space-y-2">
        {results.slice(0, 8).map((c, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/40"
          >
            <div className="mt-0.5 shrink-0">
              {c.direction === 'positive' ? (
                <TrendingUp className={cn('h-4 w-4', {
                  'text-severity-high': c.strength === 'strong',
                  'text-severity-moderate': c.strength === 'moderate',
                  'text-muted-foreground': c.strength === 'weak',
                })} />
              ) : (
                <TrendingDown className={cn('h-4 w-4', {
                  'text-chart-2': c.strength === 'strong',
                  'text-chart-3': c.strength === 'moderate',
                  'text-muted-foreground': c.strength === 'weak',
                })} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-medium">{c.varA}</span>
                <Minus className="h-2 w-2 text-muted-foreground" />
                <span className="text-xs font-medium">{c.varB}</span>
                <Badge
                  variant="outline"
                  className={cn('text-[10px] ml-auto', {
                    'border-severity-high text-severity-high': c.strength === 'strong',
                    'border-severity-moderate text-severity-moderate': c.strength === 'moderate',
                    'border-muted-foreground text-muted-foreground': c.strength === 'weak',
                  })}
                >
                  r = {c.r.toFixed(2)}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                {c.insight}
              </p>
            </div>
          </div>
        ))}
      </div>

      {results.length > 8 && (
        <p className="text-[10px] text-muted-foreground text-center">
          + {results.length - 8} weaker correlations not shown
        </p>
      )}
    </Card>
  );
}
