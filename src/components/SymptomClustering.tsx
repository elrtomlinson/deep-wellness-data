import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHealthData } from '@/hooks/useHealthData';
import { Layers, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlareCluster {
  id: number;
  label: string;
  dominantSymptoms: { name: string; avgSeverity: number }[];
  avgPain: number;
  avgSleep: number;
  avgMood: number;
  dayCount: number;
  triggers: string[];
}

export function SymptomClustering() {
  const { symptoms, logs } = useHealthData();

  const clusters = useMemo<FlareCluster[]>(() => {
    if (logs.length < 14 || symptoms.length < 2) return [];

    // Get flare days (pain >= 5)
    const flareDays = logs.filter(l => l.overallPain >= 5);
    if (flareDays.length < 5) return [];

    // Build feature vectors for each flare day
    const vectors = flareDays.map(log => {
      const symMap: Record<string, number> = {};
      symptoms.forEach(sym => {
        const sl = log.symptoms.find(s => s.symptomId === sym.id);
        symMap[sym.name] = sl?.severity ?? 0;
      });
      return {
        log,
        features: symMap,
        pain: log.overallPain,
        sleep: log.sleepQuality,
        mood: log.mood,
      };
    });

    // Simple k-means-like clustering (k=2-3 based on data size)
    const k = flareDays.length >= 15 ? 3 : 2;
    const symNames = symptoms.map(s => s.name);

    // Initialize centroids using spread-out selection
    const sorted = [...vectors].sort((a, b) => {
      const sumA = symNames.reduce((s, n) => s + (a.features[n] ?? 0), 0);
      const sumB = symNames.reduce((s, n) => s + (b.features[n] ?? 0), 0);
      return sumA - sumB;
    });
    const centroids: Record<string, number>[] = [];
    for (let i = 0; i < k; i++) {
      const idx = Math.floor((i / k) * sorted.length);
      centroids.push({ ...sorted[idx].features });
    }

    // Run 10 iterations
    let assignments = new Array(vectors.length).fill(0);
    for (let iter = 0; iter < 10; iter++) {
      // Assign each point to nearest centroid
      assignments = vectors.map(v => {
        let bestDist = Infinity, bestC = 0;
        centroids.forEach((c, ci) => {
          let dist = 0;
          symNames.forEach(n => {
            dist += ((v.features[n] ?? 0) - (c[n] ?? 0)) ** 2;
          });
          if (dist < bestDist) { bestDist = dist; bestC = ci; }
        });
        return bestC;
      });

      // Update centroids
      centroids.forEach((c, ci) => {
        const members = vectors.filter((_, vi) => assignments[vi] === ci);
        if (members.length === 0) return;
        symNames.forEach(n => {
          c[n] = members.reduce((s, m) => s + (m.features[n] ?? 0), 0) / members.length;
        });
      });
    }

    // Build cluster summaries
    const clusterResults: FlareCluster[] = [];
    const typeLabels = ['Type A', 'Type B', 'Type C'];
    const descriptors = ['fatigue-dominant', 'pain-dominant', 'mixed-symptom'];

    for (let ci = 0; ci < k; ci++) {
      const members = vectors.filter((_, vi) => assignments[vi] === ci);
      if (members.length < 2) continue;

      const symAvgs = symNames.map(n => ({
        name: n,
        avgSeverity: +(members.reduce((s, m) => s + (m.features[n] ?? 0), 0) / members.length).toFixed(1),
      })).filter(s => s.avgSeverity > 0).sort((a, b) => b.avgSeverity - a.avgSeverity);

      const avgPain = +(members.reduce((s, m) => s + m.pain, 0) / members.length).toFixed(1);
      const avgSleep = +(members.reduce((s, m) => s + m.sleep, 0) / members.length).toFixed(1);
      const avgMood = +(members.reduce((s, m) => s + m.mood, 0) / members.length).toFixed(1);

      // Identify distinguishing characteristics
      const triggers: string[] = [];
      if (avgSleep <= 4) triggers.push('poor sleep');
      if (avgMood <= 3) triggers.push('low mood');
      if (avgPain >= 7) triggers.push('severe pain');

      // Generate descriptive label based on dominant symptom
      const topSym = symAvgs[0]?.name.toLowerCase() ?? 'general';
      const label = `${typeLabels[ci]}: ${topSym}-led flares`;

      clusterResults.push({
        id: ci,
        label,
        dominantSymptoms: symAvgs.slice(0, 4),
        avgPain, avgSleep, avgMood,
        dayCount: members.length,
        triggers,
      });
    }

    return clusterResults.sort((a, b) => b.dayCount - a.dayCount);
  }, [symptoms, logs]);

  if (clusters.length === 0) return null;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Layers className="h-5 w-5 text-primary" aria-hidden="true" />
        <h3 className="font-semibold text-sm">Flare Type Clustering</h3>
        <Badge variant="secondary" className="text-[10px] ml-auto">
          {clusters.length} types
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Your flares aren't all the same — here are distinct patterns detected in your data.
      </p>

      <div className="space-y-2">
        {clusters.map(cluster => (
          <div key={cluster.id} className="p-3 rounded-lg bg-muted/40 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold capitalize">{cluster.label}</p>
              <Badge variant="outline" className="text-[10px]">
                {cluster.dayCount} days
              </Badge>
            </div>

            {/* Symptom profile bar chart */}
            <div className="space-y-1">
              {cluster.dominantSymptoms.map(sym => (
                <div key={sym.name} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-20 truncate">{sym.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', {
                        'bg-severity-severe': sym.avgSeverity >= 7,
                        'bg-severity-high': sym.avgSeverity >= 5,
                        'bg-severity-moderate': sym.avgSeverity >= 3,
                        'bg-severity-low': sym.avgSeverity > 0,
                      })}
                      style={{ width: `${(sym.avgSeverity / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] tabular-nums w-6 text-right">{sym.avgSeverity}</span>
                </div>
              ))}
            </div>

            {/* Context metrics */}
            <div className="flex gap-3 text-[10px] text-muted-foreground">
              <span>Pain: {cluster.avgPain}/10</span>
              <span>Sleep: {cluster.avgSleep}/10</span>
              <span>Mood: {cluster.avgMood}/10</span>
            </div>

            {cluster.triggers.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                {cluster.triggers.map(t => (
                  <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Understanding your flare types can help target interventions to each pattern.
      </p>
    </Card>
  );
}
