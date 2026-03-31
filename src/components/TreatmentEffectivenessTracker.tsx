import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useHealthData } from '@/hooks/useHealthData';
import { useTreatmentEffectiveness, TreatmentEffectivenessResult } from '@/hooks/useTreatmentEffectiveness';
import { Heart, TrendingDown, TrendingUp, Minus, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

function RatingBadge({ rating }: { rating: TreatmentEffectivenessResult['rating'] }) {
  const config = {
    effective: { label: 'Effective', className: 'text-severity-low border-severity-low' },
    neutral: { label: 'Neutral', className: 'text-muted-foreground border-muted' },
    unclear: { label: 'Need more data', className: 'text-severity-moderate border-severity-moderate' },
    insufficient: { label: 'Insufficient data', className: 'text-muted-foreground/60 border-muted' },
  };
  const c = config[rating];
  return <Badge variant="outline" className={cn('text-xs', c.className)}>{c.label}</Badge>;
}

function ImprovementIndicator({ value }: { value: number }) {
  if (Math.abs(value) < 5) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" /> No change
      </span>
    );
  }
  if (value > 0) {
    return (
      <span className="flex items-center gap-1 text-xs text-severity-low">
        <TrendingDown className="h-3 w-3" /> {value}% less severe
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-severity-high">
      <TrendingUp className="h-3 w-3" /> {Math.abs(value)}% more severe
    </span>
  );
}

function TreatmentCard({ result }: { result: TreatmentEffectivenessResult }) {
  const [expanded, setExpanded] = useState(false);

  const comparisonData = result.avgSeverityOff > 0
    ? [
        { label: 'With treatment', severity: result.avgSeverityOn, fill: 'hsl(var(--severity-low))' },
        { label: 'Without', severity: result.avgSeverityOff, fill: 'hsl(var(--severity-high))' },
      ]
    : null;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-primary" aria-hidden="true" />
          <h4 className="font-medium text-sm">{result.treatmentName}</h4>
        </div>
        <RatingBadge rating={result.rating} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-muted/50 rounded-lg p-2">
          <p className="text-lg font-bold tabular-nums">{result.daysDone}</p>
          <p className="text-[10px] text-muted-foreground">Days done</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2">
          <p className="text-lg font-bold tabular-nums">{result.daysMissed}</p>
          <p className="text-[10px] text-muted-foreground">Days missed</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2">
          <p className="text-lg font-bold tabular-nums">{result.avgSeverityOn.toFixed(1)}</p>
          <p className="text-[10px] text-muted-foreground">Avg severity</p>
        </div>
      </div>

      {result.daysMissed >= 2 && (
        <div className="flex items-center justify-center">
          <ImprovementIndicator value={result.improvementPercent} />
        </div>
      )}

      {comparisonData && (
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={85} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  fontSize: 11,
                }}
                formatter={(value: number) => [value.toFixed(1), 'Avg Severity']}
              />
              <Bar dataKey="severity" radius={[0, 4, 4, 0]}>
                {comparisonData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {result.symptomBreakdown.length > 0 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
            {expanded ? 'Hide' : 'Show'} symptom breakdown
          </Button>

          {expanded && (
            <div className="space-y-2 animate-fade-in">
              {result.symptomBreakdown.map(s => (
                <div key={s.symptomId} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{s.symptomName}</span>
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums">{s.avgOn.toFixed(1)} vs {s.avgOff.toFixed(1)}</span>
                    <ImprovementIndicator value={s.improvementPercent} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

export function TreatmentEffectivenessTracker() {
  const { logs, treatments, symptoms } = useHealthData();
  const results = useTreatmentEffectiveness(logs, treatments, symptoms);

  if (results.length === 0) return null;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" aria-hidden="true" />
        <h3 className="font-semibold text-sm">Treatment Effectiveness</h3>
      </div>

      <p className="text-xs text-muted-foreground">
        Compares average symptom severity on days you complete each treatment vs days you skip.
      </p>

      <div className="space-y-3">
        {results.map(r => (
          <TreatmentCard key={r.treatmentId} result={r} />
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground/60 text-center">
        Based on {logs.length} logged days · More data improves accuracy
      </p>
    </Card>
  );
}
