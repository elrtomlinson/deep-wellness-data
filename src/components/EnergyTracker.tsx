import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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

export function EnergyTracker({ energyLevel, energySpent, onEnergyLevelChange, onEnergySpentChange }: EnergyTrackerProps) {
  const remaining = Math.max(0, energyLevel - energySpent);
  const percentUsed = energyLevel > 0 ? (energySpent / energyLevel) * 100 : 0;

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

      {/* Visual bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Spent: {energySpent}%</span>
          <span>Remaining: {remaining}%</span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden relative">
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
      </div>

      {/* Quick-add activities */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Quick add activity cost:</p>
        <div className="flex flex-wrap gap-2">
          {ENERGY_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => addCost(p.cost)}
              className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-accent transition-colors touch-target"
              disabled={remaining <= 0}
            >
              {p.label} (-{p.cost}%)
            </button>
          ))}
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
    </Card>
  );
}
