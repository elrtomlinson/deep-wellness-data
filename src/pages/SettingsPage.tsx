import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Shield, Database, Heart } from 'lucide-react';

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-semibold">Settings</h2>

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
            <li>• Customisable tracking reminders</li>
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
