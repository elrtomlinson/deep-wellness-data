import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useHealthData } from '@/hooks/useHealthData';
import { Brain, Play, RotateCcw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface CognitiveTestResult {
  date: string;
  reactionTimeMs: number; // average ms
  wordRecallScore: number; // 0-10
  compositeScore: number; // 0-100
}

type TestPhase = 'idle' | 'reaction-wait' | 'reaction-go' | 'reaction-done' | 'recall-memorise' | 'recall-input' | 'recall-done' | 'complete';

const WORD_POOLS = [
  ['mountain', 'river', 'candle', 'garden', 'silver', 'hammer', 'ocean', 'blanket', 'trumpet', 'crystal'],
  ['forest', 'bridge', 'mirror', 'sunset', 'copper', 'pillow', 'violin', 'marble', 'lantern', 'feather'],
  ['castle', 'meadow', 'anchor', 'ribbon', 'shadow', 'barrel', 'glacier', 'mosaic', 'whistle', 'velvet'],
  ['island', 'tower', 'basket', 'prism', 'shelter', 'kettle', 'canyon', 'pebble', 'temple', 'breeze'],
];

export function BrainFogIndex() {
  const { logs } = useHealthData();
  const [results, setResults] = useLocalStorage<CognitiveTestResult[]>('cognitive-test-results', []);
  const [phase, setPhase] = useState<TestPhase>('idle');

  // Reaction time state
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [reactionRound, setReactionRound] = useState(0);
  const reactionStartRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const REACTION_ROUNDS = 5;

  // Word recall state
  const [testWords, setTestWords] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');
  const [recallScore, setRecallScore] = useState(0);
  const WORDS_TO_SHOW = 6;
  const MEMORISE_SECONDS = 8;
  const [memoriseCountdown, setMemoriseCountdown] = useState(MEMORISE_SECONDS);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayResult = results.find(r => r.date === todayStr);

  // === Reaction Time Test ===
  const startReactionRound = useCallback(() => {
    setPhase('reaction-wait');
    const delay = 1500 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      reactionStartRef.current = performance.now();
      setPhase('reaction-go');
    }, delay);
  }, []);

  const handleReactionTap = useCallback(() => {
    if (phase === 'reaction-wait') {
      // Too early
      clearTimeout(timerRef.current);
      startReactionRound(); // restart this round
      return;
    }
    if (phase !== 'reaction-go') return;
    const elapsed = Math.round(performance.now() - reactionStartRef.current);
    const newTimes = [...reactionTimes, elapsed];
    setReactionTimes(newTimes);
    const nextRound = reactionRound + 1;
    setReactionRound(nextRound);
    if (nextRound >= REACTION_ROUNDS) {
      setPhase('reaction-done');
    } else {
      startReactionRound();
    }
  }, [phase, reactionTimes, reactionRound, startReactionRound]);

  const startTest = useCallback(() => {
    setReactionTimes([]);
    setReactionRound(0);
    setRecallScore(0);
    setUserInput('');
    startReactionRound();
  }, [startReactionRound]);

  // === Word Recall Test ===
  const startWordRecall = useCallback(() => {
    const pool = WORD_POOLS[Math.floor(Math.random() * WORD_POOLS.length)];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setTestWords(shuffled.slice(0, WORDS_TO_SHOW));
    setMemoriseCountdown(MEMORISE_SECONDS);
    setPhase('recall-memorise');
  }, []);

  useEffect(() => {
    if (phase !== 'recall-memorise') return;
    if (memoriseCountdown <= 0) {
      setPhase('recall-input');
      return;
    }
    const t = setTimeout(() => setMemoriseCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, memoriseCountdown]);

  const submitRecall = useCallback(() => {
    const entered = userInput.toLowerCase().split(/[,\s]+/).map(w => w.trim()).filter(Boolean);
    const correct = entered.filter(w => testWords.includes(w)).length;
    const score = Math.round((correct / WORDS_TO_SHOW) * 10);
    setRecallScore(score);
    setPhase('recall-done');
  }, [userInput, testWords]);

  const finishTest = useCallback(() => {
    const avgReaction = reactionTimes.reduce((s, v) => s + v, 0) / reactionTimes.length;
    // Composite: reaction component (0-50) + recall component (0-50)
    const reactionScore = Math.max(0, Math.min(50, 50 - (avgReaction - 200) / 10));
    const recallComponent = (recallScore / 10) * 50;
    const composite = Math.round(reactionScore + recallComponent);

    const result: CognitiveTestResult = {
      date: todayStr,
      reactionTimeMs: Math.round(avgReaction),
      wordRecallScore: recallScore,
      compositeScore: composite,
    };
    setResults(prev => {
      const filtered = prev.filter(r => r.date !== todayStr);
      return [...filtered, result].slice(-90); // keep 90 days
    });
    setPhase('complete');
  }, [reactionTimes, recallScore, todayStr, setResults]);

  // Correlations with health data
  const correlations = useMemo(() => {
    if (results.length < 5 || logs.length < 5) return null;
    const insights: { label: string; direction: 'positive' | 'negative' | 'neutral'; detail: string }[] = [];

    // Match cognitive scores with same-day health logs
    const paired = results.map(r => {
      const log = logs.find(l => l.date === r.date);
      return log ? { score: r.compositeScore, sleep: log.sleepQuality, pain: log.overallPain, mood: log.mood } : null;
    }).filter(Boolean) as { score: number; sleep: number; pain: number; mood: number }[];

    if (paired.length < 4) return null;

    const avgScoreHighSleep = paired.filter(p => p.sleep >= 7).map(p => p.score);
    const avgScoreLowSleep = paired.filter(p => p.sleep <= 4).map(p => p.score);
    if (avgScoreHighSleep.length >= 2 && avgScoreLowSleep.length >= 2) {
      const avgHigh = avgScoreHighSleep.reduce((a, b) => a + b, 0) / avgScoreHighSleep.length;
      const avgLow = avgScoreLowSleep.reduce((a, b) => a + b, 0) / avgScoreLowSleep.length;
      const diff = Math.round(avgHigh - avgLow);
      if (Math.abs(diff) >= 5) {
        insights.push({
          label: 'Sleep Quality',
          direction: diff > 0 ? 'positive' : 'negative',
          detail: `Cognitive scores are ${Math.abs(diff)} pts ${diff > 0 ? 'higher' : 'lower'} on good sleep days`,
        });
      }
    }

    const avgScoreHighPain = paired.filter(p => p.pain >= 6).map(p => p.score);
    const avgScoreLowPain = paired.filter(p => p.pain <= 3).map(p => p.score);
    if (avgScoreHighPain.length >= 2 && avgScoreLowPain.length >= 2) {
      const avgHP = avgScoreHighPain.reduce((a, b) => a + b, 0) / avgScoreHighPain.length;
      const avgLP = avgScoreLowPain.reduce((a, b) => a + b, 0) / avgScoreLowPain.length;
      const diff = Math.round(avgLP - avgHP);
      if (diff >= 5) {
        insights.push({
          label: 'Pain Level',
          direction: 'negative',
          detail: `High pain days reduce cognitive score by ~${diff} pts`,
        });
      }
    }

    return insights.length > 0 ? insights : null;
  }, [results, logs]);

  const avgScore = todayResult?.compositeScore ?? (results.length > 0 ? Math.round(results.slice(-7).reduce((s, r) => s + r.compositeScore, 0) / Math.min(results.length, 7)) : null);

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" aria-hidden="true" />
        <h3 className="font-semibold text-sm">Brain Fog Index</h3>
        {avgScore !== null && (
          <Badge variant="secondary" className="ml-auto text-[10px]">
            Score: {avgScore}/100
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Quick cognitive tests to track brain fog patterns over time.
      </p>

      {phase === 'idle' && (
        <>
          {todayResult ? (
            <div className="p-3 rounded-lg bg-muted/40 space-y-2">
              <p className="text-xs font-medium">Today's Results</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold">{todayResult.reactionTimeMs}ms</p>
                  <p className="text-[10px] text-muted-foreground">Reaction</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{todayResult.wordRecallScore}/10</p>
                  <p className="text-[10px] text-muted-foreground">Recall</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{todayResult.compositeScore}</p>
                  <p className="text-[10px] text-muted-foreground">Composite</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={startTest}>
                <RotateCcw className="h-3 w-3 mr-1" /> Retest
              </Button>
            </div>
          ) : (
            <Button onClick={startTest} size="sm" className="w-full">
              <Play className="h-3 w-3 mr-1" /> Start Cognitive Test (~30s)
            </Button>
          )}
        </>
      )}

      {/* Reaction time test */}
      {(phase === 'reaction-wait' || phase === 'reaction-go') && (
        <button
          onClick={handleReactionTap}
          className={cn(
            'w-full h-28 rounded-lg flex items-center justify-center text-sm font-medium transition-colors',
            phase === 'reaction-wait' ? 'bg-severity-high/20 text-severity-high' : 'bg-severity-low/20 text-severity-low',
          )}
        >
          {phase === 'reaction-wait' ? 'Wait for green...' : 'TAP NOW!'}
        </button>
      )}
      {(phase === 'reaction-wait' || phase === 'reaction-go') && (
        <p className="text-[10px] text-muted-foreground text-center">Round {reactionRound + 1} of {REACTION_ROUNDS}</p>
      )}

      {phase === 'reaction-done' && (
        <div className="space-y-2">
          <p className="text-xs text-center">
            Avg reaction: <span className="font-bold">{Math.round(reactionTimes.reduce((s, v) => s + v, 0) / reactionTimes.length)}ms</span>
          </p>
          <Button onClick={startWordRecall} size="sm" className="w-full">
            Next: Word Recall Test
          </Button>
        </div>
      )}

      {/* Word recall - memorise phase */}
      {phase === 'recall-memorise' && (
        <div className="space-y-2">
          <p className="text-xs text-center font-medium">Memorise these words ({memoriseCountdown}s)</p>
          <div className="grid grid-cols-3 gap-1.5">
            {testWords.map(w => (
              <div key={w} className="p-2 text-center rounded bg-primary/10 text-sm font-medium">{w}</div>
            ))}
          </div>
        </div>
      )}

      {/* Word recall - input phase */}
      {phase === 'recall-input' && (
        <div className="space-y-2">
          <p className="text-xs text-center font-medium">Type the words you remember (comma or space separated)</p>
          <textarea
            className="w-full p-2 text-sm border rounded-md bg-background resize-none"
            rows={2}
            value={userInput}
            aria-label="Recalled words"
            onChange={e => setUserInput(e.target.value)}
            autoFocus
            placeholder="Type words here..."
          />
          <Button onClick={submitRecall} size="sm" className="w-full">Submit</Button>
        </div>
      )}

      {phase === 'recall-done' && (
        <div className="space-y-2">
          <p className="text-xs text-center">
            Recall score: <span className="font-bold">{recallScore}/10</span> ({Math.round(recallScore / 10 * testWords.length)} of {testWords.length} words)
          </p>
          <Button onClick={finishTest} size="sm" className="w-full">See Results</Button>
        </div>
      )}

      {phase === 'complete' && (
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium">Test Complete!</p>
          <Button variant="outline" size="sm" onClick={() => setPhase('idle')}>View Summary</Button>
        </div>
      )}

      {/* Correlations */}
      {correlations && phase === 'idle' && (
        <div className="space-y-1.5 pt-1 border-t">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Health Correlations</p>
          {correlations.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {c.direction === 'positive' ? <TrendingUp className="h-3 w-3 text-chart-2" /> :
               c.direction === 'negative' ? <TrendingDown className="h-3 w-3 text-severity-high" /> :
               <Minus className="h-3 w-3 text-muted-foreground" />}
              <span className="text-muted-foreground">{c.detail}</span>
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && results.length < 5 && phase === 'idle' && (
        <p className="text-[10px] text-muted-foreground text-center">
          {5 - results.length} more tests needed for correlation insights
        </p>
      )}
    </Card>
  );
}
