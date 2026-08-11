import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Shield, Database, Heart, Brain, FlaskConical, Download } from 'lucide-react';
import { useBrainFog } from '@/contexts/BrainFogContext';
import { ReminderManager } from '@/components/ReminderManager';
import { toast } from 'sonner';
import { FOOD_TAGS } from '@/types/health';
import type { DailyLog, Medication, Symptom } from '@/types/health';

export default function SettingsPage() {
  const { brainFogMode, setBrainFogMode } = useBrainFog();

  const KEYS = ['health-conditions', 'health-symptoms', 'health-medications', 'health-treatments', 'health-logs'] as const;

  function download(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const exportData = (format: 'json' | 'csv') => {
    // Parsed straight from localStorage, so the shape is only as trustworthy as
    // what was written there. Narrowed to domain types at each use site below.
    const data: Record<string, unknown[]> = {};
    let hasData = false;
    for (const key of KEYS) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) { data[key.replace('health-', '')] = JSON.parse(raw); hasData = true; }
      } catch { /* skip */ }
    }
    if (!hasData) { toast.error('No data to export'); return; }

    const stamp = new Date().toISOString().slice(0, 10);

    if (format === 'json') {
      download(`chronicle-export-${stamp}.json`, JSON.stringify(data, null, 2), 'application/json');
      toast.success('JSON exported');
      return;
    }

    const logs = (data.logs ?? []) as DailyLog[];
    if (logs.length === 0) { toast.error('No logs to export as CSV'); return; }

    const symptoms = (data.symptoms ?? []) as Symptom[];
    const medications = (data.medications ?? []) as Medication[];
    const symNames = symptoms.map((s) => s.name);
    const medNames = medications.map((m) => m.name);

    const headers = ['Date', 'Pain', 'Sleep Hours', 'Sleep Quality', 'Mood', 'Energy %', 'Energy Spent %',
      ...symNames.map((n: string) => `Sym: ${n}`),
      ...medNames.map((n: string) => `Med: ${n}`),
      'Notes'];

    const rows = logs.map((l) => {
      const symVals = symptoms.map((s) => {
        const sl = (l.symptoms ?? []).find((x) => x.symptomId === s.id);
        return sl ? sl.severity : 0;
      });
      const medVals = medications.map((m) => {
        const ml = (l.medications ?? []).find((x) => x.medicationId === m.id);
        return ml?.taken ? 'Yes' : 'No';
      });
      return [l.date, l.overallPain, l.sleepHours, l.sleepQuality, l.mood, l.energyLevel ?? '', l.energySpent ?? '',
        ...symVals, ...medVals, `"${(l.notes ?? '').replace(/"/g, '""')}"`].join(',');
    });

    download(`chronicle-export-${stamp}.csv`, [headers.join(','), ...rows].join('\n'), 'text/csv');
    toast.success('CSV exported');
  };

  const loadDemoData = () => {
    if (localStorage.getItem('health-conditions')) {
      toast.error('Data already exists. Clear your browser data first.');
      return;
    }

    const c1 = { id: crypto.randomUUID(), name: 'Fibromyalgia', notes: 'Chronic widespread pain', createdAt: new Date().toISOString() };
    const c2 = { id: crypto.randomUUID(), name: 'Migraine', notes: 'Episodic with aura', createdAt: new Date().toISOString() };
    const s1 = { id: crypto.randomUUID(), name: 'Joint Pain', conditionIds: [c1.id], createdAt: new Date().toISOString() };
    const s2 = { id: crypto.randomUUID(), name: 'Headache', conditionIds: [c2.id], createdAt: new Date().toISOString() };
    const s3 = { id: crypto.randomUUID(), name: 'Fatigue', conditionIds: [c1.id, c2.id], createdAt: new Date().toISOString() };
    const m1 = { id: crypto.randomUUID(), name: 'Ibuprofen', dosage: '400mg', conditionIds: [c1.id], active: true };
    const m2 = { id: crypto.randomUUID(), name: 'Sumatriptan', dosage: '50mg', conditionIds: [c2.id], active: true };
    const t1 = { id: crypto.randomUUID(), name: 'Yoga', dosage: '30 min', conditionIds: [c1.id], active: true };

    const logs = [];
    for (let i = 20; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const date = d.toISOString().slice(0, 10);
      const pain = Math.round(3 + Math.random() * 5);
      logs.push({
        id: crypto.randomUUID(),
        date,
        overallPain: pain,
        sleepHours: +(5 + Math.random() * 3).toFixed(1),
        sleepQuality: Math.round(4 + Math.random() * 4),
        mood: Math.round(10 - pain + Math.random() * 2),
        energyLevel: Math.round(30 + Math.random() * 50),
        energySpent: Math.round(20 + Math.random() * 40),
        symptoms: [
          { symptomId: s1.id, severity: Math.round(2 + Math.random() * 6) },
          { symptomId: s2.id, severity: Math.round(Math.random() * 8) },
          { symptomId: s3.id, severity: Math.round(3 + Math.random() * 5) },
        ],
        medications: [
          { medicationId: m1.id, taken: Math.random() > 0.2 },
          { medicationId: m2.id, taken: Math.random() > 0.4 },
        ],
        treatments: [{ treatmentId: t1.id, done: Math.random() > 0.3 }],
        sideEffects: [],
        socialBattery: Math.round(20 + Math.random() * 60),
        socialEvents: Math.random() > 0.4 ? [{
          id: crypto.randomUUID(),
          type: (['social', 'work', 'medical', 'alone'] as const)[Math.floor(Math.random() * 4)],
          label: ['Coffee with friend', 'Team meeting', 'Doctor visit', 'Reading'][Math.floor(Math.random() * 4)],
          groupSize: Math.floor(Math.random() * 5),
          durationMinutes: Math.round(30 + Math.random() * 120),
          location: (['home', 'out', 'online'] as const)[Math.floor(Math.random() * 3)],
          preEnergy: Math.round(40 + Math.random() * 40),
          postEnergy: Math.round(10 + Math.random() * 40),
          recoveryMinutes: Math.round(15 + Math.random() * 60),
          notes: '',
        }] : [],
        foodTags: FOOD_TAGS.filter(() => Math.random() > 0.6),
        notes: '',
        createdAt: new Date().toISOString(),
      });
    }

    localStorage.setItem('health-conditions', JSON.stringify([c1, c2]));
    localStorage.setItem('health-symptoms', JSON.stringify([s1, s2, s3]));
    localStorage.setItem('health-medications', JSON.stringify([m1, m2]));
    localStorage.setItem('health-treatments', JSON.stringify([t1]));
    localStorage.setItem('health-logs', JSON.stringify(logs));

    toast.success('Demo data loaded! Refreshing...');
    setTimeout(() => window.location.href = '/', 500);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <h2 className="text-2xl font-semibold">Settings</h2>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <h3 className="font-semibold">Brain Fog Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Simplifies the interface with larger buttons and fewer options for low-energy days.
                </p>
              </div>
            </div>
            <Switch
              checked={brainFogMode}
              onCheckedChange={(v) => setBrainFogMode(v)}
              aria-label="Toggle brain fog mode"
            />
          </div>
        </Card>

        {/* Medication Reminders */}
        <ReminderManager />

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-semibold">Privacy</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            All your health data is stored locally on this device. Nothing is sent to any server.
          </p>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Download className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-semibold">Export Data</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Download all your health data for backup or to share with your healthcare provider.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportData('json')}>
              Export JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
              Export CSV
            </Button>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-semibold">Data</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Your data is saved in your browser's local storage. Clearing browser data will remove it.
          </p>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <FlaskConical className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-semibold">Demo Data</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Load sample conditions, symptoms, medications, and 21 days of logs to explore the dashboard.
          </p>
          <Button variant="outline" size="sm" onClick={loadDemoData}>
            Load demo data
          </Button>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-semibold">Coming soon</h3>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Medical research papers for your conditions</li>
            <li>• Community insights & top treatments</li>
          </ul>
        </Card>
      </div>
    </AppLayout>
  );
}
