import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHealthData } from '@/hooks/useHealthData';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import { DnaReport, DnaVariant, cleanHtml } from '@/lib/promethease-parser';
import { Dna, AlertTriangle, Shield, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface MatchedVariant {
  variant: DnaVariant;
  matchedCondition: string;
  matchType: 'condition' | 'topic' | 'medication';
}

/**
 * Fuzzy-matches a user's tracked condition/medication name against
 * a DNA variant's conditions, topics, or medications arrays.
 */
function fuzzyMatch(needle: string, haystack: string): boolean {
  const n = needle.toLowerCase().replace(/['']/g, '').trim();
  const h = haystack.toLowerCase().replace(/['']/g, '').trim();
  if (h.includes(n) || n.includes(h)) return true;
  // Match individual words (≥4 chars) for partial overlap
  const words = n.split(/\s+/).filter(w => w.length >= 4);
  return words.length > 0 && words.some(w => h.includes(w));
}

export function DnaConditionInsights() {
  const [report, , { loaded }] = useIndexedDB<DnaReport | null>('dna-report', null);
  const { conditions, medications } = useHealthData();

  const matches = useMemo<MatchedVariant[]>(() => {
    if (!report || conditions.length === 0) return [];

    const condNames = conditions.map(c => c.name);
    const medNames = medications.filter(m => m.active).map(m => m.name);
    const results: MatchedVariant[] = [];
    const seen = new Set<string>();

    for (const variant of report.variants) {
      if (variant.magnitude < 1.5) continue; // skip low-impact

      // Match against conditions
      for (const condName of condNames) {
        const matched =
          variant.conditions.some(vc => fuzzyMatch(condName, vc)) ||
          variant.topics.some(t => fuzzyMatch(condName, t)) ||
          (variant.clinvarDiseases || []).some(d => fuzzyMatch(condName, d));

        if (matched) {
          const key = `${variant.rsnum || variant.title}-${condName}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({ variant, matchedCondition: condName, matchType: 'condition' });
          }
        }
      }

      // Match against medications
      for (const medName of medNames) {
        if (variant.medications.some(vm => fuzzyMatch(medName, vm))) {
          const key = `${variant.rsnum || variant.title}-med-${medName}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({ variant, matchedCondition: medName, matchType: 'medication' });
          }
        }
      }
    }

    // Sort: pathogenic first, then by magnitude desc
    return results.sort((a, b) => {
      const aPath = a.variant.clinvarSignificance === 'Pathogenic' ? 1 : 0;
      const bPath = b.variant.clinvarSignificance === 'Pathogenic' ? 1 : 0;
      if (aPath !== bPath) return bPath - aPath;
      if (a.variant.repute === 'Bad' && b.variant.repute !== 'Bad') return -1;
      if (b.variant.repute === 'Bad' && a.variant.repute !== 'Bad') return 1;
      return b.variant.magnitude - a.variant.magnitude;
    });
  }, [report, conditions, medications]);

  if (!loaded || !report) return null;
  if (matches.length === 0) return null;

  // Group by condition
  const grouped = new Map<string, MatchedVariant[]>();
  for (const m of matches) {
    const group = grouped.get(m.matchedCondition) || [];
    group.push(m);
    grouped.set(m.matchedCondition, group);
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Dna className="h-5 w-5 text-primary" aria-hidden="true" />
        <h3 className="font-semibold text-sm">Genetic Markers</h3>
        <Badge variant="secondary" className="text-[10px] ml-auto">
          {matches.length} relevant
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        DNA variants linked to your tracked conditions and medications.
      </p>

      <div className="space-y-4">
        {Array.from(grouped.entries()).map(([condName, variants]) => (
          <div key={condName} className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] font-medium">
                {condName}
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                {variants.length} variant{variants.length !== 1 ? 's' : ''}
              </span>
            </div>

            {variants.slice(0, 5).map((m, i) => {
              const v = m.variant;
              const snpId = v.rsnum || v.title || 'Unknown';
              const snpediaUrl = `https://www.snpedia.com/index.php/${snpId}${v.geno || ''}`;

              return (
                <div
                  key={`${snpId}-${i}`}
                  className="flex items-start gap-2 p-2 rounded-lg bg-muted/40"
                >
                  <div className="mt-0.5 shrink-0">
                    {v.repute === 'Bad' ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-severity-high" />
                    ) : v.repute === 'Good' ? (
                      <Shield className="h-3.5 w-3.5 text-severity-low" />
                    ) : (
                      <Dna className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <a
                        href={snpediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono font-medium text-primary hover:underline"
                      >
                        {snpId}
                      </a>
                      {v.geno && (
                        <span className="text-[10px] text-muted-foreground font-mono">{v.geno}</span>
                      )}
                      <div className="flex items-center gap-1 ml-auto">
                        <Badge
                          variant="outline"
                          className={cn('text-[10px]', {
                            'border-severity-severe text-severity-severe': v.magnitude >= 4,
                            'border-severity-high text-severity-high': v.magnitude >= 3 && v.magnitude < 4,
                            'border-severity-moderate text-severity-moderate': v.magnitude >= 2 && v.magnitude < 3,
                            'border-muted text-muted-foreground': v.magnitude < 2,
                          })}
                        >
                          mag {v.magnitude}
                        </Badge>
                        {v.repute && (
                          <Badge
                            variant="outline"
                            className={cn('text-[10px]', {
                              'border-severity-high text-severity-high': v.repute === 'Bad',
                              'border-severity-low text-severity-low': v.repute === 'Good',
                            })}
                          >
                            {v.repute}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                      {cleanHtml(v.genosummary)}
                    </p>
                    {v.clinvarSignificance && (
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] mt-1', {
                          'border-severity-severe text-severity-severe': v.clinvarSignificance === 'Pathogenic',
                          'border-severity-high text-severity-high': v.clinvarSignificance === 'Probable pathogenic',
                        })}
                      >
                        ClinVar: {v.clinvarSignificance}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}

            {variants.length > 5 && (
              <p className="text-[10px] text-muted-foreground text-center">
                + {variants.length - 5} more variants
              </p>
            )}
          </div>
        ))}
      </div>

      <Link
        to="/dna"
        className="flex items-center justify-center gap-1 text-xs text-primary hover:underline pt-1"
      >
        View full DNA analysis <ExternalLink className="h-3 w-3" />
      </Link>
    </Card>
  );
}
