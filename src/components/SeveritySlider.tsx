import { cn } from '@/lib/utils';
import { getSeverityLevel } from '@/types/health';

interface SeveritySliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
  id: string;
  unit?: string;
  step?: number;
}

export function SeveritySlider({ label, value, onChange, max = 10, id, unit, step = 1 }: SeveritySliderProps) {
  const level = getSeverityLevel(value);
  const colorMap: Record<string, string> = {
    none: 'accent-muted-foreground',
    low: 'accent-severity-low',
    moderate: 'accent-severity-moderate',
    high: 'accent-severity-high',
    severe: 'accent-severity-severe',
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <Label htmlFor={id}>{label}</Label>
        <span className={cn('text-sm font-semibold tabular-nums', {
          'text-muted-foreground': level === 'none',
          'text-severity-low': level === 'low',
          'text-severity-moderate': level === 'moderate',
          'text-severity-high': level === 'high',
          'text-severity-severe': level === 'severe',
        })} aria-live="polite">
          {value}{unit ? ` ${unit}` : `/${max}`}
        </span>
      </div>
      <input
        type="range"
        id={id}
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={cn(
          'w-full h-2 rounded-full appearance-none cursor-pointer touch-target',
          'bg-muted [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md',
          '[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0',
        )}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={`${label}: ${value}${unit ? ` ${unit}` : ` out of ${max}`}`}
      />
    </div>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return <label htmlFor={htmlFor} className="text-sm font-medium">{children}</label>;
}
