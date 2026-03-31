import { useMemo } from 'react';
import { DailyLog, Medication, Symptom } from '@/types/health';

export interface MedEffectivenessResult {
  medicationId: string;
  medicationName: string;
  /** Average symptom severity on days the med was taken */
  avgSeverityOn: number;
  /** Average symptom severity on days the med was NOT taken */
  avgSeverityOff: number;
  /** Percentage improvement when taken (positive = better) */
  improvementPercent: number;
  /** Number of days with the med taken */
  daysTaken: number;
  /** Number of days without the med */
  daysMissed: number;
  /** Per-symptom breakdown */
  symptomBreakdown: SymptomImpact[];
  /** Overall effectiveness rating */
  rating: 'effective' | 'neutral' | 'unclear' | 'insufficient';
  /** Timeline of adherence + severity for charting */
  timeline: TimelinePoint[];
}

export interface SymptomImpact {
  symptomId: string;
  symptomName: string;
  avgOn: number;
  avgOff: number;
  improvementPercent: number;
}

export interface TimelinePoint {
  date: string;
  taken: boolean;
  avgSeverity: number;
  pain: number;
}

/**
 * Analyses medication adherence vs symptom severity from local logs.
 * Compares "taken" days vs "not taken" days for each medication.
 */
export function useMedicationEffectiveness(
  logs: DailyLog[],
  medications: Medication[],
  symptoms: Symptom[],
): MedEffectivenessResult[] {
  return useMemo(() => {
    if (logs.length < 5 || medications.length === 0) return [];

    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));

    return medications
      .filter(med => med.active)
      .map(med => {
        const takenDays: DailyLog[] = [];
        const missedDays: DailyLog[] = [];

        sorted.forEach(log => {
          const entry = log.medications.find(m => m.medicationId === med.id);
          if (!entry) return; // medication wasn't tracked this day
          if (entry.taken) {
            takenDays.push(log);
          } else {
            missedDays.push(log);
          }
        });

        const daysTaken = takenDays.length;
        const daysMissed = missedDays.length;

        if (daysTaken < 2) {
          return {
            medicationId: med.id,
            medicationName: med.name,
            avgSeverityOn: 0,
            avgSeverityOff: 0,
            improvementPercent: 0,
            daysTaken,
            daysMissed,
            symptomBreakdown: [],
            rating: 'insufficient' as const,
            timeline: buildTimeline(sorted, med.id),
          };
        }

        const avgSev = (days: DailyLog[]) => {
          if (days.length === 0) return 0;
          return days.reduce((sum, l) => {
            const total = l.symptoms.reduce((s, sy) => s + sy.severity, 0);
            return sum + (l.symptoms.length > 0 ? total / l.symptoms.length : l.overallPain);
          }, 0) / days.length;
        };

        const avgSeverityOn = +avgSev(takenDays).toFixed(2);
        const avgSeverityOff = daysMissed >= 2 ? +avgSev(missedDays).toFixed(2) : 0;

        const improvementPercent = avgSeverityOff > 0
          ? +((1 - avgSeverityOn / avgSeverityOff) * 100).toFixed(1)
          : 0;

        // Per-symptom breakdown
        const symptomBreakdown: SymptomImpact[] = symptoms.map(sym => {
          const onSevs = takenDays
            .map(l => l.symptoms.find(s => s.symptomId === sym.id)?.severity)
            .filter((v): v is number => v !== undefined);
          const offSevs = missedDays
            .map(l => l.symptoms.find(s => s.symptomId === sym.id)?.severity)
            .filter((v): v is number => v !== undefined);

          const avgOn = onSevs.length ? +(onSevs.reduce((a, b) => a + b, 0) / onSevs.length).toFixed(2) : 0;
          const avgOff = offSevs.length ? +(offSevs.reduce((a, b) => a + b, 0) / offSevs.length).toFixed(2) : 0;

          return {
            symptomId: sym.id,
            symptomName: sym.name,
            avgOn,
            avgOff,
            improvementPercent: avgOff > 0 ? +((1 - avgOn / avgOff) * 100).toFixed(1) : 0,
          };
        }).filter(s => s.avgOn > 0 || s.avgOff > 0);

        const rating: MedEffectivenessResult['rating'] =
          daysMissed < 2 ? 'unclear' :
          improvementPercent >= 15 ? 'effective' :
          improvementPercent <= -15 ? 'neutral' : 'neutral';

        return {
          medicationId: med.id,
          medicationName: med.name,
          avgSeverityOn,
          avgSeverityOff,
          improvementPercent,
          daysTaken,
          daysMissed,
          symptomBreakdown,
          rating,
          timeline: buildTimeline(sorted, med.id),
        };
      })
      .filter(r => r.daysTaken + r.daysMissed >= 3);
  }, [logs, medications, symptoms]);
}

function buildTimeline(logs: DailyLog[], medId: string): TimelinePoint[] {
  return logs.map(log => {
    const entry = log.medications.find(m => m.medicationId === medId);
    const avgSev = log.symptoms.length > 0
      ? log.symptoms.reduce((s, sy) => s + sy.severity, 0) / log.symptoms.length
      : 0;
    return {
      date: log.date,
      taken: entry?.taken ?? false,
      avgSeverity: +avgSev.toFixed(1),
      pain: log.overallPain,
    };
  });
}
