import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useHealthData } from '@/hooks/useHealthData';
import { FlaskConical, Plus, CheckCircle2, XCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInDays, parseISO } from 'date-fns';

interface Experiment {
  id: string;
  hypothesis: string; // "Morning stretching reduces afternoon pain"
  variable: string; // the habit/intervention
  metric: 'pain' | 'sleep' | 'mood' | 'energy'; // what we're measuring
  startDate: string;
  durationDays: number; // total experiment length
  baselineDays: number; // days of baseline before intervention
  status: 'active' | 'completed' | 'cancelled';
  /** Dates where user marks they performed the intervention */
  interventionDates: string[];
}

interface ExperimentResult {
  baselineAvg: number;
  interventionAvg: number;
  difference: number;
  percentChange: number;
  significance: 'significant' | 'suggestive' | 'inconclusive';
  pValue: number;
}

function computeResult(experiment: Experiment, logs: { date: string; value: number }[]): ExperimentResult | null {
  const interventionSet = new Set(experiment.interventionDates);
  const baseline: number[] = [];
  const intervention: number[] = [];

  logs.forEach(l => {
    if (interventionSet.has(l.date)) {
      intervention.push(l.value);
    } else {
      baseline.push(l.value);
    }
  });

  if (baseline.length < 3 || intervention.length < 3) return null;

  const avgB = baseline.reduce((s, v) => s + v, 0) / baseline.length;
  const avgI = intervention.reduce((s, v) => s + v, 0) / intervention.length;
  const diff = avgI - avgB;
  const pctChange = avgB !== 0 ? (diff / avgB) * 100 : 0;

  // Welch's t-test approximation
  const varB = baseline.reduce((s, v) => s + (v - avgB) ** 2, 0) / (baseline.length - 1);
  const varI = intervention.reduce((s, v) => s + (v - avgI) ** 2, 0) / (intervention.length - 1);
  const se = Math.sqrt(varB / baseline.length + varI / intervention.length);
  const t = se > 0 ? Math.abs(diff) / se : 0;

  // Rough p-value approximation from t-statistic
  const df = baseline.length + intervention.length - 2;
  const pValue = Math.exp(-0.717 * t - 0.416 * t * t);

  const significance: ExperimentResult['significance'] =
    pValue < 0.05 ? 'significant' :
    pValue < 0.15 ? 'suggestive' : 'inconclusive';

  return {
    baselineAvg: +avgB.toFixed(1),
    interventionAvg: +avgI.toFixed(1),
    difference: +diff.toFixed(1),
    percentChange: +pctChange.toFixed(1),
    significance,
    pValue: +pValue.toFixed(3),
  };
}

export function HabitExperiments() {
  const { logs } = useHealthData();
  const [experiments, setExperiments] = useLocalStorage<Experiment[]>('habit-experiments', []);
  const [showNew, setShowNew] = useState(false);
  const [newHypothesis, setNewHypothesis] = useState('');
  const [newVariable, setNewVariable] = useState('');
  const [newMetric, setNewMetric] = useState<Experiment['metric']>('pain');
  const [newDuration, setNewDuration] = useState(14);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const createExperiment = () => {
    if (!newHypothesis.trim() || !newVariable.trim()) return;
    const exp: Experiment = {
      id: crypto.randomUUID(),
      hypothesis: newHypothesis.trim(),
      variable: newVariable.trim(),
      metric: newMetric,
      startDate: todayStr,
      durationDays: newDuration,
      baselineDays: Math.floor(newDuration / 3),
      status: 'active',
      interventionDates: [],
    };
    setExperiments(prev => [...prev, exp]);
    setNewHypothesis(''); setNewVariable(''); setShowNew(false);
  };

  const toggleIntervention = (expId: string) => {
    setExperiments(prev => prev.map(e => {
      if (e.id !== expId) return e;
      const has = e.interventionDates.includes(todayStr);
      return {
        ...e,
        interventionDates: has
          ? e.interventionDates.filter(d => d !== todayStr)
          : [...e.interventionDates, todayStr],
      };
    }));
  };

  const completeExperiment = (expId: string) => {
    setExperiments(prev => prev.map(e => e.id === expId ? { ...e, status: 'completed' } : e));
  };

  const removeExperiment = (expId: string) => {
    setExperiments(prev => prev.filter(e => e.id !== expId));
  };

  const getMetricValue = (log: typeof logs[0], metric: Experiment['metric']): number => {
    switch (metric) {
      case 'pain': return log.overallPain;
      case 'sleep': return log.sleepQuality;
      case 'mood': return log.mood;
      case 'energy': return (log.energyLevel ?? 50) / 10;
    }
  };

  const activeExps = experiments.filter(e => e.status === 'active');
  const completedExps = experiments.filter(e => e.status === 'completed');

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-5 w-5 text-primary" aria-hidden="true" />
        <h3 className="font-semibold text-sm">Self-Experiments</h3>
        <Badge variant="secondary" className="text-[10px] ml-auto">
          {activeExps.length} active
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Test whether habits or interventions actually help your symptoms with A/B-style tracking.
      </p>

      {/* Active experiments */}
      {activeExps.map(exp => {
        const daysSinceStart = differenceInDays(new Date(), parseISO(exp.startDate));
        const progress = Math.min(100, Math.round((daysSinceStart / exp.durationDays) * 100));
        const didToday = exp.interventionDates.includes(todayStr);
        const metricLogs = logs
          .filter(l => l.date >= exp.startDate)
          .map(l => ({ date: l.date, value: getMetricValue(l, exp.metric) }));
        const result = computeResult(exp, metricLogs);
        const isExpired = daysSinceStart >= exp.durationDays;

        return (
          <div key={exp.id} className="p-3 rounded-lg bg-muted/40 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium">{exp.hypothesis}</p>
                <p className="text-[10px] text-muted-foreground">
                  Testing: {exp.variable} → {exp.metric} | Day {daysSinceStart + 1}/{exp.durationDays}
                </p>
              </div>
              <Button
                variant={didToday ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs shrink-0"
                onClick={() => toggleIntervention(exp.id)}
              >
                {didToday ? <><CheckCircle2 className="h-3 w-3 mr-1" /> Done</> : 'Log Today'}
              </Button>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            {result && (
              <div className="flex items-center gap-3 text-[11px]">
                <span>Baseline: {result.baselineAvg}</span>
                <span>→ With: {result.interventionAvg}</span>
                <Badge variant="outline" className={cn('text-[10px]', {
                  'border-chart-2 text-chart-2': result.significance === 'significant',
                  'border-severity-moderate text-severity-moderate': result.significance === 'suggestive',
                  'border-muted-foreground': result.significance === 'inconclusive',
                })}>
                  {result.significance} (p={result.pValue})
                </Badge>
              </div>
            )}
            {isExpired && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs h-7 flex-1" onClick={() => completeExperiment(exp.id)}>
                  Complete Experiment
                </Button>
              </div>
            )}
          </div>
        );
      })}

      {/* Completed experiments */}
      {completedExps.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Past Results</p>
          {completedExps.slice(-3).map(exp => {
            const metricLogs = logs
              .filter(l => l.date >= exp.startDate)
              .map(l => ({ date: l.date, value: getMetricValue(l, exp.metric) }));
            const result = computeResult(exp, metricLogs);
            return (
              <div key={exp.id} className="flex items-center gap-2 p-2 rounded bg-muted/20 text-xs">
                {result && result.difference < 0 ? (
                  <TrendingDown className="h-3.5 w-3.5 text-chart-2 shrink-0" />
                ) : (
                  <TrendingUp className="h-3.5 w-3.5 text-severity-moderate shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{exp.variable}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {result ? `${exp.metric} changed ${result.percentChange > 0 ? '+' : ''}${result.percentChange}% — ${result.significance}` : 'Insufficient data'}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => removeExperiment(exp.id)}>
                  <XCircle className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* New experiment form */}
      {showNew ? (
        <div className="p-3 rounded-lg border border-dashed space-y-2">
          <Input
            placeholder="Hypothesis: e.g. 'Morning walks reduce pain'"
            value={newHypothesis}
            onChange={e => setNewHypothesis(e.target.value)}
            className="text-xs h-8"
          />
          <Input
            placeholder="Intervention: e.g. '10min morning walk'"
            value={newVariable}
            onChange={e => setNewVariable(e.target.value)}
            className="text-xs h-8"
          />
          <div className="flex gap-2">
            <select
              value={newMetric}
              onChange={e => setNewMetric(e.target.value as Experiment['metric'])}
              className="flex-1 h-8 rounded-md border bg-background px-2 text-xs"
            >
              <option value="pain">Measure: Pain</option>
              <option value="sleep">Measure: Sleep</option>
              <option value="mood">Measure: Mood</option>
              <option value="energy">Measure: Energy</option>
            </select>
            <select
              value={newDuration}
              onChange={e => setNewDuration(+e.target.value)}
              className="flex-1 h-8 rounded-md border bg-background px-2 text-xs"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={21}>21 days</option>
              <option value={30}>30 days</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 text-xs h-7" onClick={createExperiment}>Start</Button>
            <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setShowNew(true)}>
          <Plus className="h-3 w-3 mr-1" /> New Experiment
        </Button>
      )}
    </Card>
  );
}
