import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { SeveritySlider } from '@/components/SeveritySlider';
import { useHealthData } from '@/hooks/useHealthData';
import { AppLayout } from '@/components/AppLayout';
import { SymptomLog, MedicationLog, TreatmentLog } from '@/types/health';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function TrackPage() {
  const { symptoms, medications, treatments, addLog, getLogByDate } = useHealthData();

  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const existingLog = getLogByDate(currentDate);

  const [pain, setPain] = useState(existingLog?.overallPain ?? 0);
  const [sleepHours, setSleepHours] = useState(existingLog?.sleepHours ?? 7);
  const [sleepQuality, setSleepQuality] = useState(existingLog?.sleepQuality ?? 5);
  const [mood, setMood] = useState(existingLog?.mood ?? 5);
  const [notes, setNotes] = useState(existingLog?.notes ?? '');

  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>(
    existingLog?.symptoms ?? symptoms.map(s => ({ symptomId: s.id, severity: 0 }))
  );
  const [medLogs, setMedLogs] = useState<MedicationLog[]>(
    existingLog?.medications ?? medications.filter(m => m.active).map(m => ({ medicationId: m.id, taken: false }))
  );
  const [treatmentLogs, setTreatmentLogs] = useState<TreatmentLog[]>(
    existingLog?.treatments ?? treatments.filter(t => t.active).map(t => ({ treatmentId: t.id, done: false }))
  );

  const changeDate = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    const newDate = format(d, 'yyyy-MM-dd');
    setCurrentDate(newDate);
    const log = getLogByDate(newDate);
    if (log) {
      setPain(log.overallPain);
      setSleepHours(log.sleepHours);
      setSleepQuality(log.sleepQuality);
      setMood(log.mood);
      setNotes(log.notes);
      setSymptomLogs(log.symptoms);
      setMedLogs(log.medications);
      setTreatmentLogs(log.treatments ?? []);
    } else {
      setPain(0);
      setSleepHours(7);
      setSleepQuality(5);
      setMood(5);
      setNotes('');
      setSymptomLogs(symptoms.map(s => ({ symptomId: s.id, severity: 0 })));
      setMedLogs(medications.filter(m => m.active).map(m => ({ medicationId: m.id, taken: false })));
      setTreatmentLogs(treatments.filter(t => t.active).map(t => ({ treatmentId: t.id, done: false })));
    }
  };

  const handleSave = () => {
    addLog({
      date: currentDate,
      overallPain: pain,
      sleepHours,
      sleepQuality,
      mood,
      symptoms: symptomLogs,
      medications: medLogs,
      notes,
    });
    toast.success('Log saved!');
  };

  const updateSymptomSeverity = (symptomId: string, severity: number) => {
    setSymptomLogs(prev =>
      prev.map(s => s.symptomId === symptomId ? { ...s, severity } : s)
    );
  };

  const toggleMed = (medicationId: string) => {
    setMedLogs(prev =>
      prev.map(m => m.medicationId === medicationId ? { ...m, taken: !m.taken } : m)
    );
  };

  const isToday = currentDate === format(new Date(), 'yyyy-MM-dd');
  const displayDate = isToday ? 'Today' : format(new Date(currentDate), 'EEE, MMM d');

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Date selector */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => changeDate(-1)} aria-label="Previous day">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[140px] text-center">{displayDate}</h2>
          <Button variant="ghost" size="icon" onClick={() => changeDate(1)} disabled={isToday} aria-label="Next day">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {existingLog && (
          <p className="text-center text-sm text-muted-foreground" role="status">
            <Check className="h-4 w-4 inline mr-1" aria-hidden="true" />
            Already logged — editing will update
          </p>
        )}

        {/* Overall metrics */}
        <Card className="p-5 space-y-5">
          <h3 className="font-semibold">How are you feeling?</h3>
          <SeveritySlider id="pain" label="Overall pain" value={pain} onChange={setPain} />
          <SeveritySlider id="sleep-hours" label="Sleep" value={sleepHours} onChange={setSleepHours} max={16} unit="hrs" step={0.5} />
          <SeveritySlider id="sleep-quality" label="Sleep quality" value={sleepQuality} onChange={setSleepQuality} />
          <SeveritySlider id="mood" label="Mood" value={mood} onChange={setMood} />
        </Card>

        {/* Symptoms */}
        {symptoms.length > 0 && (
          <Card className="p-5 space-y-4">
            <h3 className="font-semibold">Symptoms</h3>
            {symptomLogs.map(sl => {
              const sym = symptoms.find(s => s.id === sl.symptomId);
              if (!sym) return null;
              return (
                <SeveritySlider
                  key={sl.symptomId}
                  id={`sym-${sl.symptomId}`}
                  label={sym.name}
                  value={sl.severity}
                  onChange={v => updateSymptomSeverity(sl.symptomId, v)}
                />
              );
            })}
          </Card>
        )}

        {/* Medications */}
        {medLogs.length > 0 && (
          <Card className="p-5 space-y-3">
            <h3 className="font-semibold">Medications</h3>
            {medLogs.map(ml => {
              const med = medications.find(m => m.id === ml.medicationId);
              if (!med) return null;
              return (
                <label key={ml.medicationId} className="flex items-center gap-3 cursor-pointer touch-target">
                  <Checkbox
                    checked={ml.taken}
                    onCheckedChange={() => toggleMed(ml.medicationId)}
                    aria-label={`Took ${med.name}`}
                  />
                  <div>
                    <span className="text-sm font-medium">{med.name}</span>
                    {med.dosage && <span className="text-xs text-muted-foreground ml-2">{med.dosage}</span>}
                  </div>
                </label>
              );
            })}
          </Card>
        )}

        {/* Notes */}
        <Card className="p-5 space-y-2">
          <label htmlFor="log-notes" className="font-semibold text-sm">Notes</label>
          <Textarea
            id="log-notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Anything notable today..."
            rows={3}
          />
        </Card>

        <Button onClick={handleSave} className="w-full touch-target" size="lg">
          Save log
        </Button>
      </div>
    </AppLayout>
  );
}
