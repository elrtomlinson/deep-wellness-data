import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Shield, Database, Heart, Brain } from 'lucide-react';
import { useBrainFog } from '@/contexts/BrainFogContext';
import { ReminderManager } from '@/components/ReminderManager';

export default function SettingsPage() {
  const { brainFogMode, setBrainFogMode } = useBrainFog();

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
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
            <Database className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-semibold">Data</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Your data is saved in your browser's local storage. Clearing browser data will remove it.
          </p>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-semibold">Coming soon</h3>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Medical research papers for your conditions</li>
            <li>• Promethease DNA report upload & analysis</li>
            <li>• Community insights & top treatments</li>
            <li>• Data export & backup</li>
          </ul>
        </Card>
      </div>
    </AppLayout>
  );
}
