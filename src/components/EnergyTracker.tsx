import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useHealthData } from '@/hooks/useHealthData';
import { AlertTriangle, TrendingDown, Shield, Info } from 'lucide-react';

interface EnergyTrackerProps {
  energyLevel: number;
  energySpent: number;
  onEnergyLevelChange: (v: number) => void;
  onEnergySpentChange: (v: number) => void;
}

const ENERGY_PRESETS = [
  { label: 'Shower', cost: 10 },
  { label: 'Cooking', cost: 15 },
  { label: 'Errands', cost: 25 },
  { label: 'Exercise', cost: 30 },
  { label: 'Work', cost: 35 },
  { label: 'Social', cost: 20 },
];

interface PacingInsight {
  crashRisk: 'low' | 'moderate' | 'high' | 'critical';
  crashThreshold: number;       // % spent that historically led to bad next-day
  safeBudget: number;            // recommended max spend today
  avgNextDayPain: number;        // predicted next-day pain at current spend
  baselineNextDayPain: number;   // avg next-day pain when pacing well
  overexertionDays: number;      // how many past days exceeded threshold
  message: string;
}

function usePacingPredictor(energyLevel: number, energySpent: number): PacingInsight | null {
  const { logs } = useHealthData();

  return useMemo(() => {
    if (logs.length < 7) return null;

    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));

    // Build day pairs: (today's energy data) → (tomorrow's pain/energy)
    const pairs: { spent: number; budget: number; ratio: number; nextPain: number; nextEnergy: number }[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const today = sorted[i];
      const tomorrow = sorted[i + 1];
      const budget = today.energyLevel ?? 50;
      const spent = today.energySpent ?? 0;
      if (budget <= 0) continue;
      pairs.push({
        spent,
        budget,
        ratio: spent / budget,
        nextPain: tomorrow.overallPain,
        nextEnergy: tomorrow.energyLevel ?? 50,
      });
    }

    if (pairs.length < 5) return null;

    // Find the "crash threshold" — the spend ratio above which next-day pain jumps
    // Split into "paced" (ratio <= 0.7) and "overexerted" (ratio > 0.7) and compare
    const thresholds = [0.5, 0.6, 0.7, 0.8, 0.9];
    let bestThreshold = 0.7;
    let bestDiff = 0;

    for (const t of thresholds) {
      const under = pairs.filter(p => p.ratio <= t);
      const over = pairs.filter(p => p.ratio > t);
      if (under.length < 2 || over.length < 2) continue;
      const avgUnder = under.reduce((s, p) => s + p.nextPain, 0) / under.length;
      const avgOver = over.reduce((s, p) => s + p.nextPain, 0) / over.length;
      const diff = avgOver - avgUnder;
      if (diff > bestDiff) { bestDiff = diff; bestThreshold = t; }
    }

    const paced = pairs.filter(p => p.ratio <= bestThreshold);
    const overexerted = pairs.filter(p => p.ratio > bestThreshold);

    const baselineNextDayPain = paced.length > 0
      ? paced.reduce((s, p) => s + p.nextPain, 0) / paced.length
      : pairs.reduce((s, p) => s + p.nextPain, 0) / pairs.length;

    const overexertPain = overexerted.length > 0
      ? overexerted.reduce((s, p) => s + p.nextPain, 0) / overexerted.length
      : baselineNextDayPain;

    // Current ratio
    const currentRatio = energyLevel > 0 ? energySpent / energyLevel : 0;
    const crashThresholdPercent = Math.round(bestThreshold * 100);
    const safeBudget = Math.round(bestThreshold * energyLevel);

    // Interpolate predicted next-day pain
    let avgNextDayPain: number;
    if (currentRatio <= bestThreshold) {
      avgNextDayPain = baselineNextDayPain;
    } else {
      const excess = (currentRatio - bestThreshold) / (1 - bestThreshold);
      avgNextDayPain = baselineNextDayPain + (overexertPain - baselineNextDayPain) * Math.min(excess, 1);
    }

    // Determine risk level
    let crashRisk: PacingInsight['crashRisk'];
    if (currentRatio > 0.95) crashRisk = 'critical';
    else if (currentRatio > bestThreshold) crashRisk = 'high';
    else if (currentRatio > bestThreshold * 0.85) crashRisk = 'moderate';
    else crashRisk = 'low';

    // Message
    let message: string;
    if (crashRisk === 'critical') {
      message = `You've used nearly all your energy. Based on ${overexerted.length} similar days, expect elevated pain tomorrow (~${overexertPain.toFixed(1)}/10). Rest now to minimize impact.`;
    } else if (crashRisk === 'high') {
      message = `You've crossed your crash threshold (${crashThresholdPercent}%). On past days like this, next-day pain averaged ${overexertPain.toFixed(1)}/10 vs ${baselineNextDayPain.toFixed(1)}/10 when pacing.`;
    } else if (crashRisk === 'moderate') {
      message = `Approaching your limit. You have ~${safeBudget - energySpent}% left before hitting your crash threshold. Consider saving energy for essential tasks.`;
    } else {
      message = `Good pacing! You have ${remaining(energyLevel, energySpent)}% remaining. Your safe limit is ${safeBudget}% spent.`;
    }

    return {
      crashRisk,
      crashThreshold: crashThresholdPercent,
      safeBudget,
      avgNextDayPain: +avgNextDayPain.toFixed(1),
      baselineNextDayPain: +baselineNextDayPain.toFixed(1),
      overexertionDays: overexerted.length,
      message,
    };
  }, [logs, energyLevel, energySpent]);
}

function remaining(budget: number, spent: number) {
  return Math.max(0, budget - spent);
}

const RISK_STYLES: Record<string, { border: string; badge: string; icon: typeof Shield }> = {
  low: { border: 'border-l-severity-low', badge: 'bg-severity-low/10 text-severity-low', icon: Shield },
  moderate: { border: 'border-l-severity-moderate', badge: 'bg-severity-moderate/10 text-severity-moderate', icon: Info },
  high: { border: 'border-l-severity-high', badge: 'bg-severity-high/10 text-severity-high', icon: AlertTriangle },
  critical: { border: 'border-l-severity-severe', badge: 'bg-severity-severe/10 text-severity-severe', icon: AlertTriangle },
};

export function EnergyTracker({ energyLevel, energySpent, onEnergyLevelChange, onEnergySpentChange }: EnergyTrackerProps) {
  const rem = remaining(energyLevel, energySpent);
  const percentUsed = energyLevel > 0 ? (energySpent / energyLevel) * 100 : 0;
  const pacing = usePacingPredictor(energyLevel, energySpent);

  const getBarColor = () => {
    if (percentUsed > 90) return 'bg-destructive';
    if (percentUsed > 70) return 'bg-severity-high';
    if (percentUsed > 50) return 'bg-severity-moderate';
    return 'bg-success';
  };

  const addCost = (cost: number) => {
    onEnergySpentChange(Math.min(energyLevel, energySpent + cost));
  };

  return (
    <Card className="p-5 space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        🥄 Energy Envelope
      </h3>

      {/* Budget slider */}
      <div className="space-y-1">
        <div className="flex justify-between items-baseline">
          <label htmlFor="energy-budget" className="text-sm font-medium">Today's budget</label>
          <span className="text-sm font-semibold tabular-nums text-primary">{energyLevel}%</span>
        </div>
        <input
          type="range"
          id="energy-budget"
          min={0}
          max={100}
          step={5}
          value={energyLevel}
          onChange={e => onEnergyLevelChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer touch-target bg-muted [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
          aria-label={`Energy budget: ${energyLevel}%`}
        />
      </div>

      {/* Visual bar with crash threshold marker */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Spent: {energySpent}%</span>
          <span>Remaining: {rem}%</span>
        </div>
        <div className="relative">
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-300', getBarColor())}
              style={{ width: `${Math.min(100, percentUsed)}%` }}
              role="progressbar"
              aria-valuenow={energySpent}
              aria-valuemin={0}
              aria-valuemax={energyLevel}
              aria-label={`Energy spent: ${energySpent} of ${energyLevel}`}
            />
          </div>
          {/* Crash threshold marker */}
          {pacing && (
            <div
              className="absolute top-0 h-4 w-0.5 bg-severity-high/70"
              style={{ left: `${pacing.crashThreshold}%` }}
              title={`Crash threshold: ${pacing.crashThreshold}%`}
            />
          )}
        </div>
        {pacing && (
          <div className="flex justify-between text-[10px] text-muted-foreground/70">
            <span>Safe zone</span>
            <span>Crash threshold: {pacing.crashThreshold}%</span>
          </div>
        )}
      </div>

      {/* Pacing prediction card */}
      {pacing && (
        <div className={cn(
          'rounded-lg border-l-4 p-3 space-y-2 bg-muted/40',
          RISK_STYLES[pacing.crashRisk].border,
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(() => { const Icon = RISK_STYLES[pacing.crashRisk].icon; return <Icon className="h-4 w-4" aria-hidden="true" />; })()}
              <span className="text-sm font-medium">Pacing Forecast</span>
            </div>
            <Badge className={cn('text-xs', RISK_STYLES[pacing.crashRisk].badge)}>
              {pacing.crashRisk === 'low' ? 'On Track' : pacing.crashRisk === 'moderate' ? 'Caution' : pacing.crashRisk === 'high' ? 'Over Limit' : 'Crash Risk'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {pacing.message}
          </p>
          <div className="flex gap-3 text-[10px] text-muted-foreground/70">
            <span>Predicted tomorrow: ~{pacing.avgNextDayPain}/10 pain</span>
            <span>·</span>
            <span>Baseline: {pacing.baselineNextDayPain}/10</span>
          </div>
        </div>
      )}

      {/* Quick-add activities */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Quick add activity cost:</p>
        <div className="flex flex-wrap gap-2">
          {ENERGY_PRESETS.map(p => {
            const wouldExceed = pacing && (energySpent + p.cost) > pacing.safeBudget;
            return (
              <button
                key={p.label}
                onClick={() => addCost(p.cost)}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-full transition-colors touch-target',
                  wouldExceed
                    ? 'bg-severity-high/10 text-severity-high hover:bg-severity-high/20 border border-severity-high/30'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent',
                )}
                disabled={rem <= 0}
                title={wouldExceed ? `This will exceed your crash threshold (${pacing!.crashThreshold}%)` : undefined}
              >
                {p.label} (-{p.cost}%)
                {wouldExceed && ' ⚠'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual spent slider */}
      <div className="space-y-1">
        <div className="flex justify-between items-baseline">
          <label htmlFor="energy-spent" className="text-sm font-medium">Total spent</label>
          <span className="text-sm font-semibold tabular-nums">{energySpent}%</span>
        </div>
        <input
          type="range"
          id="energy-spent"
          min={0}
          max={100}
          step={5}
          value={energySpent}
          onChange={e => onEnergySpentChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer touch-target bg-muted [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
          aria-label={`Energy spent: ${energySpent}%`}
        />
      </div>

      {!pacing && (
        <p className="text-[10px] text-muted-foreground/60 text-center">
          Log 7+ days to unlock predictive pacing insights
        </p>
      )}
    </Card>
  );
}
