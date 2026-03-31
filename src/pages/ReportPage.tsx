import { useState, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useHealthData } from '@/hooks/useHealthData';
import { AppLayout } from '@/components/AppLayout';
import { getSeverityLevel } from '@/types/health';
import { FileText, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

type ReportRange = 7 | 14 | 30;

export default function ReportPage() {
  const { conditions, symptoms, medications, treatments, logs, getRecentLogs } = useHealthData();
  const [range, setRange] = useState<ReportRange>(14);
  const [copied, setCopied] = useState(false);

  const recentLogs = getRecentLogs(range);

  const report = useMemo(() => {
    if (recentLogs.length === 0) return null;

    const startDate = format(subDays(new Date(), range), 'dd MMM yyyy');
    const endDate = format(new Date(), 'dd MMM yyyy');

    // --- Situation ---
    const avgPain = recentLogs.reduce((s, l) => s + l.overallPain, 0) / recentLogs.length;
    const avgSleep = recentLogs.reduce((s, l) => s + l.sleepQuality, 0) / recentLogs.length;
    const avgMood = recentLogs.reduce((s, l) => s + l.mood, 0) / recentLogs.length;
    const avgSleepHrs = recentLogs.reduce((s, l) => s + l.sleepHours, 0) / recentLogs.length;
    const avgEnergy = recentLogs.reduce((s, l) => s + (l.energyLevel ?? 50), 0) / recentLogs.length;

    // --- Symptom analysis ---
    const symptomStats: Record<string, { total: number; count: number; maxSev: number }> = {};
    recentLogs.forEach(log => {
      log.symptoms.forEach(sl => {
        if (sl.severity === 0) return;
        if (!symptomStats[sl.symptomId]) symptomStats[sl.symptomId] = { total: 0, count: 0, maxSev: 0 };
        symptomStats[sl.symptomId].total += sl.severity;
        symptomStats[sl.symptomId].count++;
        symptomStats[sl.symptomId].maxSev = Math.max(symptomStats[sl.symptomId].maxSev, sl.severity);
      });
    });

    const topSymptoms = Object.entries(symptomStats)
      .map(([id, stats]) => {
        const sym = symptoms.find(s => s.id === id);
        return { name: sym?.name ?? 'Unknown', avg: stats.total / stats.count, max: stats.maxSev, frequency: stats.count };
      })
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 8);

    // --- Medication adherence ---
    const medAdherence: Record<string, { taken: number; total: number }> = {};
    recentLogs.forEach(log => {
      log.medications.forEach(ml => {
        if (!medAdherence[ml.medicationId]) medAdherence[ml.medicationId] = { taken: 0, total: 0 };
        medAdherence[ml.medicationId].total++;
        if (ml.taken) medAdherence[ml.medicationId].taken++;
      });
    });

    const medReport = Object.entries(medAdherence).map(([id, stats]) => {
      const med = medications.find(m => m.id === id);
      return { name: med?.name ?? 'Unknown', dosage: med?.dosage ?? '', adherence: Math.round((stats.taken / stats.total) * 100) };
    });

    // --- Side effects ---
    const sideEffectSummary: Record<string, { effect: string; medName: string; count: number; avgSeverity: number }> = {};
    recentLogs.forEach(log => {
      (log.sideEffects ?? []).forEach(se => {
        const key = `${se.medicationId}-${se.effect}`;
        const med = medications.find(m => m.id === se.medicationId);
        if (!sideEffectSummary[key]) {
          sideEffectSummary[key] = { effect: se.effect, medName: med?.name ?? 'Unknown', count: 0, avgSeverity: 0 };
        }
        sideEffectSummary[key].count++;
        sideEffectSummary[key].avgSeverity += se.severity;
      });
    });
    Object.values(sideEffectSummary).forEach(s => { s.avgSeverity = s.avgSeverity / s.count; });
    const topSideEffects = Object.values(sideEffectSummary).sort((a, b) => b.count - a.count).slice(0, 5);

    // --- Treatment compliance ---
    const treatAdherence: Record<string, { done: number; total: number }> = {};
    recentLogs.forEach(log => {
      (log.treatments ?? []).forEach(tl => {
        if (!treatAdherence[tl.treatmentId]) treatAdherence[tl.treatmentId] = { done: 0, total: 0 };
        treatAdherence[tl.treatmentId].total++;
        if (tl.done) treatAdherence[tl.treatmentId].done++;
      });
    });
    const treatReport = Object.entries(treatAdherence).map(([id, stats]) => {
      const treat = treatments.find(t => t.id === id);
      return { name: treat?.name ?? 'Unknown', adherence: Math.round((stats.done / stats.total) * 100) };
    });

    // --- Build text ---
    const lines: string[] = [];
    lines.push(`CLINICAL BRIEF — ${startDate} to ${endDate}`);
    lines.push(`Reporting period: ${recentLogs.length} days logged\n`);

    lines.push('── SITUATION ──');
    lines.push(`Conditions: ${conditions.map(c => c.name).join(', ') || 'None listed'}`);
    lines.push(`Average pain: ${avgPain.toFixed(1)}/10`);
    lines.push(`Average sleep: ${avgSleepHrs.toFixed(1)} hrs (quality ${avgSleep.toFixed(1)}/10)`);
    lines.push(`Average mood: ${avgMood.toFixed(1)}/10`);
    lines.push(`Average energy level: ${avgEnergy.toFixed(0)}%\n`);

    lines.push('── BACKGROUND ──');
    if (topSymptoms.length > 0) {
      lines.push('Top symptoms by severity:');
      topSymptoms.forEach(s => {
        lines.push(`  • ${s.name}: avg ${s.avg.toFixed(1)}/10, peak ${s.max}/10, reported ${s.frequency}/${recentLogs.length} days`);
      });
    }
    lines.push('');

    if (medReport.length > 0) {
      lines.push('Medication adherence:');
      medReport.forEach(m => {
        lines.push(`  • ${m.name}${m.dosage ? ` (${m.dosage})` : ''}: ${m.adherence}%`);
      });
      lines.push('');
    }

    if (treatReport.length > 0) {
      lines.push('Treatment compliance:');
      treatReport.forEach(t => {
        lines.push(`  • ${t.name}: ${t.adherence}%`);
      });
      lines.push('');
    }

    lines.push('── ASSESSMENT ──');
    if (topSideEffects.length > 0) {
      lines.push('Reported side effects:');
      topSideEffects.forEach(se => {
        lines.push(`  • ${se.effect} (${se.medName}): ${se.count} occurrences, avg severity ${se.avgSeverity.toFixed(1)}/10`);
      });
    }

    // Simple trend
    if (recentLogs.length >= 4) {
      const half = Math.floor(recentLogs.length / 2);
      const firstHalf = recentLogs.slice(0, half);
      const secondHalf = recentLogs.slice(half);
      const avgFirst = firstHalf.reduce((s, l) => s + l.overallPain, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((s, l) => s + l.overallPain, 0) / secondHalf.length;
      const diff = avgSecond - avgFirst;
      if (Math.abs(diff) > 0.5) {
        lines.push(`\nPain trend: ${diff > 0 ? 'Worsening' : 'Improving'} (${diff > 0 ? '+' : ''}${diff.toFixed(1)} over period)`);
      } else {
        lines.push('\nPain trend: Stable over reporting period');
      }
    }

    lines.push('');
    lines.push('── RECOMMENDATION ──');
    lines.push('This data summary is auto-generated from patient self-reported logs.');
    lines.push('Please review with patient to discuss treatment adjustments.\n');
    lines.push('Generated by Chronicle Health Tracker');

    return {
      text: lines.join('\n'),
      avgPain, avgSleep, avgMood, avgEnergy,
      topSymptoms, medReport, treatReport, topSideEffects,
    };
  }, [recentLogs, range, conditions, symptoms, medications, treatments]);

  const copyReport = async () => {
    if (!report) return;
    await navigator.clipboard.writeText(report.text);
    setCopied(true);
    toast.success('Report copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Clinical Brief</h2>
          <div className="flex gap-1">
            {([7, 14, 30] as ReportRange[]).map(r => (
              <Button
                key={r}
                variant={range === r ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRange(r)}
              >
                {r}d
              </Button>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Generate a professional SBAR summary of your health data to share with your healthcare provider.
        </p>

        {!report || recentLogs.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground" aria-hidden="true" />
            <h3 className="text-lg font-medium">Not enough data</h3>
            <p className="text-muted-foreground text-sm">
              Log at least a few days of data to generate your clinical brief.
            </p>
          </Card>
        ) : (
          <>
            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-2">
              <MiniStat label="Pain" value={report.avgPain.toFixed(1)} />
              <MiniStat label="Sleep" value={report.avgSleep.toFixed(1)} />
              <MiniStat label="Mood" value={report.avgMood.toFixed(1)} />
              <MiniStat label="Energy" value={`${report.avgEnergy.toFixed(0)}%`} />
            </div>

            {/* Report card */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">SBAR Report</h3>
                <Button variant="outline" size="sm" onClick={copyReport}>
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-foreground bg-muted/50 p-4 rounded-lg overflow-auto max-h-[60vh]">
                {report.text}
              </pre>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3 text-center">
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}
