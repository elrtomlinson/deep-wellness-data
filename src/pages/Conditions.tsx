import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Pill } from 'lucide-react';
import { useHealthData } from '@/hooks/useHealthData';
import { AppLayout } from '@/components/AppLayout';

export default function ConditionsPage() {
  const { conditions, addCondition, removeCondition, symptoms, addSymptom, removeSymptom, medications, addMedication, removeMedication } = useHealthData();

  const [showAddCondition, setShowAddCondition] = useState(false);
  const [showAddSymptom, setShowAddSymptom] = useState(false);
  const [showAddMed, setShowAddMed] = useState(false);
  const [condName, setCondName] = useState('');
  const [condNotes, setCondNotes] = useState('');
  const [symName, setSymName] = useState('');
  const [symConditions, setSymConditions] = useState<string[]>([]);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medConditions, setMedConditions] = useState<string[]>([]);

  const handleAddCondition = () => {
    if (!condName.trim()) return;
    addCondition({ name: condName.trim(), notes: condNotes.trim() });
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
                <Input id="cond-name" value={condName} onChange={e => setCondName(e.target.value)} placeholder="e.g. Fibromyalgia" autoFocus />
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
                <Input id="sym-name" value={symName} onChange={e => setSymName(e.target.value)} placeholder="e.g. Fatigue" autoFocus />
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
                <Input id="med-name" value={medName} onChange={e => setMedName(e.target.value)} placeholder="e.g. Amitriptyline" autoFocus />
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
      </div>
    </AppLayout>
  );
}
