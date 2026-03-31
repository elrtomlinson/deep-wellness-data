export interface Condition {
  id: string;
  name: string;
  notes: string;
  createdAt: string;
}

export interface Symptom {
  id: string;
  name: string;
  conditionIds: string[]; // empty = standalone, multiple = overlapping
  createdAt: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  conditionIds: string[];
  active: boolean;
}

export interface Treatment {
  id: string;
  name: string;
  dosage: string;
  conditionIds: string[];
  active: boolean;
}

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  overallPain: number; // 0-10
  sleepHours: number;
  sleepQuality: number; // 0-10
  mood: number; // 0-10
  energyLevel: number; // 0-100 percent
  energySpent: number; // 0-100 percent used
  symptoms: SymptomLog[];
  medications: MedicationLog[];
  treatments: TreatmentLog[];
  sideEffects: SideEffectLog[];
  notes: string;
  createdAt: string;
}

export interface SymptomLog {
  symptomId: string;
  severity: number; // 0-10
}

export interface MedicationLog {
  medicationId: string;
  taken: boolean;
}

export interface TreatmentLog {
  treatmentId: string;
  done: boolean;
}

export interface SideEffectLog {
  medicationId: string;
  effect: string;
  severity: number; // 0-10
  hoursAfterDose: number;
}

export type SeverityLevel = 'none' | 'low' | 'moderate' | 'high' | 'severe';

export function getSeverityLevel(value: number): SeverityLevel {
  if (value === 0) return 'none';
  if (value <= 3) return 'low';
  if (value <= 5) return 'moderate';
  if (value <= 7) return 'high';
  return 'severe';
}

export function getSeverityColor(value: number): string {
  const level = getSeverityLevel(value);
  switch (level) {
    case 'none': return 'text-muted-foreground';
    case 'low': return 'text-severity-low';
    case 'moderate': return 'text-severity-moderate';
    case 'high': return 'text-severity-high';
    case 'severe': return 'text-severity-severe';
  }
}
