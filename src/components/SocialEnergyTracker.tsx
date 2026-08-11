import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  SocialEvent, SocialEventType, SocialLocation,
  SOCIAL_EVENT_TYPES, SOCIAL_LOCATIONS,
} from '@/types/health';
import { cn } from '@/lib/utils';
import {
  Users, Briefcase, Stethoscope, User,
  Home, MapPin, Monitor,
  Plus, Trash2, BatteryMedium, ChevronDown, ChevronUp,
} from 'lucide-react';

const TYPE_META: Record<SocialEventType, { icon: React.ReactNode; label: string; color: string }> = {
  social: { icon: <Users className="h-3.5 w-3.5" />, label: 'Social', color: 'bg-chart-1/15 text-chart-1 border-chart-1/30' },
  work: { icon: <Briefcase className="h-3.5 w-3.5" />, label: 'Work', color: 'bg-chart-2/15 text-chart-2 border-chart-2/30' },
  medical: { icon: <Stethoscope className="h-3.5 w-3.5" />, label: 'Medical', color: 'bg-chart-4/15 text-chart-4 border-chart-4/30' },
  alone: { icon: <User className="h-3.5 w-3.5" />, label: 'Alone time', color: 'bg-chart-3/15 text-chart-3 border-chart-3/30' },
};

const LOC_META: Record<SocialLocation, { icon: React.ReactNode; label: string }> = {
  home: { icon: <Home className="h-3.5 w-3.5" />, label: 'Home' },
  out: { icon: <MapPin className="h-3.5 w-3.5" />, label: 'Out' },
  online: { icon: <Monitor className="h-3.5 w-3.5" />, label: 'Online' },
};

function BatteryIndicator({ level }: { level: number }) {
  const color = level > 60 ? 'text-severity-low' : level > 30 ? 'text-severity-moderate' : 'text-severity-high';
  return (
    <div className="flex items-center gap-2">
      <BatteryMedium className={cn('h-5 w-5', color)} />
      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', {
            'bg-severity-low': level > 60,
            'bg-severity-moderate': level > 30 && level <= 60,
            'bg-severity-high': level <= 30,
          })}
          style={{ width: `${level}%` }}
        />
      </div>
      <span className={cn('text-sm font-semibold tabular-nums min-w-[3ch] text-right', color)}>
        {level}%
      </span>
    </div>
  );
}

interface Props {
  socialBattery: number;
  onSocialBatteryChange: (v: number) => void;
  events: SocialEvent[];
  onEventsChange: (events: SocialEvent[]) => void;
}

export function SocialEnergyTracker({ socialBattery, onSocialBatteryChange, events, onEventsChange }: Props) {
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // New event form state
  const [type, setType] = useState<SocialEventType>('social');
  const [label, setLabel] = useState('');
  const [groupSize, setGroupSize] = useState(2);
  const [duration, setDuration] = useState(60);
  const [location, setLocation] = useState<SocialLocation>('out');
  const [preEnergy, setPreEnergy] = useState(socialBattery);
  const [postEnergy, setPostEnergy] = useState(Math.max(0, socialBattery - 20));
  const [recovery, setRecovery] = useState(30);
  const [eventNotes, setEventNotes] = useState('');

  const resetForm = () => {
    setType('social');
    setLabel('');
    setGroupSize(2);
    setDuration(60);
    setLocation('out');
    setPreEnergy(socialBattery);
    setPostEnergy(Math.max(0, socialBattery - 20));
    setRecovery(30);
    setEventNotes('');
    setAdding(false);
  };

  const addEvent = () => {
    const newEvent: SocialEvent = {
      id: crypto.randomUUID(),
      type,
      label: label.trim() || TYPE_META[type].label,
      groupSize: type === 'alone' ? 0 : groupSize,
      durationMinutes: duration,
      location,
      preEnergy,
      postEnergy,
      recoveryMinutes: recovery,
      notes: eventNotes.trim(),
    };
    onEventsChange([...events, newEvent]);
    // Auto-update social battery to post-energy of latest event
    onSocialBatteryChange(postEnergy);
    resetForm();
  };

  const removeEvent = (id: string) => {
    onEventsChange(events.filter(e => e.id !== id));
  };

  const totalDrain = events.reduce((sum, e) => sum + (e.preEnergy - e.postEnergy), 0);
  const totalRecovery = events.reduce((sum, e) => sum + e.recoveryMinutes, 0);

  return (
    <Card className="p-4 sm:p-5 space-y-4">
      <button
        type="button"
        className="flex items-center justify-between w-full"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm sm:text-base">Social Energy</h3>
          {events.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {events.length} event{events.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <>
          {/* Social Battery */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Social Battery</label>
            <BatteryIndicator level={socialBattery} />
            <Slider
              value={[socialBattery]}
              onValueChange={([v]) => onSocialBatteryChange(v)}
              max={100}
              step={5}
              className="mt-1"
            />
          </div>

          {/* Summary */}
          {events.length > 0 && (
            <div className="flex gap-3 text-[11px] text-muted-foreground">
              <span>⚡ Drained: {totalDrain} pts</span>
              <span>🔄 Recovery: {totalRecovery} min</span>
            </div>
          )}

          {/* Event list */}
          {events.length > 0 && (
            <div className="space-y-2">
              {events.map(e => {
                const meta = TYPE_META[e.type];
                return (
                  <div key={e.id} className={cn('flex items-start gap-2 p-2.5 rounded-lg border', meta.color)}>
                    <div className="mt-0.5">{meta.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{e.label}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {e.durationMinutes}min · {LOC_META[e.location].label}
                        {e.groupSize > 0 && ` · ${e.groupSize} people`}
                        {' · '}{e.preEnergy}→{e.postEnergy}%
                        {e.recoveryMinutes > 0 && ` · ${e.recoveryMinutes}min recovery`}
                      </p>
                      {e.notes && <p className="text-[10px] text-muted-foreground mt-0.5">{e.notes}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => removeEvent(e.id)}
                      aria-label={`Remove event ${e.label}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add event form */}
          {adding ? (
            <div className="space-y-3 p-3 rounded-lg bg-muted/40 border border-border">
              {/* Event type */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {SOCIAL_EVENT_TYPES.map(t => {
                    const meta = TYPE_META[t];
                    return (
                      <Badge
                        key={t}
                        variant={type === t ? 'default' : 'outline'}
                        className={cn('cursor-pointer text-xs px-2 py-0.5', type === t && 'bg-primary')}
                        onClick={() => setType(t)} role="button" tabIndex={0} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (() => setType(t))(); } }}
            >
                        {meta.icon}
                        <span className="ml-1">{meta.label}</span>
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Label */}
              <div className="space-y-1">
                <label htmlFor="social-event-label" className="text-xs text-muted-foreground">What</label>
                <Input
                  id="social-event-label"
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder={`e.g. ${type === 'social' ? 'Coffee with friend' : type === 'work' ? 'Team meeting' : type === 'medical' ? 'Doctor visit' : 'Reading at home'}`}
                  className="h-8 text-sm"
                  maxLength={100}
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Location</label>
                <div className="flex gap-1.5">
                  {SOCIAL_LOCATIONS.map(loc => {
                    const meta = LOC_META[loc];
                    return (
                      <Badge
                        key={loc}
                        variant={location === loc ? 'default' : 'outline'}
                        className={cn('cursor-pointer text-xs px-2 py-0.5', location === loc && 'bg-primary')}
                        onClick={() => setLocation(loc)} role="button" tabIndex={0} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (() => setLocation(loc))(); } }}
            >
                        {meta.icon}
                        <span className="ml-1">{meta.label}</span>
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Group size (hidden for alone) */}
              {type !== 'alone' && (
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Group size: {groupSize}</label>
                  <Slider value={[groupSize]} onValueChange={([v]) => setGroupSize(v)} min={1} max={20} step={1} />
                </div>
              )}

              {/* Duration */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Duration: {duration} min</label>
                <Slider value={[duration]} onValueChange={([v]) => setDuration(v)} min={5} max={480} step={5} />
              </div>

              {/* Pre/Post energy */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Energy before: {preEnergy}%</label>
                  <Slider value={[preEnergy]} onValueChange={([v]) => setPreEnergy(v)} max={100} step={5} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Energy after: {postEnergy}%</label>
                  <Slider value={[postEnergy]} onValueChange={([v]) => setPostEnergy(v)} max={100} step={5} />
                </div>
              </div>

              {/* Recovery */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Recovery time: {recovery} min</label>
                <Slider value={[recovery]} onValueChange={([v]) => setRecovery(v)} min={0} max={480} step={5} />
              </div>

              {/* Notes */}
              <Textarea
                aria-label="Event notes"
                value={eventNotes}
                onChange={e => setEventNotes(e.target.value)}
                placeholder="How did this feel?"
                rows={2}
                className="text-sm"
                maxLength={500}
              />

              <div className="flex gap-2">
                <Button size="sm" onClick={addEvent} className="flex-1">Add event</Button>
                <Button size="sm" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="w-full" onClick={() => { setPreEnergy(socialBattery); setPostEnergy(Math.max(0, socialBattery - 20)); setAdding(true); }}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Log social event
            </Button>
          )}
        </>
      )}
    </Card>
  );
}
