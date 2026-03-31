import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHealthData } from '@/hooks/useHealthData';
import { AppLayout } from '@/components/AppLayout';
import { getSeverityLevel } from '@/types/health';
import { cn } from '@/lib/utils';
import {
  Stethoscope, Pill, Heart, Activity, AlertTriangle,
  Plus, Minus, TrendingUp, TrendingDown, Calendar,
} from 'lucide-react';

interface TimelineEvent {
  date: string;
  type: 'condition_added' | 'medication_started' | 'medication_stopped' | 'treatment_started' | 'treatment_stopped' | 'flare' | 'improvement' | 'log';
  title: string;
  subtitle?: string;
  severity?: number;
  icon: React.ReactNode;
  color: string;
}

export default function TimelinePage() {
  const { conditions, medications, treatments, logs, symptoms } = useHealthData();

  const events = useMemo(() => {
    const all: TimelineEvent[] = [];

    // Condition additions
    conditions.forEach(c => {
      all.push({
        date: c.createdAt,
        type: 'condition_added',
        title: c.name,
        subtitle: 'Condition added',
        icon: <Stethoscope className="h-4 w-4" />,
        color: 'text-primary',
      });
    });

    // Medication starts
    medications.forEach(m => {
      all.push({
        date: m.id, // no createdAt on meds, use ID order
        type: 'medication_started',
        title: m.name,
        subtitle: `Started${m.dosage ? ` · ${m.dosage}` : ''}`,
        icon: <Pill className="h-4 w-4" />,
        color: 'text-chart-2',
      });
    });

    // Treatment starts  
    treatments.forEach(t => {
      all.push({
        date: t.id,
        type: 'treatment_started',
        title: t.name,
        subtitle: 'Treatment started',
        icon: <Heart className="h-4 w-4" />,
        color: 'text-chart-4',
      });
    });

    // Detect flares and improvements from logs
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    sorted.forEach((log, i) => {
      if (i === 0) return;
      const prev = sorted[i - 1];
      const painDelta = log.overallPain - prev.overallPain;

      if (painDelta >= 3) {
        const topSymptoms = log.symptoms
          .filter(s => s.severity >= 5)
          .map(s => symptoms.find(sy => sy.id === s.symptomId)?.name)
          .filter(Boolean)
          .slice(0, 3);
        all.push({
          date: log.date,
          type: 'flare',
          title: 'Symptom flare detected',
          subtitle: topSymptoms.length > 0
            ? `High: ${topSymptoms.join(', ')}`
            : `Pain jumped from ${prev.overallPain} to ${log.overallPain}`,
          severity: log.overallPain,
          icon: <AlertTriangle className="h-4 w-4" />,
          color: 'text-severity-severe',
        });
      } else if (painDelta <= -3) {
        all.push({
          date: log.date,
          type: 'improvement',
          title: 'Notable improvement',
          subtitle: `Pain dropped from ${prev.overallPain} to ${log.overallPain}`,
          severity: log.overallPain,
          icon: <TrendingDown className="h-4 w-4" />,
          color: 'text-severity-low',
        });
      }

      // High pain days
      if (log.overallPain >= 7 && painDelta < 3) {
        all.push({
          date: log.date,
          type: 'log',
          title: `High pain day (${log.overallPain}/10)`,
          subtitle: log.notes || undefined,
          severity: log.overallPain,
          icon: <Activity className="h-4 w-4" />,
          color: 'text-severity-high',
        });
      }
    });

    // Sort newest first
    return all.sort((a, b) => b.date.localeCompare(a.date));
  }, [conditions, medications, treatments, logs, symptoms]);

  // Group by month
  const grouped = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    events.forEach(e => {
      let monthKey: string;
      try {
        const d = parseISO(e.date);
        monthKey = isNaN(d.getTime()) ? 'Unknown' : format(d, 'MMMM yyyy');
      } catch {
        monthKey = 'Unknown';
      }
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(e);
    });
    return groups;
  }, [events]);

  const monthKeys = Object.keys(grouped);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Timeline</h2>
        </div>

        {events.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <Calendar className="h-10 w-10 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-medium">No events yet</h3>
            <p className="text-muted-foreground text-sm">
              Add conditions, log symptoms, and track medications to build your health timeline.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {monthKeys.map(month => (
              <div key={month}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 sticky top-0 bg-background py-1 z-10">
                  {month}
                </h3>
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

                  <div className="space-y-1">
                    {grouped[month].map((event, i) => {
                      let dateLabel: string;
                      try {
                        const d = parseISO(event.date);
                        dateLabel = isNaN(d.getTime()) ? '' : format(d, 'MMM d');
                      } catch {
                        dateLabel = '';
                      }
                      return (
                        <div key={`${event.date}-${event.type}-${i}`} className="flex gap-3 relative">
                          {/* Dot */}
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10',
                            'bg-card border border-border',
                            event.color,
                          )}>
                            {event.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 pb-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium">{event.title}</p>
                                {event.subtitle && (
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{event.subtitle}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {event.severity !== undefined && (
                                  <Badge variant="outline" className={cn('text-[10px]', {
                                    'text-severity-low border-severity-low': getSeverityLevel(event.severity) === 'low',
                                    'text-severity-moderate border-severity-moderate': getSeverityLevel(event.severity) === 'moderate',
                                    'text-severity-high border-severity-high': getSeverityLevel(event.severity) === 'high',
                                    'text-severity-severe border-severity-severe': getSeverityLevel(event.severity) === 'severe',
                                  })}>
                                    {event.severity}/10
                                  </Badge>
                                )}
                                {dateLabel && (
                                  <span className="text-[10px] text-muted-foreground">{dateLabel}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
