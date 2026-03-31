import { useCallback, useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Medication } from '@/types/health';
import { toast } from 'sonner';

export interface MedicationReminder {
  medicationId: string;
  enabled: boolean;
  times: string[]; // HH:mm format
  followUpMinutes: number; // minutes after dose to ask about side effects
}

export interface ReminderSettings {
  notificationsEnabled: boolean;
  reminders: MedicationReminder[];
}

const DEFAULT_SETTINGS: ReminderSettings = {
  notificationsEnabled: false,
  reminders: [],
};

export function useReminders(medications: Medication[]) {
  const [settings, setSettings] = useLocalStorage<ReminderSettings>('health-reminders', DEFAULT_SETTINGS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastNotified = useRef<Set<string>>(new Set());

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return false;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setSettings(prev => ({ ...prev, notificationsEnabled: true }));
      toast.success('Notifications enabled');
      return true;
    }
    toast.error('Notification permission denied');
    return false;
  }, [setSettings]);

  const toggleNotifications = useCallback(async (enabled: boolean) => {
    if (enabled) {
      await requestPermission();
    } else {
      setSettings(prev => ({ ...prev, notificationsEnabled: false }));
    }
  }, [requestPermission, setSettings]);

  const setReminder = useCallback((medicationId: string, reminder: Partial<MedicationReminder>) => {
    setSettings(prev => {
      const existing = prev.reminders.find(r => r.medicationId === medicationId);
      if (existing) {
        return {
          ...prev,
          reminders: prev.reminders.map(r =>
            r.medicationId === medicationId ? { ...r, ...reminder } : r
          ),
        };
      }
      return {
        ...prev,
        reminders: [...prev.reminders, {
          medicationId,
          enabled: true,
          times: ['09:00'],
          followUpMinutes: 120,
          ...reminder,
        }],
      };
    });
  }, [setSettings]);

  const removeReminder = useCallback((medicationId: string) => {
    setSettings(prev => ({
      ...prev,
      reminders: prev.reminders.filter(r => r.medicationId !== medicationId),
    }));
  }, [setSettings]);

  const getReminder = useCallback((medicationId: string) => {
    return settings.reminders.find(r => r.medicationId === medicationId);
  }, [settings.reminders]);

  // Check for due reminders every minute
  useEffect(() => {
    if (!settings.notificationsEnabled) return;

    const check = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const today = now.toISOString().split('T')[0];

      settings.reminders.forEach(reminder => {
        if (!reminder.enabled) return;
        const med = medications.find(m => m.id === reminder.medicationId);
        if (!med || !med.active) return;

        reminder.times.forEach(time => {
          const key = `${today}-${reminder.medicationId}-${time}`;
          if (currentTime === time && !lastNotified.current.has(key)) {
            lastNotified.current.add(key);

            // Send browser notification
            if (Notification.permission === 'granted') {
              new Notification('Medication Reminder', {
                body: `Time to take ${med.name}${med.dosage ? ` (${med.dosage})` : ''}`,
                icon: '/placeholder.svg',
                tag: key,
              });
            }

            // In-app toast
            toast.info(`Time to take ${med.name}`, {
              description: med.dosage || undefined,
              duration: 10000,
            });

            // Schedule follow-up
            if (reminder.followUpMinutes > 0) {
              setTimeout(() => {
                toast('Side effect check', {
                  description: `How are you feeling after taking ${med.name}? Log any side effects in the Track page.`,
                  duration: 15000,
                  action: {
                    label: 'Log now',
                    onClick: () => {
                      window.location.href = '/track';
                    },
                  },
                });
              }, reminder.followUpMinutes * 60 * 1000);
            }
          }
        });
      });
    };

    check();
    intervalRef.current = setInterval(check, 60000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [settings, medications]);

  // Clean up old notification keys daily
  useEffect(() => {
    const cleanup = setInterval(() => {
      lastNotified.current.clear();
    }, 24 * 60 * 60 * 1000);
    return () => clearInterval(cleanup);
  }, []);

  return {
    settings,
    toggleNotifications,
    setReminder,
    removeReminder,
    getReminder,
  };
}
