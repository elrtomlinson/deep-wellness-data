import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useHealthData } from '@/hooks/useHealthData';
import { AppLayout } from '@/components/AppLayout';
import { getSeverityLevel } from '@/types/health';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Moon, Brain, TrendingUp, AlertCircle, Settings2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { WeatherWidget } from '@/components/WeatherWidget';
import { FlareForecast } from '@/components/FlareForecast';
import { MedicationEffectivenessTracker } from '@/components/MedicationEffectivenessTracker';
import { TreatmentEffectivenessTracker } from '@/components/TreatmentEffectivenessTracker';
import { CorrelationAnalysis } from '@/components/CorrelationAnalysis';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--severity-high))',
  'hsl(var(--severity-moderate))',
  'hsl(var(--severity-low))',
];

interface DashboardTracked {
  coreMetrics: string[]; // 'Pain' | 'Sleep' | 'Mood' | 'Energy'
  symptoms: string[];
  medications: string[];
  treatments: string[];
}

const CORE_METRICS = [
  { id: 'Pain', label: 'Pain', color: 'hsl(var(--severity-high))' },
  { id: 'Sleep', label: 'Sleep Quality', color: 'hsl(var(--chart-2))' },
  { id: 'Mood', label: 'Mood', color: 'hsl(var(--chart-4))' },
  { id: 'Energy', label: 'Energy', color: 'hsl(var(--chart-5))' },
];

export default function DashboardPage() {
  const { conditions, symptoms, medications, treatments, logs, getRecentLogs } = useHealthData();
  const RANGE_OPTIONS = [7, 14, 30, 90] as const;
  const [days, setDays] = useLocalStorage<number>('dashboard-range-days', 14);
  const recentLogs = getRecentLogs(days);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayLog = logs.find(l => l.date === todayStr);

  const [tracked, setTracked] = useLocalStorage<DashboardTracked>('dashboard-tracked-v2', {
    coreMetrics: ['Pain', 'Sleep', 'Mood'],
    symptoms: [],
    medications: [],
    treatments: [],
  });

  const [showSettings, setShowSettings] = useState(false);

  const toggleCore = (id: string) => {
    setTracked(prev => ({
      ...prev,
      coreMetrics: prev.coreMetrics.includes(id)
        ? prev.coreMetrics.filter(i => i !== id)
        : [...prev.coreMetrics, id],
    }));
  };

  const toggleTracked = (category: 'symptoms' | 'medications' | 'treatments', id: string) => {
    setTracked(prev => ({
      ...prev,
      [category]: prev[category].includes(id)
        ? prev[category].filter(i => i !== id)
        : [...prev[category], id],
    }));
  };

  const chartData = useMemo(() => {
    return recentLogs.map(log => {
      const entry: Record<string, string | number> = {
        date: format(new Date(log.date), 'MMM d'),
      };

      if (tracked.coreMetrics.includes('Pain')) entry.Pain = log.overallPain;
      if (tracked.coreMetrics.includes('Sleep')) entry.Sleep = log.sleepQuality;
      if (tracked.coreMetrics.includes('Mood')) entry.Mood = log.mood;
      if (tracked.coreMetrics.includes('Energy')) entry.Energy = +((log.energyLevel ?? 50) / 10).toFixed(1);

      tracked.symptoms.forEach(symId => {
        const sym = symptoms.find(s => s.id === symId);
        if (!sym) return;
        const sl = log.symptoms.find(s => s.symptomId === symId);
        entry[`S: ${sym.name}`] = sl?.severity ?? 0;
      });

      tracked.medications.forEach(medId => {
        const med = medications.find(m => m.id === medId);
        if (!med) return;
        const ml = log.medications.find(m => m.medicationId === medId);
        entry[`M: ${med.name}`] = ml?.taken ? 10 : 0;
      });

      tracked.treatments.forEach(treatId => {
        const treat = treatments.find(t => t.id === treatId);
        if (!treat) return;
        const tl = (log.treatments ?? []).find(t => t.treatmentId === treatId);
        entry[`T: ${treat.name}`] = tl?.done ? 10 : 0;
      });

      return entry;
    });
  }, [recentLogs, tracked, symptoms, medications, treatments]);

  const allLines = useMemo(() => {
    const lines: { key: string; color: string; dashed?: boolean }[] = [];

    // Core metrics
    CORE_METRICS.forEach(m => {
      if (tracked.coreMetrics.includes(m.id)) {
        lines.push({ key: m.id, color: m.color });
      }
    });

    // Custom tracked items
    let ci = 0;
    tracked.symptoms.forEach(id => {
      const sym = symptoms.find(s => s.id === id);
      if (sym) lines.push({ key: `S: ${sym.name}`, color: CHART_COLORS[ci++ % CHART_COLORS.length], dashed: true });
    });
    tracked.medications.forEach(id => {
      const med = medications.find(m => m.id === id);
      if (med) lines.push({ key: `M: ${med.name}`, color: CHART_COLORS[ci++ % CHART_COLORS.length], dashed: true });
    });
    tracked.treatments.forEach(id => {
      const treat = treatments.find(t => t.id === id);
      if (treat) lines.push({ key: `T: ${treat.name}`, color: CHART_COLORS[ci++ % CHART_COLORS.length], dashed: true });
    });
    return lines;
  }, [tracked, symptoms, medications, treatments]);

  const hasData = conditions.length > 0 || logs.length > 0;
  const hasTrackableItems = symptoms.length > 0 || medications.length > 0 || treatments.length > 0;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)} aria-expanded={showSettings}>
            <Settings2 className="h-4 w-4 mr-1" aria-hidden="true" />
            Customise
          </Button>
        </div>

        {/* Metric selection */}
        {showSettings && (
          <Card className="p-4 space-y-3 animate-fade-in">
            <h3 className="font-semibold text-sm">Timeline Chart Settings</h3>
            <p className="text-xs text-muted-foreground">Choose which variables to display on the trends chart.</p>

            <fieldset>
              <legend className="text-sm font-medium mb-2">Core Metrics</legend>
              <div className="flex flex-wrap gap-3">
                {CORE_METRICS.map(m => (
                  <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={tracked.coreMetrics.includes(m.id)}
                      onCheckedChange={() => toggleCore(m.id)}
                    />
                    <span className="text-sm">{m.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {symptoms.length > 0 && (
              <fieldset>
                <legend className="text-sm font-medium mb-2">Symptoms</legend>
                <div className="flex flex-wrap gap-3">
                  {symptoms.map(s => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={tracked.symptoms.includes(s.id)}
                        onCheckedChange={() => toggleTracked('symptoms', s.id)}
                      />
                      <span className="text-sm">{s.name}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {medications.length > 0 && (
              <fieldset>
                <legend className="text-sm font-medium mb-2">Medications</legend>
                <div className="flex flex-wrap gap-3">
                  {medications.map(m => (
                    <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={tracked.medications.includes(m.id)}
                        onCheckedChange={() => toggleTracked('medications', m.id)}
                      />
                      <span className="text-sm">{m.name}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {treatments.length > 0 && (
              <fieldset>
                <legend className="text-sm font-medium mb-2">Treatments</legend>
                <div className="flex flex-wrap gap-3">
                  {treatments.map(t => (
                    <label key={t.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={tracked.treatments.includes(t.id)}
                        onCheckedChange={() => toggleTracked('treatments', t.id)}
                      />
                      <span className="text-sm">{t.name}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </Card>
        )}

        {/* Flare forecast */}
        <FlareForecast />

        {/* Weather */}
        <WeatherWidget />

        {!hasData ? (
          <Card className="p-8 text-center space-y-3">
            <Activity className="h-10 w-10 mx-auto text-muted-foreground" aria-hidden="true" />
            <h3 className="text-lg font-medium">Welcome to Chronicle</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Start by adding your conditions and symptoms, then log your first day to see trends and insights here.
            </p>
          </Card>
        ) : (
          <>
            {/* Today's summary */}
            {todayLog ? (
              <div className="grid grid-cols-4 gap-2 sm:gap-3" role="group" aria-label="Today's summary">
                <SummaryCard icon={<Activity className="h-4 w-4" />} label="Pain" value={todayLog.overallPain} max={10} />
                <SummaryCard icon={<Moon className="h-4 w-4" />} label="Sleep" value={todayLog.sleepQuality} max={10} />
                <SummaryCard icon={<Brain className="h-4 w-4" />} label="Mood" value={todayLog.mood} max={10} />
                <SummaryCard icon={<Zap className="h-4 w-4" />} label="Energy" value={todayLog.energyLevel ?? 50} max={100} unit="%" />
              </div>
            ) : (
              <Card className="p-4 border-dashed flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">You haven't logged today yet.</p>
              </Card>
            )}

            {/* Timeline chart */}
            {chartData.length > 1 && allLines.length > 0 && (
              <Card className="p-3 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">{days}-Day Timeline</h3>
                  <div className="flex gap-1">
                    {RANGE_OPTIONS.map(d => (
                      <Button
                        key={d}
                        variant={days === d ? 'default' : 'ghost'}
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setDays(d)}
                      >
                        {d}d
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="h-48" role="img" aria-label="Customisable timeline chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                          fontSize: 11,
                        }}
                      />
                      {allLines.map(line => (
                        <Line
                          key={line.key}
                          type="monotone"
                          dataKey={line.key}
                          stroke={line.color}
                          strokeWidth={line.dashed ? 1.5 : 2}
                          dot={false}
                          strokeDasharray={line.dashed ? '5 3' : undefined}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 mt-3 justify-center text-xs">
                  {allLines.map(line => (
                    <span key={line.key} className="flex items-center gap-1">
                      <span
                        className="w-3 h-0.5 inline-block rounded"
                        style={{ backgroundColor: line.color }}
                      />
                      {line.key}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Correlation Analysis */}
            <CorrelationAnalysis />

            {/* Medication effectiveness */}
            <MedicationEffectivenessTracker />

            {/* Treatment effectiveness */}
            <TreatmentEffectivenessTracker />

            {/* Today's symptoms */}
            {todayLog && todayLog.symptoms.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 text-sm">Today's Symptoms</h3>
                <div className="space-y-2">
                  {todayLog.symptoms
                    .filter(s => s.severity > 0)
                    .sort((a, b) => b.severity - a.severity)
                    .map(sl => {
                      const sym = symptoms.find(s => s.id === sl.symptomId);
                      if (!sym) return null;
                      const level = getSeverityLevel(sl.severity);
                      return (
                        <div key={sl.symptomId} className="flex items-center justify-between">
                          <span className="text-sm">{sym.name}</span>
                          <Badge variant="outline" className={cn({
                            'text-severity-low border-severity-low': level === 'low',
                            'text-severity-moderate border-severity-moderate': level === 'moderate',
                            'text-severity-high border-severity-high': level === 'high',
                            'text-severity-severe border-severity-severe': level === 'severe',
                          })}>
                            {sl.severity}/10
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

function SummaryCard({ icon, label, value, max, unit }: { icon: React.ReactNode; label: string; value: number; max: number; unit?: string }) {
  return (
    <Card className="p-2.5 sm:p-4 text-center" role="status" aria-label={`${label}: ${value}${unit ?? ''} out of ${max}`}>
      <div className="flex justify-center text-primary mb-0.5" aria-hidden="true">{icon}</div>
      <p className="text-xl sm:text-2xl font-bold tabular-nums">{value}{unit ?? ''}</p>
      <p className="text-[10px] sm:text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}
