import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { SideEffectLog, Medication, getSeverityLevel } from '@/types/health';
import { cn } from '@/lib/utils';

interface SideEffectLoggerProps {
  medications: Medication[];
  sideEffects: SideEffectLog[];
  onChange: (effects: SideEffectLog[]) => void;
}

const COMMON_SIDE_EFFECTS = [
  'Nausea', 'Dizziness', 'Headache', 'Drowsiness', 'Dry mouth',
  'Stomach upset', 'Insomnia', 'Brain fog', 'Appetite change', 'Rash',
];

export function SideEffectLogger({ medications, sideEffects, onChange }: SideEffectLoggerProps) {
  const activeMeds = medications.filter(m => m.active);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState(activeMeds[0]?.id ?? '');
  const [effect, setEffect] = useState('');
  const [severity, setSeverity] = useState(3);
  const [hoursAfter, setHoursAfter] = useState(2);

  if (activeMeds.length === 0) return null;

  const addEffect = () => {
    if (!effect.trim() || !selectedMedId) return;
    onChange([
      ...sideEffects,
      { medicationId: selectedMedId, effect: effect.trim(), severity, hoursAfterDose: hoursAfter },
    ]);
    setEffect('');
    setSeverity(3);
    setShowAdd(false);
  };

  const removeEffect = (index: number) => {
    onChange(sideEffects.filter((_, i) => i !== index));
  };

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Side Effects</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Log
        </Button>
      </div>

      {showAdd && (
        <div className="space-y-3 p-3 bg-muted/50 rounded-lg animate-fade-in">
          {/* Medication select */}
          <div className="space-y-1">
            <label htmlFor="se-med" className="text-sm font-medium">Medication</label>
            <select
              id="se-med"
              value={selectedMedId}
              onChange={e => setSelectedMedId(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {activeMeds.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Effect - quick picks + custom */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Side effect</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_SIDE_EFFECTS.map(se => (
                <button
                  key={se}
                  onClick={() => setEffect(se)}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full transition-colors',
                    effect === se
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent'
                  )}
                >
                  {se}
                </button>
              ))}
            </div>
            <Input
              value={effect}
              onChange={e => setEffect(e.target.value)}
              placeholder="Or type a custom side effect..."
            />
          </div>

          {/* Severity */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label htmlFor="se-severity" className="text-sm font-medium">Severity</label>
              <span className="text-sm tabular-nums">{severity}/10</span>
            </div>
            <input
              type="range" id="se-severity" min={1} max={10} value={severity}
              onChange={e => setSeverity(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
            />
          </div>

          {/* Hours after dose */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label htmlFor="se-hours" className="text-sm font-medium">Hours after dose</label>
              <span className="text-sm tabular-nums">{hoursAfter}h</span>
            </div>
            <input
              type="range" id="se-hours" min={0} max={24} step={0.5} value={hoursAfter}
              onChange={e => setHoursAfter(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
            />
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={addEffect} disabled={!effect.trim()}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Listed effects */}
      {sideEffects.length > 0 && (
        <div className="space-y-2">
          {sideEffects.map((se, i) => {
            const med = medications.find(m => m.id === se.medicationId);
            const level = getSeverityLevel(se.severity);
            return (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn({
                    'text-severity-low border-severity-low': level === 'low',
                    'text-severity-moderate border-severity-moderate': level === 'moderate',
                    'text-severity-high border-severity-high': level === 'high',
                    'text-severity-severe border-severity-severe': level === 'severe',
                  })}>
                    {se.severity}/10
                  </Badge>
                  <span>{se.effect}</span>
                  <span className="text-muted-foreground text-xs">
                    {med?.name} · {se.hoursAfterDose}h after
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeEffect(i)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {sideEffects.length === 0 && !showAdd && (
        <p className="text-xs text-muted-foreground">No side effects logged today. Tap "Log" to record any.</p>
      )}
    </Card>
  );
}
