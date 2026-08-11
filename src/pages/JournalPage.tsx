import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useHealthData } from '@/hooks/useHealthData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AppLayout } from '@/components/AppLayout';
import { getSeverityLevel } from '@/types/health';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  BookOpen, Plus, X, Tag, Search, ChevronDown, ChevronUp,
  Calendar, Activity, Moon, Brain,
} from 'lucide-react';

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
  mood?: number;
  createdAt: string;
}

export default function JournalPage() {
  const { logs, symptoms } = useHealthData();
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>('health-journal', []);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // New entry form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [entryMood, setEntryMood] = useState(5);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    entries.forEach(e => e.tags.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    let result = [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (tagFilter) {
      result = result.filter(e => e.tags.includes(tagFilter));
    }
    return result;
  }, [entries, search, tagFilter]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      toast.error('Please add a title or some content');
      return;
    }
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      date: format(new Date(), 'yyyy-MM-dd'),
      title: title.trim() || format(new Date(), 'EEEE, MMM d'),
      content: content.trim(),
      tags,
      mood: entryMood,
      createdAt: new Date().toISOString(),
    };
    setEntries(prev => [...prev, entry]);
    setTitle('');
    setContent('');
    setTags([]);
    setEntryMood(5);
    setShowForm(false);
    toast.success('Journal entry saved');
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    toast.success('Entry deleted');
  };

  // Find the log for a journal entry's date
  const getLogForDate = (date: string) => logs.find(l => l.date === date);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Journal</h2>
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            {showForm ? 'Cancel' : 'New Entry'}
          </Button>
        </div>

        {/* New entry form */}
        {showForm && (
          <Card className="p-5 space-y-4 animate-fade-in">
            <Input
              placeholder="Entry title (optional)"
              aria-label="Entry title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="How are you feeling? What happened today? Any observations about your symptoms..."
              aria-label="Journal entry content"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={5}
            />

            {/* Mood */}
            <div className="space-y-2">
              <label htmlFor="entry-mood" className="text-sm font-medium">Mood: {entryMood}/10</label>
              <input
                id="entry-mood"
                type="range"
                min={0}
                max={10}
                value={entryMood}
                onChange={e => setEntryMood(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Tag className="h-3 w-3" /> Tags
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  aria-label="Add a tag"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={addTag}>Add</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map(t => (
                    <Badge key={t} variant="secondary" className="text-xs cursor-pointer" onClick={() => removeTag(t)} role="button" tabIndex={0} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (() => removeTag(t))(); } }}
            >
                      {t} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={handleSave} className="w-full">Save Entry</Button>
          </Card>
        )}

        {/* Search & filter */}
        {entries.length > 0 && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                aria-label="Search journal entries"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <Badge
                  variant={tagFilter === null ? 'default' : 'outline'}
                  className="text-xs cursor-pointer"
                  onClick={() => setTagFilter(null)} role="button" tabIndex={0} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (() => setTagFilter(null))(); } }}
            >
                  All
                </Badge>
                {allTags.map(t => (
                  <Badge
                    key={t}
                    variant={tagFilter === t ? 'default' : 'outline'}
                    className="text-xs cursor-pointer"
                    onClick={() => setTagFilter(tagFilter === t ? null : t)} role="button" tabIndex={0} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (() => setTagFilter(tagFilter === t ? null : t))(); } }}
            >
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Entries */}
        {filtered.length === 0 ? (
          !showForm && (
            <Card className="p-8 text-center space-y-3">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">
                {entries.length === 0 ? 'Start your journal' : 'No matching entries'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {entries.length === 0
                  ? 'Record your thoughts, observations, and health experiences.'
                  : 'Try adjusting your search or tag filter.'}
              </p>
            </Card>
          )
        ) : (
          <div className="space-y-3">
            {filtered.map(entry => {
              const dayLog = getLogForDate(entry.date);
              return (
                <JournalCard
                  key={entry.id}
                  entry={entry}
                  dayLog={dayLog}
                  symptoms={symptoms}
                  onDelete={() => deleteEntry(entry.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function JournalCard({
  entry,
  dayLog,
  symptoms: symptomList,
  onDelete,
}: {
  entry: JournalEntry;
  dayLog?: ReturnType<ReturnType<typeof useHealthData>['getLogByDate']>;
  symptoms: ReturnType<typeof useHealthData>['symptoms'];
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  let dateLabel: string;
  try {
    dateLabel = format(parseISO(entry.createdAt), 'EEE, MMM d · h:mm a');
  } catch {
    dateLabel = entry.date;
  }

  return (
    <Card className="p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-medium text-sm">{entry.title}</h4>
          <p className="text-[10px] text-muted-foreground">{dateLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          {entry.mood !== undefined && (
            <Badge variant="outline" className="text-[10px]">
              Mood {entry.mood}/10
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground" onClick={onDelete}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {entry.content && (
        <p className={cn('text-sm text-muted-foreground whitespace-pre-wrap', !expanded && 'line-clamp-3')}>
          {entry.content}
        </p>
      )}

      {entry.content.length > 150 && (
        <Button variant="ghost" size="sm" className="text-xs p-0 h-auto" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
          {expanded ? 'Less' : 'More'}
        </Button>
      )}

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.tags.map(t => (
            <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
          ))}
        </div>
      )}

      {/* Day's health snapshot */}
      {dayLog && (
        <div className="flex gap-3 pt-1 border-t border-border text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> Pain {dayLog.overallPain}/10</span>
          <span className="flex items-center gap-1"><Moon className="h-3 w-3" /> Sleep {dayLog.sleepQuality}/10</span>
          <span className="flex items-center gap-1"><Brain className="h-3 w-3" /> Mood {dayLog.mood}/10</span>
        </div>
      )}
    </Card>
  );
}
