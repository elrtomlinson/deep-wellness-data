import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Pill, Heart } from 'lucide-react';
import { useHealthData } from '@/hooks/useHealthData';
import { AppLayout } from '@/components/AppLayout';
import { ConditionPicker } from '@/components/ConditionPicker';
import { SearchablePicker } from '@/components/SearchablePicker';
import {
  getAllPredefinedSymptoms,
  getAllPredefinedMedications,
  getAllPredefinedTreatments,
  PREDEFINED_CONDITIONS,
  type PredefinedCondition,
} from '@/data/predefinedConditions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const allSymptoms = getAllPredefinedSymptoms();
const allMedications = getAllPredefinedMedications();
const allTreatments = getAllPredefinedTreatments();

export default function ConditionsPage() {
  const {
    conditions, addCondition, removeCondition,
    symptoms, addSymptom, removeSymptom,
    medications, addMedication, removeMedication,
    treatments, addTreatment, removeTreatment,
  } = useHealthData();

  const [showAddCondition, setShowAddCondition] = useState(false);
  const [showAddSymptom, setShowAddSymptom] = useState(false);
  const [showAddMed, setShowAddMed] = useState(false);
  const [showAddTreatment, setShowAddTreatment] = useState(false);
  const [condName, setCondName] = useState('');
  const [condNotes, setCondNotes] = useState('');
  const [symName, setSymName] = useState('');
  const [symConditions, setSymConditions] = useState<string[]>([]);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medConditions, setMedConditions] = useState<string[]>([]);
  const [treatName, setTreatName] = useState('');
  const [treatDosage, setTreatDosage] = useState('');
  const [treatConditions, setTreatConditions] = useState<string[]>([]);

  // Auto-populate dialog state
  const [pendingCondition, setPendingCondition] = useState<PredefinedCondition | null>(null);
  const [autoAddSymptoms, setAutoAddSymptoms] = useState(true);
  const [autoAddMeds, setAutoAddMeds] = useState(true);
  const [autoAddTreats, setAutoAddTreats] = useState(true);

  const handleAddCondition = () => {
    if (!condName.trim()) return;
    addCondition({ name: condName.trim(), notes: condNotes.trim() });
    setCondName('');
    setCondNotes('');
    setShowAddCondition(false);
  };

  const handleSelectPredefinedCondition = (cond: PredefinedCondition) => {
    setCondName(cond.name);
    // If the condition has associated data, offer to auto-populate
    if (cond.symptoms.length > 0 || cond.medications.length > 0 || cond.treatments.length > 0) {
      setPendingCondition(cond);
      setAutoAddSymptoms(true);
      setAutoAddMeds(true);
      setAutoAddTreats(true);
    }
  };

  const handleConfirmAutoPopulate = () => {
    if (!pendingCondition) return;
    // Add the condition first
    const newCond = addCondition({ name: pendingCondition.name, notes: condNotes.trim() });

    if (autoAddSymptoms) {
      const existingNames = symptoms.map(s => s.name);
      pendingCondition.symptoms.forEach(symName => {
        if (!existingNames.includes(symName)) {
          addSymptom({ name: symName, conditionIds: [newCond.id] });
          existingNames.push(symName);
        }
      });
    }

    if (autoAddMeds) {
      const existingNames = medications.map(m => m.name);
      pendingCondition.medications.forEach(medName => {
        if (!existingNames.includes(medName)) {
          addMedication({ name: medName, dosage: '', conditionIds: [newCond.id], active: true });
          existingNames.push(medName);
        }
      });
    }

    if (autoAddTreats) {
      const existingNames = treatments.map(t => t.name);
      pendingCondition.treatments.forEach(treatName => {
        if (!existingNames.includes(treatName)) {
          addTreatment({ name: treatName, dosage: '', conditionIds: [newCond.id], active: true });
          existingNames.push(treatName);
        }
      });
    }

    setPendingCondition(null);
    setCondName('');
    setCondNotes('');
    setShowAddCondition(false);
  };

  const handleAddSymptom = () => {
    if (!symName.trim()) return;
    addSymptom({ name: symName.trim(), conditionIds: symConditions });
    setSymName('');
    setSymConditions([]);
    setShowAddSymptom(false);
  };

  const handleAddMed = () => {
    if (!medName.trim()) return;
    addMedication({ name: medName.trim(), dosage: medDosage.trim(), conditionIds: medConditions, active: true });
    setMedName('');
    setMedDosage('');
    setMedConditions([]);
    setShowAddMed(false);
  };

  const handleAddTreatment = () => {
    if (!treatName.trim()) return;
    addTreatment({ name: treatName.trim(), dosage: treatDosage.trim(), conditionIds: treatConditions, active: true });
    setTreatName('');
    setTreatDosage('');
    setTreatConditions([]);
    setShowAddTreatment(false);
  };

  const toggleConditionSelection = (id: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(id) ? list.filter(c => c !== id) : [...list, id]);
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-2xl mx-auto">
        {/* Conditions */}
        <section aria-labelledby="conditions-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="conditions-heading" className="text-xl font-semibold">Conditions</h2>
            <Button size="sm" onClick={() => setShowAddCondition(!showAddCondition)} aria-expanded={showAddCondition}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </Button>
          </div>

          {showAddCondition && (
            <Card className="p-4 mb-4 space-y-3 animate-fade-in">
              <div>
                <Label htmlFor="cond-name">Condition name</Label>
                <ConditionPicker
                  inputValue={condName}
                  onInputChange={setCondName}
                  onSelect={handleSelectPredefinedCondition}
                  existingNames={conditions.map(c => c.name)}
                />
              </div>
              <div>
                <Label htmlFor="cond-notes">Notes (optional)</Label>
                <Textarea id="cond-notes" value={condNotes} onChange={e => setCondNotes(e.target.value)} placeholder="Diagnosis date, doctor, etc." rows={2} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddCondition} disabled={!condName.trim()}>Save</Button>
                <Button variant="ghost" onClick={() => setShowAddCondition(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {conditions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No conditions added yet. Add your first condition to get started.</p>
          ) : (
            <div className="space-y-2">
              {conditions.map(c => (
                <Card key={c.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    {c.notes && <p className="text-sm text-muted-foreground">{c.notes}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeCondition(c.id)} aria-label={`Remove ${c.name}`}>
                    <X className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Symptoms */}
        <section aria-labelledby="symptoms-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="symptoms-heading" className="text-xl font-semibold">Symptoms</h2>
            <Button size="sm" onClick={() => setShowAddSymptom(!showAddSymptom)} aria-expanded={showAddSymptom}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </Button>
          </div>

          {showAddSymptom && (
            <Card className="p-4 mb-4 space-y-3 animate-fade-in">
              <div>
                <Label htmlFor="sym-name">Symptom name</Label>
                <SearchablePicker
                  items={allSymptoms}
                  inputValue={symName}
                  onInputChange={setSymName}
                  onSelect={(item) => setSymName(item)}
                  existingItems={symptoms.map(s => s.name)}
                  placeholder="Search symptoms or type custom..."
                />
              </div>
              {conditions.length > 0 && (
                <fieldset>
                  <legend className="text-sm font-medium mb-2">Link to conditions (optional)</legend>
                  <div className="flex flex-wrap gap-2">
                    {conditions.map(c => (
                      <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={symConditions.includes(c.id)}
                          onCheckedChange={() => toggleConditionSelection(c.id, symConditions, setSymConditions)}
                        />
                        <span className="text-sm">{c.name}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
              <div className="flex gap-2">
                <Button onClick={handleAddSymptom} disabled={!symName.trim()}>Save</Button>
                <Button variant="ghost" onClick={() => setShowAddSymptom(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {symptoms.length === 0 ? (
            <p className="text-muted-foreground text-sm">No symptoms added yet.</p>
          ) : (
            <div className="space-y-2">
              {symptoms.map(s => (
                <Card key={s.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {s.conditionIds.length === 0 && <Badge variant="outline">Standalone</Badge>}
                      {s.conditionIds.map(cId => {
                        const cond = conditions.find(c => c.id === cId);
                        return cond ? <Badge key={cId} variant="secondary">{cond.name}</Badge> : null;
                      })}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeSymptom(s.id)} aria-label={`Remove ${s.name}`}>
                    <X className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Medications */}
        <section aria-labelledby="meds-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="meds-heading" className="text-xl font-semibold">Medications</h2>
            <Button size="sm" onClick={() => setShowAddMed(!showAddMed)} aria-expanded={showAddMed}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </Button>
          </div>

          {showAddMed && (
            <Card className="p-4 mb-4 space-y-3 animate-fade-in">
              <div>
                <Label htmlFor="med-name">Medication name</Label>
                <SearchablePicker
                  items={allMedications}
                  inputValue={medName}
                  onInputChange={setMedName}
                  onSelect={(item) => setMedName(item)}
                  existingItems={medications.map(m => m.name)}
                  placeholder="Search medications or type custom..."
                />
              </div>
              <div>
                <Label htmlFor="med-dosage">Dosage</Label>
                <Input id="med-dosage" value={medDosage} onChange={e => setMedDosage(e.target.value)} placeholder="e.g. 25mg daily" />
              </div>
              {conditions.length > 0 && (
                <fieldset>
                  <legend className="text-sm font-medium mb-2">For conditions (optional)</legend>
                  <div className="flex flex-wrap gap-2">
                    {conditions.map(c => (
                      <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={medConditions.includes(c.id)}
                          onCheckedChange={() => toggleConditionSelection(c.id, medConditions, setMedConditions)}
                        />
                        <span className="text-sm">{c.name}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
              <div className="flex gap-2">
                <Button onClick={handleAddMed} disabled={!medName.trim()}>Save</Button>
                <Button variant="ghost" onClick={() => setShowAddMed(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {medications.length === 0 ? (
            <p className="text-muted-foreground text-sm">No medications added yet.</p>
          ) : (
            <div className="space-y-2">
              {medications.map(m => (
                <Card key={m.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-primary" aria-hidden="true" />
                    <div>
                      <p className="font-medium">{m.name}</p>
                      {m.dosage && <p className="text-sm text-muted-foreground">{m.dosage}</p>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeMedication(m.id)} aria-label={`Remove ${m.name}`}>
                    <X className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Treatments */}
        <section aria-labelledby="treatments-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="treatments-heading" className="text-xl font-semibold">Treatments</h2>
            <Button size="sm" onClick={() => setShowAddTreatment(!showAddTreatment)} aria-expanded={showAddTreatment}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </Button>
          </div>

          {showAddTreatment && (
            <Card className="p-4 mb-4 space-y-3 animate-fade-in">
              <div>
                <Label htmlFor="treat-name">Treatment name</Label>
                <SearchablePicker
                  items={allTreatments}
                  inputValue={treatName}
                  onInputChange={setTreatName}
                  onSelect={(item) => setTreatName(item)}
                  existingItems={treatments.map(t => t.name)}
                  placeholder="Search treatments or type custom..."
                />
              </div>
              <div>
                <Label htmlFor="treat-dosage">Details</Label>
                <Input id="treat-dosage" value={treatDosage} onChange={e => setTreatDosage(e.target.value)} placeholder="e.g. 2x weekly, 30 min sessions" />
              </div>
              {conditions.length > 0 && (
                <fieldset>
                  <legend className="text-sm font-medium mb-2">For conditions (optional)</legend>
                  <div className="flex flex-wrap gap-2">
                    {conditions.map(c => (
                      <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={treatConditions.includes(c.id)}
                          onCheckedChange={() => toggleConditionSelection(c.id, treatConditions, setTreatConditions)}
                        />
                        <span className="text-sm">{c.name}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
              <div className="flex gap-2">
                <Button onClick={handleAddTreatment} disabled={!treatName.trim()}>Save</Button>
                <Button variant="ghost" onClick={() => setShowAddTreatment(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {treatments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No treatments added yet.</p>
          ) : (
            <div className="space-y-2">
              {treatments.map(t => (
                <Card key={t.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" aria-hidden="true" />
                    <div>
                      <p className="font-medium">{t.name}</p>
                      {t.dosage && <p className="text-sm text-muted-foreground">{t.dosage}</p>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeTreatment(t.id)} aria-label={`Remove ${t.name}`}>
                    <X className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Auto-populate dialog */}
      <Dialog open={!!pendingCondition} onOpenChange={(open) => !open && setPendingCondition(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add related data for {pendingCondition?.name}?</DialogTitle>
            <DialogDescription>
              This condition has predefined symptoms, medications, and treatments. Select what you'd like to add automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {pendingCondition && pendingCondition.symptoms.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={autoAddSymptoms} onCheckedChange={(v) => setAutoAddSymptoms(!!v)} />
                <span className="text-sm">Add {pendingCondition.symptoms.length} symptoms</span>
              </label>
            )}
            {pendingCondition && pendingCondition.medications.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={autoAddMeds} onCheckedChange={(v) => setAutoAddMeds(!!v)} />
                <span className="text-sm">Add {pendingCondition.medications.length} medications</span>
              </label>
            )}
            {pendingCondition && pendingCondition.treatments.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={autoAddTreats} onCheckedChange={(v) => setAutoAddTreats(!!v)} />
                <span className="text-sm">Add {pendingCondition.treatments.length} treatments</span>
              </label>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setPendingCondition(null); handleAddCondition(); }}>
              Just add condition
            </Button>
            <Button onClick={handleConfirmAutoPopulate}>Add all selected</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
