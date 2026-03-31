import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus, X, Clock } from 'lucide-react';
import { useReminders } from '@/hooks/useReminders';
import { useHealthData } from '@/hooks/useHealthData';

export function ReminderManager() {
  const { medications } = useHealthData();
  const { settings, toggleNotifications, setReminder, removeReminder, getReminder } = useReminders(medications);
  const activeMeds = medications.filter(m => m.active);

  return (
    <div className="space-y-4">
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <h3 className="font-semibold">Medication Reminders</h3>
              <p className="text-sm text-muted-foreground">
                Get notified when it's time to take your medications.
              </p>
            </div>
          </div>
          <Switch
            checked={settings.notificationsEnabled}
            onCheckedChange={toggleNotifications}
            aria-label="Toggle medication reminders"
          />
        </div>
      </Card>

      {settings.notificationsEnabled && activeMeds.length > 0 && (
        <Card className="p-5 space-y-4">
          <h4 className="text-sm font-semibold">Configure Reminders</h4>
          <p className="text-xs text-muted-foreground">
            Set reminder times for each medication. A follow-up will ask about side effects after each dose.
          </p>

          <div className="space-y-4">
            {activeMeds.map(med => {
              const reminder = getReminder(med.id);
              return (
                <MedicationReminderRow
                  key={med.id}
                  name={med.name}
                  dosage={med.dosage}
                  reminder={reminder}
                  onEnable={() => setReminder(med.id, { enabled: true })}
                  onDisable={() => removeReminder(med.id)}
                  onAddTime={(time) => {
                    const current = reminder?.times ?? [];
                    if (!current.includes(time)) {
                      setReminder(med.id, { times: [...current, time].sort() });
                    }
                  }}
                  onRemoveTime={(time) => {
                    const current = reminder?.times ?? [];
                    setReminder(med.id, { times: current.filter(t => t !== time) });
                  }}
                  onFollowUpChange={(mins) => {
                    setReminder(med.id, { followUpMinutes: mins });
                  }}
                />
              );
            })}
          </div>
        </Card>
      )}

      {settings.notificationsEnabled && activeMeds.length === 0 && (
        <Card className="p-5 text-center">
          <p className="text-sm text-muted-foreground">
            No active medications. Add medications in the Conditions page first.
          </p>
        </Card>
      )}
    </div>
  );
}

interface MedicationReminderRowProps {
  name: string;
  dosage: string;
  reminder: ReturnType<ReturnType<typeof useReminders>['getReminder']>;
  onEnable: () => void;
  onDisable: () => void;
  onAddTime: (time: string) => void;
  onRemoveTime: (time: string) => void;
  onFollowUpChange: (mins: number) => void;
}

function MedicationReminderRow({
  name, dosage, reminder, onEnable, onDisable, onAddTime, onRemoveTime, onFollowUpChange,
}: MedicationReminderRowProps) {
  const [newTime, setNewTime] = useState('09:00');
  const isActive = !!reminder?.enabled;

  return (
    <div className="border rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium">{name}</span>
          {dosage && <span className="text-xs text-muted-foreground ml-2">{dosage}</span>}
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={(v) => v ? onEnable() : onDisable()}
          aria-label={`Toggle reminder for ${name}`}
        />
      </div>

      {isActive && reminder && (
        <>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <span className="text-xs font-medium">Reminder times</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {reminder.times.map(time => (
                <Badge key={time} variant="secondary" className="gap-1">
                  {time}
                  <button onClick={() => onRemoveTime(time)} className="ml-1 hover:text-destructive" aria-label={`Remove ${time}`}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="h-7 w-24 text-xs"
                  aria-label="New reminder time"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => onAddTime(newTime)}
                  aria-label="Add time"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Side-effect follow-up after</span>
            <select
              value={reminder.followUpMinutes}
              onChange={(e) => onFollowUpChange(Number(e.target.value))}
              className="text-xs border rounded px-2 py-1 bg-background"
              aria-label="Follow-up delay"
            >
              <option value={0}>Off</option>
              <option value={30}>30 min</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={240}>4 hours</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}
