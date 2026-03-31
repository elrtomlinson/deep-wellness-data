import { useMemo } from 'react';
import { DailyLog, Treatment, Symptom } from '@/types/health';

export interface TreatmentEffectivenessResult {
  treatmentId: string;
  treatmentName: string;
  avgSeverityOn: number;
  avgSeverityOff: number;
  improvementPercent: number;
  daysDone: number;
  daysMissed: number;
  symptomBreakdown: TreatmentSymptomImpact[];
  rating: 'effective' | 'neutral' | 'unclear' | 'insufficient';
  timeline: TreatmentTimelinePoint[];
}

export interface TreatmentSymptomImpact {
  symptomId: string;
  symptomName: string;
  avgOn: number;
  avgOff: number;
  improvementPercent: number;
}

export interface TreatmentTimelinePoint {
  date: string;
  done: boolean;
  avgSeverity: number;
  pain: number;
}

export function useTreatmentEffectiveness(
  logs: DailyLog[],
  treatments: Treatment[],
  symptoms: Symptom[],
): TreatmentEffectivenessResult[] {
  return useMemo(() => {
    if (logs.length < 5 || treatments.length === 0) return [];

    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));

    return treatments
      .filter(t => t.active)
      .map(treatment => {
        const doneDays: DailyLog[] = [];
        const missedDays: DailyLog[] = [];

        sorted.forEach(log => {
          const entry = log.treatments.find(t => t.treatmentId === treatment.id);
          if (!entry) return;
          if (entry.done) {
            doneDays.push(log);
          } else {
            missedDays.push(log);
          }
        });

        const daysDone = doneDays.length;
        const daysMissed = missedDays.length;

        if (daysDone < 2) {
          return {
            treatmentId: treatment.id,
            treatmentName: treatment.name,
            avgSeverityOn: 0,
            avgSeverityOff: 0,
            improvementPercent: 0,
            daysDone,
            daysMissed,
            symptomBreakdown: [],
            rating: 'insufficient' as const,
            timeline: buildTimeline(sorted, treatment.id),
          };
        }

        const avgSev = (days: DailyLog[]) => {
          if (days.length === 0) return 0;
          return days.reduce((sum, l) => {
            const total = l.symptoms.reduce((s, sy) => s + sy.severity, 0);
            return sum + (l.symptoms.length > 0 ? total / l.symptoms.length : l.overallPain);
          }, 0) / days.length;
        };

        const avgSeverityOn = +avgSev(doneDays).toFixed(2);
        const avgSeverityOff = daysMissed >= 2 ? +avgSev(missedDays).toFixed(2) : 0;

        const improvementPercent = avgSeverityOff > 0
          ? +((1 - avgSeverityOn / avgSeverityOff) * 100).toFixed(1)
          : 0;

        const symptomBreakdown: TreatmentSymptomImpact[] = symptoms.map(sym => {
          const onSevs = doneDays
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

        const rating: TreatmentEffectivenessResult['rating'] =
          daysMissed < 2 ? 'unclear' :
          improvementPercent >= 15 ? 'effective' :
          'neutral';

        return {
          treatmentId: treatment.id,
          treatmentName: treatment.name,
          avgSeverityOn,
          avgSeverityOff,
          improvementPercent,
          daysDone,
          daysMissed,
          symptomBreakdown,
          rating,
          timeline: buildTimeline(sorted, treatment.id),
        };
      })
      .filter(r => r.daysDone + r.daysMissed >= 3);
  }, [logs, treatments, symptoms]);
}

function buildTimeline(logs: DailyLog[], treatmentId: string): TreatmentTimelinePoint[] {
  return logs.map(log => {
    const entry = log.treatments.find(t => t.treatmentId === treatmentId);
    const avgSev = log.symptoms.length > 0
      ? log.symptoms.reduce((s, sy) => s + sy.severity, 0) / log.symptoms.length
      : 0;
    return {
      date: log.date,
      done: entry?.done ?? false,
      avgSeverity: +avgSev.toFixed(1),
      pain: log.overallPain,
    };
  });
}
