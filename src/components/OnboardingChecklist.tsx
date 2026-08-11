import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Check, Circle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface Step {
  id: string;
  label: string;
  hint: string;
  to: string;
  done: boolean;
}

interface Props {
  hasConditions: boolean;
  hasSymptoms: boolean;
  hasMedications: boolean;
  logCount: number;
}

/** Guided setup checklist shown until the user has enough data for insights. */
export function OnboardingChecklist({ hasConditions, hasSymptoms, hasMedications, logCount }: Props) {
  const [dismissed, setDismissed] = useLocalStorage('onboarding-dismissed', false);

  const steps: Step[] = [
    { id: 'conditions', label: 'Add your conditions', hint: 'Everything else links back to these', to: '/conditions', done: hasConditions },
    { id: 'symptoms', label: 'Add symptoms to track', hint: 'Pick the ones that vary day to day', to: '/conditions', done: hasSymptoms },
    { id: 'meds', label: 'Add medications or treatments', hint: 'Needed for effectiveness analysis', to: '/conditions', done: hasMedications },
    { id: 'log', label: 'Log your first day', hint: 'Takes under a minute', to: '/track', done: logCount > 0 },
    { id: 'week', label: 'Log 5 days for insights', hint: `${Math.min(logCount, 5)}/5 days logged`, to: '/track', done: logCount >= 5 },
  ];

  const completed = steps.filter(s => s.done).length;
  if (dismissed || completed === steps.length) return null;

  const next = steps.find(s => !s.done)!;

  return (
    <Card className="p-4 space-y-3 animate-fade-in">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm">Get set up</h3>
          <p className="text-xs text-muted-foreground">{completed} of {steps.length} complete</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 -mr-1 -mt-1"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss setup checklist"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div
        className="h-1.5 rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={steps.length}
      >
        <div className="h-full bg-primary transition-all" style={{ width: `${(completed / steps.length) * 100}%` }} />
      </div>

      <ul className="space-y-1.5">
        {steps.map(step => (
          <li key={step.id} className="flex items-center gap-2.5 min-h-[36px]">
            {step.done
              ? <Check className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
              : <Circle className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />}
            <div className="min-w-0">
              <p className={cn('text-sm leading-tight', step.done && 'text-muted-foreground line-through')}>{step.label}</p>
              {!step.done && <p className="text-xs text-muted-foreground">{step.hint}</p>}
            </div>
          </li>
        ))}
      </ul>

      <Button asChild size="sm" className="w-full min-h-[44px]">
        <Link to={next.to}>{next.label}</Link>
      </Button>
    </Card>
  );
}
