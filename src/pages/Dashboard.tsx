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
import { WeatherCorrelation } from '@/components/WeatherCorrelation';
import { FlareForecast } from '@/components/FlareForecast';
import { MedicationEffectivenessTracker } from '@/components/MedicationEffectivenessTracker';

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
  symptoms: string[];
  medications: string[];
  treatments: string[];
}

export default function DashboardPage() {
  const { conditions, symptoms, medications, treatments, logs, getRecentLogs } = useHealthData();
  const recentLogs = getRecentLogs(14);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayLog = logs.find(l => l.date === todayStr);

  const [tracked, setTracked] = useLocalStorage<DashboardTracked>('dashboard-tracked', {
    symptoms: [],
    medications: [],
    treatments: [],
  });

  const [showSettings, setShowSettings] = useState(false);

  const toggleTracked = (category: keyof DashboardTracked, id: string) => {
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
        Pain: log.overallPain,
        Sleep: log.sleepQuality,
        Mood: log.mood,
      };

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

  const extraLines = useMemo(() => {
    const lines: { key: string; color: string }[] = [];
    let ci = 0;
    tracked.symptoms.forEach(id => {
      const sym = symptoms.find(s => s.id === id);
      if (sym) lines.push({ key: `S: ${sym.name}`, color: CHART_COLORS[ci++ % CHART_COLORS.length] });
    });
    tracked.medications.forEach(id => {
      const med = medications.find(m => m.id === id);
      if (med) lines.push({ key: `M: ${med.name}`, color: CHART_COLORS[ci++ % CHART_COLORS.length] });
    });
    tracked.treatments.forEach(id => {
      const treat = treatments.find(t => t.id === id);
      if (treat) lines.push({ key: `T: ${treat.name}`, color: CHART_COLORS[ci++ % CHART_COLORS.length] });
    });
    return lines;
  }, [tracked, symptoms, medications, treatments]);

  // Basic correlation: sleep quality vs pain
  const correlation = useMemo(() => {
    if (recentLogs.length < 3) return null;
    const pairs = recentLogs.map(l => ({ sleep: l.sleepQuality, pain: l.overallPain }));
    const avgSleep = pairs.reduce((s, p) => s + p.sleep, 0) / pairs.length;
    const avgPain = pairs.reduce((s, p) => s + p.pain, 0) / pairs.length;
    let num = 0, denA = 0, denB = 0;
    pairs.forEach(p => {
      const ds = p.sleep - avgSleep;
      const dp = p.pain - avgPain;
      num += ds * dp;
      denA += ds * ds;
      denB += dp * dp;
    });
    const den = Math.sqrt(denA * denB);
    if (den === 0) return null;
    return num / den;
  }, [recentLogs]);

  const hasData = conditions.length > 0 || logs.length > 0;
  const hasTrackableItems = symptoms.length > 0 || medications.length > 0 || treatments.length > 0;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          {hasTrackableItems && (
            <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)} aria-expanded={showSettings}>
              <Settings2 className="h-4 w-4 mr-1" aria-hidden="true" />
              Customise
            </Button>
          )}
        </div>

        {/* Metric selection */}
        {showSettings && hasTrackableItems && (
          <Card className="p-5 space-y-4 animate-fade-in">
            <h3 className="font-semibold text-sm">Track on Dashboard</h3>
            <p className="text-xs text-muted-foreground">Select symptoms, medications, and treatments to overlay on your trends chart.</p>

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

        {/* Flare forecast - always visible */}
        <FlareForecast />

        {/* Weather - always visible */}
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="group" aria-label="Today's summary">
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



            {/* Trends chart */}
            {chartData.length > 1 && (
              <Card className="p-5">
                <h3 className="font-semibold mb-4">14-Day Trends</h3>
                <div className="h-48" role="img" aria-label="Chart showing trends over the last 14 days">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                          fontSize: 12,
                        }}
                      />
                      <Line type="monotone" dataKey="Pain" stroke="hsl(var(--severity-high))" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Sleep" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Mood" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} />
                      {extraLines.map(line => (
                        <Line key={line.key} type="monotone" dataKey={line.key} stroke={line.color} strokeWidth={2} dot={false} strokeDasharray="5 3" />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-4 mt-3 justify-center text-xs">
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-severity-high inline-block rounded" /> Pain</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-chart-2 inline-block rounded" /> Sleep</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-chart-4 inline-block rounded" /> Mood</span>
                  {extraLines.map(line => (
                    <span key={line.key} className="flex items-center gap-1">
                      <span className="w-3 h-0.5 inline-block rounded" style={{ backgroundColor: line.color }} />
                      {line.key}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Correlation insight */}
            {correlation !== null && (
              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-sm">Sleep ↔ Pain Correlation</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {correlation < -0.3
                        ? 'Better sleep quality appears to correlate with lower pain levels. Prioritising sleep may help manage your symptoms.'
                        : correlation > 0.3
                          ? 'Higher sleep quality seems to coincide with higher pain — this may indicate pain is disrupting your sleep patterns.'
                          : 'No strong correlation detected between sleep quality and pain in the last 14 days. Keep tracking for more insights.'}
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      r = {correlation.toFixed(2)}
                    </Badge>
                  </div>
                </div>
              </Card>
            )}

            {/* Weather correlation */}
            <WeatherCorrelation />

            {/* Top symptoms */}
            {todayLog && todayLog.symptoms.length > 0 && (
              <Card className="p-5">
                <h3 className="font-semibold mb-3">Today's Symptoms</h3>
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
    <Card className="p-4 text-center" role="status" aria-label={`${label}: ${value}${unit ?? ''} out of ${max}`}>
      <div className="flex justify-center text-primary mb-1" aria-hidden="true">{icon}</div>
      <p className="text-2xl font-bold tabular-nums">{value}{unit ?? ''}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}
