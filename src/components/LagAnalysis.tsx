import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHealthData } from '@/hooks/useHealthData';
import { Timer, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pearson, getCorrelationStrength } from '@/lib/correlation';

interface LagResult {
  cause: string;
  effect: string;
  bestLag: number; // days
  r: number;
  strength: 'strong' | 'moderate' | 'weak';
  insight: string;
}

export function LagAnalysis({ days = 30 }: { days?: number }) {
  const { symptoms, medications, logs, getRecentLogs } = useHealthData();
  const { getRecentWeather, hasData: hasWeather } = useWeather();

  const recentLogs = getRecentLogs(days);
  const recentWeather = hasWeather ? getRecentWeather(days) : [];

  const results = useMemo<LagResult[]>(() => {
    if (recentLogs.length < 7) return [];

    const sorted = [...recentLogs].sort((a, b) => a.date.localeCompare(b.date));
    const dates = sorted.map(l => l.date);

    // Build cause series (potential triggers)
    const causes: Record<string, number[]> = {
      'Poor Sleep': sorted.map(l => 10 - l.sleepQuality), // invert so high = poor
      'Low Mood': sorted.map(l => 10 - l.mood),
      'High Energy Spend': sorted.map(l => (l.energySpent ?? 0) / 10),
    };

    // Missed meds
    medications.filter(m => m.active).forEach(med => {
      const vals = sorted.map(l => {
        const ml = l.medications.find(m => m.medicationId === med.id);
        return ml?.taken ? 0 : 10; // 10 = missed
      });
      if (vals.some(v => v > 0)) causes[`Missed ${med.name}`] = vals;
    });

    // Weather
    if (recentWeather.length > 0) {
      const weatherByDate = new Map(recentWeather.map(w => [w.date, w]));
      const pressureDrops: number[] = [];
      const humidity: number[] = [];
      const aqi: number[] = [];
      const uv: number[] = [];
      const pollen: number[] = [];
      let aligned = true;
      dates.forEach(d => {
        const w = weatherByDate.get(d);
        if (w) {
          pressureDrops.push(Math.max(0, -w.pressureChange));
          humidity.push(w.humidity / 10);
          aqi.push((w.aqi ?? 0) / 10);
          uv.push(w.uvIndex ?? 0);
          pollen.push((w.pollenTotal ?? 0) / 10);
        } else {
          aligned = false;
        }
      });
      if (aligned && pressureDrops.length === dates.length) {
        causes['Pressure Drop'] = pressureDrops;
        causes['High Humidity'] = humidity;
        if (aqi.some(v => v > 0)) causes['Poor Air Quality'] = aqi;
        if (uv.some(v => v > 0)) causes['High UV'] = uv;
        if (pollen.some(v => v > 0)) causes['High Pollen'] = pollen;
      }
    }

    // Build effect series (outcomes)
    const effects: Record<string, number[]> = {
      'Pain': sorted.map(l => l.overallPain),
    };
    symptoms.forEach(sym => {
      const vals = sorted.map(l => {
        const sl = l.symptoms.find(s => s.symptomId === sym.id);
        return sl?.severity ?? 0;
      });
      if (vals.some(v => v > 0)) effects[sym.name] = vals;
    });

    // Test each cause→effect pair at lags 0-7
    const lagResults: LagResult[] = [];
    const MAX_LAG = 7;

    Object.entries(causes).forEach(([causeName, causeVals]) => {
      Object.entries(effects).forEach(([effectName, effectVals]) => {
        let bestR = 0;
        let bestLag = 0;

        for (let lag = 0; lag <= MAX_LAG; lag++) {
          if (causeVals.length - lag < 4) break;
          const shifted = causeVals.slice(0, causeVals.length - lag);
          const target = effectVals.slice(lag);
          const r = pearson(shifted, target);
          if (r !== null && Math.abs(r) > Math.abs(bestR)) {
            bestR = r;
            bestLag = lag;
          }
        }

        const strength = getCorrelationStrength(bestR);
        if (strength === 'none' || strength === 'weak') return;

        // Only include if lagged correlation is stronger than same-day
        const sameDay = pearson(causeVals, effectVals);
        if (bestLag === 0 || (sameDay !== null && Math.abs(bestR) <= Math.abs(sameDay) * 1.15)) {
          // Only report if lag > 0 or significantly stronger
          if (bestLag === 0) return;
        }

        lagResults.push({
          cause: causeName,
          effect: effectName,
          bestLag,
          r: bestR,
          strength,
          insight: `${causeName} shows strongest effect on ${effectName} after ${bestLag} day${bestLag !== 1 ? 's' : ''} (r=${bestR.toFixed(2)})`,
        });
      });
    });

    return lagResults.sort((a, b) => Math.abs(b.r) - Math.abs(a.r)).slice(0, 8);
  }, [recentLogs, symptoms, medications, recentWeather]);

  if (results.length === 0) return null;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Timer className="h-5 w-5 text-primary" aria-hidden="true" />
        <h3 className="font-semibold text-sm">Delayed Effect Analysis</h3>
        <Badge variant="secondary" className="text-[10px] ml-auto">
          {results.length} found
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Factors that affect your symptoms with a time delay — not just the same day.
      </p>

      <div className="space-y-2">
        {results.map((r, i) => (
          <div key={i} className="p-2.5 rounded-lg bg-muted/40 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium">{r.cause}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant="outline" className="text-[10px]">
                {r.bestLag} day{r.bestLag !== 1 ? 's' : ''} later
              </Badge>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium">{r.effect}</span>
              <Badge
                variant="outline"
                className={cn('text-[10px] ml-auto', {
                  'border-severity-high text-severity-high': r.strength === 'strong',
                  'border-severity-moderate text-severity-moderate': r.strength === 'moderate',
                })}
              >
                r = {r.r.toFixed(2)}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">{r.insight}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
