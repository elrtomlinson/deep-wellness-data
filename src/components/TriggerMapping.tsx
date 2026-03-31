import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useHealthData } from '@/hooks/useHealthData';
import { useWeather } from '@/hooks/useWeather';
import { Crosshair, Moon, Pill, CloudRain, Thermometer, TrendingDown, Zap, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Trigger {
  id: string;
  label: string;
  icon: typeof Moon;
  occurrences: number;     // how many flares had this trigger present
  totalFlares: number;
  percentage: number;
  avgImpact: number;       // average pain on flare days with this trigger
  description: string;
  category: 'sleep' | 'medication' | 'weather' | 'energy' | 'mood' | 'symptom';
}

const FLARE_THRESHOLD = 7; // pain >= 7 is a flare
const LOOKBACK_DAYS = 3;   // 24-72 hours = 1-3 days before

const CATEGORY_COLORS: Record<string, string> = {
  sleep: 'text-chart-2',
  medication: 'text-severity-high',
  weather: 'text-chart-3',
  energy: 'text-chart-5',
  mood: 'text-chart-4',
  symptom: 'text-severity-severe',
};

const CATEGORY_ICONS: Record<string, typeof Moon> = {
  sleep: Moon,
  medication: Pill,
  weather: CloudRain,
  energy: Zap,
  mood: TrendingDown,
  symptom: AlertTriangle,
};

export function TriggerMapping() {
  const { logs, symptoms, medications } = useHealthData();
  const { getRecentWeather } = useWeather();
  const weatherData = getRecentWeather(90);

  const triggers = useMemo(() => {
    if (logs.length < 7) return [];

    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    const dateIndex = new Map(sorted.map((l, i) => [l.date, i]));

    // Identify flare days
    const flareDays = sorted.filter(l => l.overallPain >= FLARE_THRESHOLD);
    if (flareDays.length === 0) return [];

    const totalFlares = flareDays.length;

    // For each flare, gather preceding days (1-3 days before)
    function getPrecedingLogs(flareDate: string) {
      const idx = dateIndex.get(flareDate);
      if (idx === undefined) return [];
      const preceding: typeof sorted = [];
      for (let i = 1; i <= LOOKBACK_DAYS; i++) {
        if (idx - i >= 0) preceding.push(sorted[idx - i]);
      }
      return preceding;
    }

    const weatherMap = new Map(weatherData.map(w => [w.date, w]));

    // Count trigger patterns
    const triggerCounts: Record<string, { count: number; totalPain: number; desc: string; category: Trigger['category'] }> = {};

    function addTrigger(id: string, pain: number, desc: string, category: Trigger['category']) {
      if (!triggerCounts[id]) triggerCounts[id] = { count: 0, totalPain: 0, desc, category };
      triggerCounts[id].count++;
      triggerCounts[id].totalPain += pain;
    }

    for (const flare of flareDays) {
      const preceding = getPrecedingLogs(flare.date);
      if (preceding.length === 0) continue;

      // Poor sleep (< 5hrs or quality < 4)
      const poorSleep = preceding.some(l => l.sleepHours < 5 || l.sleepQuality < 4);
      if (poorSleep) addTrigger('poor-sleep', flare.overallPain, 'Poor sleep (< 5hrs or quality < 4/10) in preceding days', 'sleep');

      // Low mood
      const lowMood = preceding.some(l => l.mood <= 3);
      if (lowMood) addTrigger('low-mood', flare.overallPain, 'Low mood (≤ 3/10) in preceding days', 'mood');

      // Low energy
      const lowEnergy = preceding.some(l => (l.energyLevel ?? 50) < 30);
      if (lowEnergy) addTrigger('low-energy', flare.overallPain, 'Very low energy (< 30%) in preceding days', 'energy');

      // Energy overexertion
      const overexertion = preceding.some(l => (l.energySpent ?? 0) > 80);
      if (overexertion) addTrigger('overexertion', flare.overallPain, 'Energy overexertion (> 80% spent) in preceding days', 'energy');

      // Missed medications
      for (const prevLog of preceding) {
        for (const ml of prevLog.medications) {
          if (!ml.taken) {
            const med = medications.find(m => m.id === ml.medicationId);
            if (med) {
              addTrigger(`missed-med-${med.id}`, flare.overallPain, `Missed ${med.name} in preceding days`, 'medication');
            }
          }
        }
      }

      // Weather: pressure drop
      for (const prevLog of preceding) {
        const w = weatherMap.get(prevLog.date);
        if (w && w.pressureChange < -3) {
          addTrigger('pressure-drop', flare.overallPain, 'Barometric pressure drop (> 3 hPa) before flare', 'weather');
          break;
        }
      }

      // Weather: high humidity
      for (const prevLog of preceding) {
        const w = weatherMap.get(prevLog.date);
        if (w && w.humidity > 80) {
          addTrigger('high-humidity', flare.overallPain, 'High humidity (> 80%) before flare', 'weather');
          break;
        }
      }

      // Weather: temperature swing
      const temps = preceding.map(p => weatherMap.get(p.date)?.temperature).filter((t): t is number => t !== undefined);
      if (temps.length >= 2 && Math.max(...temps) - Math.min(...temps) > 8) {
        addTrigger('temp-swing', flare.overallPain, 'Temperature swing (> 8°C) in preceding days', 'weather');
      }

      // Symptom escalation: any symptom that spiked ≥ 3 points
      for (const prevLog of preceding) {
        for (const sl of prevLog.symptoms) {
          if (sl.severity >= 6) {
            const sym = symptoms.find(s => s.id === sl.symptomId);
            if (sym) {
              addTrigger(`sym-spike-${sym.id}`, flare.overallPain, `${sym.name} was severe (≥ 6/10) before flare`, 'symptom');
            }
          }
        }
      }
    }

    // Convert to Trigger objects and sort by percentage
    return Object.entries(triggerCounts)
      .map(([id, data]): Trigger => ({
        id,
        label: id.startsWith('missed-med-') ? data.desc.replace('Missed ', '').replace(' in preceding days', '') + ' (missed)'
          : id.startsWith('sym-spike-') ? data.desc.replace(' was severe (≥ 6/10) before flare', '') + ' spike'
          : id === 'poor-sleep' ? 'Poor Sleep'
          : id === 'low-mood' ? 'Low Mood'
          : id === 'low-energy' ? 'Low Energy'
          : id === 'overexertion' ? 'Overexertion'
          : id === 'pressure-drop' ? 'Pressure Drop'
          : id === 'high-humidity' ? 'High Humidity'
          : id === 'temp-swing' ? 'Temp Swing'
          : id,
        icon: CATEGORY_ICONS[data.category] ?? AlertTriangle,
        occurrences: data.count,
        totalFlares,
        percentage: Math.round((data.count / totalFlares) * 100),
        avgImpact: +(data.totalPain / data.count).toFixed(1),
        description: data.desc,
        category: data.category,
      }))
      .filter(t => t.occurrences >= 2 || (totalFlares <= 3 && t.occurrences >= 1))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 8);
  }, [logs, symptoms, medications, weatherData]);

  if (triggers.length === 0) return null;

  const totalFlares = triggers[0]?.totalFlares ?? 0;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crosshair className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 className="font-semibold text-sm">Flare Triggers</h3>
        </div>
        <Badge variant="outline" className="text-xs text-muted-foreground">
          {totalFlares} flare day{totalFlares !== 1 ? 's' : ''} analyzed
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">
        Patterns detected 24–72 hours before high-pain days (≥ 7/10)
      </p>

      <div className="space-y-3">
        {triggers.map(trigger => {
          const Icon = trigger.icon;
          const colorClass = CATEGORY_COLORS[trigger.category] ?? 'text-primary';
          return (
            <div key={trigger.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={cn('h-4 w-4', colorClass)} aria-hidden="true" />
                  <span className="text-sm font-medium">{trigger.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {trigger.occurrences}/{trigger.totalFlares}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn('text-xs tabular-nums', {
                      'bg-severity-severe/10 text-severity-severe': trigger.percentage >= 75,
                      'bg-severity-high/10 text-severity-high': trigger.percentage >= 50 && trigger.percentage < 75,
                      'bg-severity-moderate/10 text-severity-moderate': trigger.percentage >= 30 && trigger.percentage < 50,
                    })}
                  >
                    {trigger.percentage}%
                  </Badge>
                </div>
              </div>
              <Progress
                value={trigger.percentage}
                className={cn('h-1.5', {
                  '[&>div]:bg-severity-severe': trigger.percentage >= 75,
                  '[&>div]:bg-severity-high': trigger.percentage >= 50 && trigger.percentage < 75,
                  '[&>div]:bg-severity-moderate': trigger.percentage >= 30 && trigger.percentage < 50,
                  '[&>div]:bg-muted-foreground': trigger.percentage < 30,
                })}
              />
              <p className="text-[11px] text-muted-foreground">{trigger.description}</p>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground/60 text-center">
        Based on {logs.length} logged days · Triggers present in ≥ 2 flare events
      </p>
    </Card>
  );
}
