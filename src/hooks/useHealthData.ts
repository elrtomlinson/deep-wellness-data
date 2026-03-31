import { useLocalStorage } from './useLocalStorage';
import { Condition, Symptom, Medication, Treatment, DailyLog } from '@/types/health';

export function useHealthData() {
  const [conditions, setConditions] = useLocalStorage<Condition[]>('health-conditions', []);
  const [symptoms, setSymptoms] = useLocalStorage<Symptom[]>('health-symptoms', []);
  const [medications, setMedications] = useLocalStorage<Medication[]>('health-medications', []);
  const [treatments, setTreatments] = useLocalStorage<Treatment[]>('health-treatments', []);
  const [logs, setLogs] = useLocalStorage<DailyLog[]>('health-logs', []);

  const addCondition = (condition: Omit<Condition, 'id' | 'createdAt'>) => {
    const newCondition: Condition = {
      ...condition,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setConditions(prev => [...prev, newCondition]);
    return newCondition;
  };

  const removeCondition = (id: string) => {
    setConditions(prev => prev.filter(c => c.id !== id));
    setSymptoms(prev => prev.map(s => ({
      ...s,
      conditionIds: s.conditionIds.filter(cId => cId !== id),
    })));
  };

  const addSymptom = (symptom: Omit<Symptom, 'id' | 'createdAt'>) => {
    const newSymptom: Symptom = {
      ...symptom,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setSymptoms(prev => [...prev, newSymptom]);
    return newSymptom;
  };

  const removeSymptom = (id: string) => {
    setSymptoms(prev => prev.filter(s => s.id !== id));
  };

  const addMedication = (medication: Omit<Medication, 'id'>) => {
    const newMed: Medication = {
      ...medication,
      id: crypto.randomUUID(),
    };
    setMedications(prev => [...prev, newMed]);
    return newMed;
  };

  const removeMedication = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  };

  const addLog = (log: Omit<DailyLog, 'id' | 'createdAt'>) => {
    const newLog: DailyLog = {
      ...log,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setLogs(prev => {
      const filtered = prev.filter(l => l.date !== log.date);
      return [...filtered, newLog];
    });
    return newLog;
  };

  const getLogByDate = (date: string) => logs.find(l => l.date === date);

  const getRecentLogs = (days: number = 7) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return logs
      .filter(l => new Date(l.date) >= cutoff)
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  return {
    conditions, setConditions, addCondition, removeCondition,
    symptoms, setSymptoms, addSymptom, removeSymptom,
    medications, setMedications, addMedication, removeMedication,
    treatments, setTreatments, addTreatment, removeTreatment,
    logs, addLog, getLogByDate, getRecentLogs,
  };
}
