import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHealthData } from '@/hooks/useHealthData';
import { AlertTriangle, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractionAlert {
  medA: string;
  medB: string;
  avgPainAlone: number;
  avgPainCombined: number;
  difference: number;
  sampleSize: number;
  severity: 'warning' | 'caution' | 'info';
}

export function MedicationInteractionAlerts() {
  const { medications, logs } = useHealthData();

  const alerts = useMemo<InteractionAlert[]>(() => {
    const activeMeds = medications.filter(m => m.active);
    if (activeMeds.length < 2 || logs.length < 10) return [];

    const results: InteractionAlert[] = [];

    // For each pair of medications
    for (let i = 0; i < activeMeds.length; i++) {
      for (let j = i + 1; j < activeMeds.length; j++) {
        const medA = activeMeds[i];
        const medB = activeMeds[j];

        const bothTaken: number[] = [];
        const onlyA: number[] = [];
        const onlyB: number[] = [];
        const neither: number[] = [];

        logs.forEach(log => {
          const tookA = log.medications.find(m => m.medicationId === medA.id)?.taken ?? false;
          const tookB = log.medications.find(m => m.medicationId === medB.id)?.taken ?? false;
          const pain = log.overallPain;

          if (tookA && tookB) bothTaken.push(pain);
          else if (tookA) onlyA.push(pain);
          else if (tookB) onlyB.push(pain);
          else neither.push(pain);
        });

        if (bothTaken.length < 3) continue;

        const avgCombined = bothTaken.reduce((s, v) => s + v, 0) / bothTaken.length;

        // Compare combined vs best individual
        const aloneScores: number[] = [];
        if (onlyA.length >= 2) aloneScores.push(onlyA.reduce((s, v) => s + v, 0) / onlyA.length);
        if (onlyB.length >= 2) aloneScores.push(onlyB.reduce((s, v) => s + v, 0) / onlyB.length);

        if (aloneScores.length === 0) continue;

        const bestAlone = Math.min(...aloneScores);
        const diff = +(avgCombined - bestAlone).toFixed(1);

        // Flag if combined is worse than the best individual
        if (diff > 0.5) {
          results.push({
            medA: medA.name,
            medB: medB.name,
            avgPainAlone: +bestAlone.toFixed(1),
            avgPainCombined: +avgCombined.toFixed(1),
            difference: diff,
            sampleSize: bothTaken.length,
            severity: diff >= 2 ? 'warning' : diff >= 1 ? 'caution' : 'info',
          });
        }
      }
    }

    return results.sort((a, b) => b.difference - a.difference);
  }, [medications, logs]);

  if (alerts.length === 0) return null;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-severity-high" aria-hidden="true" />
        <h3 className="font-semibold text-sm">Medication Interaction Alerts</h3>
        <Badge variant="secondary" className="text-[10px] ml-auto">
          {alerts.length} flag{alerts.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Medication combinations that correlate with worse outcomes than taking them separately.
      </p>

      <div className="space-y-2">
        {alerts.map((a, i) => (
          <div
            key={i}
            className={cn('p-2.5 rounded-lg space-y-1', {
              'bg-severity-high/10 border border-severity-high/20': a.severity === 'warning',
              'bg-severity-moderate/10 border border-severity-moderate/20': a.severity === 'caution',
              'bg-muted/40': a.severity === 'info',
            })}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Pill className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs font-medium">{a.medA}</span>
              <span className="text-[10px] text-muted-foreground">+</span>
              <span className="text-xs font-medium">{a.medB}</span>
              <Badge
                variant="outline"
                className={cn('text-[10px] ml-auto', {
                  'border-severity-high text-severity-high': a.severity === 'warning',
                  'border-severity-moderate text-severity-moderate': a.severity === 'caution',
                })}
              >
                +{a.difference} pain
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Combined avg pain: {a.avgPainCombined}/10 vs {a.avgPainAlone}/10 when taken individually
              <span className="text-[10px]"> ({a.sampleSize} days observed)</span>
            </p>
            {a.severity === 'warning' && (
              <p className="text-[10px] text-severity-high font-medium">
                ⚠ Consider discussing this combination with your doctor
              </p>
            )}
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground text-center italic">
        Statistical observation only — not medical advice. Discuss findings with your healthcare provider.
      </p>
    </Card>
  );
}
