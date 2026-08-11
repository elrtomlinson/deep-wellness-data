import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHealthData } from '@/hooks/useHealthData';
import { CalendarClock, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, getDay, getWeek, getMonth, differenceInDays } from 'date-fns';

interface CyclePattern {
  id: string;
  symptomName: string;
  cycleType: 'weekly' | 'monthly' | 'seasonal';
  label: string;
  description: string;
  strength: number; // 0-1 confidence
  peakLabel: string;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SEASON_NAMES = ['Winter', 'Spring', 'Summer', 'Autumn'];

function getSeasonIndex(month: number): number {
  if (month <= 1 || month === 11) return 0; // Winter
  if (month <= 4) return 1; // Spring
  if (month <= 7) return 2; // Summer
  return 3; // Autumn
}

/** Compute coefficient of variation for bucket averages — higher = more cyclical */
function cyclicStrength(bucketAvgs: number[]): number {
  const nonZero = bucketAvgs.filter(v => v > 0);
  if (nonZero.length < 2) return 0;
  const mean = nonZero.reduce((s, v) => s + v, 0) / nonZero.length;
  if (mean === 0) return 0;
  const variance = nonZero.reduce((s, v) => s + (v - mean) ** 2, 0) / nonZero.length;
  const cv = Math.sqrt(variance) / mean;
  // Normalize: cv > 0.3 is meaningful, cap at 1
  return Math.min(cv / 0.6, 1);
}

function detectCycles(
  symptomId: string,
  symptomName: string,
  logs: { date: string; severity: number }[],
  totalDays: number,
): CyclePattern[] {
  if (logs.length < 14) return [];

  const patterns: CyclePattern[] = [];

  // Weekly pattern (need >= 14 days)
  if (totalDays >= 14) {
    const dayBuckets: number[][] = Array.from({ length: 7 }, () => []);
    logs.forEach(l => {
      const dow = getDay(new Date(l.date));
      dayBuckets[dow].push(l.severity);
    });
    const dayAvgs = dayBuckets.map(b => b.length > 0 ? b.reduce((s, v) => s + v, 0) / b.length : 0);
    const strength = cyclicStrength(dayAvgs);

    if (strength > 0.25) {
      const peakIdx = dayAvgs.indexOf(Math.max(...dayAvgs));
      const troughIdx = dayAvgs.indexOf(Math.min(...dayAvgs.filter(v => v > 0)));
      patterns.push({
        id: `${symptomId}-weekly`,
        symptomName,
        cycleType: 'weekly',
        label: 'Weekly',
        description: `${symptomName} tends to peak on ${DAY_NAMES[peakIdx]}s (avg ${dayAvgs[peakIdx].toFixed(1)}/10) and is lowest on ${DAY_NAMES[troughIdx]}s (avg ${dayAvgs[troughIdx].toFixed(1)}/10).`,
        strength,
        peakLabel: DAY_NAMES[peakIdx],
      });
    }
  }

  // Monthly pattern (need >= 28 days)
  if (totalDays >= 28) {
    // Group by week-of-month (1-4)
    const weekBuckets: number[][] = Array.from({ length: 4 }, () => []);
    logs.forEach(l => {
      const day = new Date(l.date).getDate();
      const weekOfMonth = Math.min(Math.floor((day - 1) / 7), 3);
      weekBuckets[weekOfMonth].push(l.severity);
    });
    const weekAvgs = weekBuckets.map(b => b.length > 0 ? b.reduce((s, v) => s + v, 0) / b.length : 0);
    const strength = cyclicStrength(weekAvgs);

    if (strength > 0.2) {
      const weekLabels = ['1st week', '2nd week', '3rd week', '4th week'];
      const peakIdx = weekAvgs.indexOf(Math.max(...weekAvgs));
      patterns.push({
        id: `${symptomId}-monthly`,
        symptomName,
        cycleType: 'monthly',
        label: 'Monthly',
        description: `${symptomName} is typically worst during the ${weekLabels[peakIdx]} of each month (avg ${weekAvgs[peakIdx].toFixed(1)}/10).`,
        strength,
        peakLabel: weekLabels[peakIdx],
      });
    }
  }

  // Seasonal pattern (need >= 60 days spanning multiple months)
  if (totalDays >= 60) {
    const seasonBuckets: number[][] = Array.from({ length: 4 }, () => []);
    logs.forEach(l => {
      const month = new Date(l.date).getMonth();
      seasonBuckets[getSeasonIndex(month)].push(l.severity);
    });
    const seasonAvgs = seasonBuckets.map(b => b.length > 0 ? b.reduce((s, v) => s + v, 0) / b.length : 0);
    const filledSeasons = seasonAvgs.filter(v => v > 0).length;

    if (filledSeasons >= 2) {
      const strength = cyclicStrength(seasonAvgs);
      if (strength > 0.2) {
        const peakIdx = seasonAvgs.indexOf(Math.max(...seasonAvgs));
        patterns.push({
          id: `${symptomId}-seasonal`,
          symptomName,
          cycleType: 'seasonal',
          label: 'Seasonal',
          description: `${symptomName} appears worse in ${SEASON_NAMES[peakIdx]} (avg ${seasonAvgs[peakIdx].toFixed(1)}/10).`,
          strength,
          peakLabel: SEASON_NAMES[peakIdx],
        });
      }
    }
  }

  return patterns;
}

const CYCLE_BADGE: Record<string, string> = {
  weekly: 'bg-chart-1/10 text-chart-1',
  monthly: 'bg-chart-2/10 text-chart-2',
  seasonal: 'bg-chart-3/10 text-chart-3',
};

export function SymptomCycles() {
  const { logs, symptoms } = useHealthData();

  const patterns = useMemo(() => {
    if (logs.length < 14 || symptoms.length === 0) return [];

    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    const totalDays = sorted.length > 1
      ? differenceInDays(new Date(sorted[sorted.length - 1].date), new Date(sorted[0].date)) + 1
      : sorted.length;

    const allPatterns: CyclePattern[] = [];

    for (const sym of symptoms) {
      const symLogs = sorted
        .map(l => {
          const sl = l.symptoms.find(s => s.symptomId === sym.id);
          return sl ? { date: l.date, severity: sl.severity } : null;
        })
        .filter((l): l is { date: string; severity: number } => l !== null && l.severity > 0);

      if (symLogs.length >= 10) {
        allPatterns.push(...detectCycles(sym.id, sym.name, symLogs, totalDays));
      }
    }

    // Also check overall pain
    const painLogs = sorted.filter(l => l.overallPain > 0).map(l => ({ date: l.date, severity: l.overallPain }));
    if (painLogs.length >= 10) {
      allPatterns.push(...detectCycles('overall-pain', 'Overall Pain', painLogs, totalDays));
    }

    return allPatterns
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 6);
  }, [logs, symptoms]);

  if (patterns.length === 0) return null;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RotateCw className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 className="font-semibold text-sm">Symptom Cycles</h3>
        </div>
        <Badge variant="outline" className="text-xs text-muted-foreground">
          {patterns.length} pattern{patterns.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">
        Recurring weekly, monthly, and seasonal patterns detected in your data
      </p>

      <div className="space-y-3">
        {patterns.map(pattern => (
          <div key={pattern.id} className="rounded-lg bg-muted/40 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm font-medium">{pattern.symptomName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge className={cn('text-xs', CYCLE_BADGE[pattern.cycleType])}>
                  {pattern.label}
                </Badge>
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {Math.round(pattern.strength * 100)}% conf
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {pattern.description}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground">Peak:</span>
              <Badge variant="secondary" className="text-[10px]">{pattern.peakLabel}</Badge>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Based on {logs.length} logged days · Higher confidence = stronger recurring pattern
      </p>
    </Card>
  );
}
