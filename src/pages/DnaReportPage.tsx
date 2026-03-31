import { useState, useMemo, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/components/AppLayout';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import { parsePromethease, cleanHtml, DnaReport, DnaVariant } from '@/lib/promethease-parser';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Dna, Upload, Search, AlertTriangle, Shield, ChevronDown, ChevronUp,
  X, Filter, Info, ExternalLink, Trash2,
} from 'lucide-react';

type ReputeFilter = 'all' | 'Bad' | 'Good' | 'none';

export default function DnaReportPage() {
  const [report, setReport, { loaded, remove: removeReport }] = useIndexedDB<DnaReport | null>('dna-report', null);
  const [parsing, setParsing] = useState(false);
  const [search, setSearch] = useState('');
  const [reputeFilter, setReputeFilter] = useState<ReputeFilter>('all');
  const [minMag, setMinMag] = useState(2);
  const [condFilter, setCondFilter] = useState<string | null>(null);
  const [showCount, setShowCount] = useState(50);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      toast.error('Please upload a Promethease HTML report file');
      return;
    }

    setParsing(true);
    try {
      const text = await file.text();
      const result = await parsePromethease(text);
      setReport(result);
      toast.success(`Parsed ${result.totalVariants.toLocaleString()} genetic variants`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to parse report');
    } finally {
      setParsing(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [setReport]);

  const deleteReport = useCallback(() => {
    removeReport();
    toast.success('DNA report deleted');
  }, [removeReport]);

  // Aggregate conditions across all variants
  const allConditions = useMemo(() => {
    if (!report) return [];
    const counts: Record<string, number> = {};
    report.variants.forEach(v => {
      v.conditions.forEach(c => {
        counts[c] = (counts[c] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30);
  }, [report]);

  // Filter & sort
  const filtered = useMemo(() => {
    if (!report) return [];
    let result = report.variants.filter(v => v.magnitude >= minMag);

    if (reputeFilter !== 'all') {
      if (reputeFilter === 'none') {
        result = result.filter(v => !v.repute);
      } else {
        result = result.filter(v => v.repute === reputeFilter);
      }
    }

    if (condFilter) {
      result = result.filter(v => v.conditions.includes(condFilter));
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(v =>
        (v.rsnum || '').toLowerCase().includes(q) ||
        (v.title || '').toLowerCase().includes(q) ||
        v.genosummary.toLowerCase().includes(q) ||
        v.conditions.some(c => c.toLowerCase().includes(q)) ||
        v.medications.some(m => m.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => b.magnitude - a.magnitude);
  }, [report, minMag, reputeFilter, condFilter, search]);

  // Summary stats
  const stats = useMemo(() => {
    if (!report) return null;
    const bad = report.variants.filter(v => v.repute === 'Bad').length;
    const good = report.variants.filter(v => v.repute === 'Good').length;
    const highMag = report.variants.filter(v => v.magnitude >= 3).length;
    const pathogenic = report.variants.filter(v => v.clinvarSignificance === 'Pathogenic').length;
    return { bad, good, highMag, pathogenic, total: report.totalVariants };
  }, [report]);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dna className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">DNA Analysis</h2>
          </div>
          {report && (
            <Button variant="outline" size="sm" onClick={deleteReport}>
              <Trash2 className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        {!loaded ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-sm">Loading...</p>
          </Card>
        ) : !report ? (
          <Card className="p-8 text-center space-y-4">
            <Dna className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-medium">Upload Promethease Report</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Upload your Promethease HTML report to analyse genetic markers relevant to your conditions.
              All data stays on your device.
            </p>
            <div className="flex justify-center">
              <label className="cursor-pointer">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".html,.htm"
                  onChange={handleUpload}
                  className="hidden"
                />
                <Button asChild disabled={parsing}>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {parsing ? 'Parsing...' : 'Upload HTML Report'}
                  </span>
                </Button>
              </label>
            </div>
            <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3 text-left">
              <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Your Promethease report is processed entirely in your browser. No data is sent to any server.
                The parsed results are stored in your browser's local storage.
              </p>
            </div>
          </Card>
        ) : (
          <>
            {/* Summary */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-3 text-center">
                  <p className="text-2xl font-bold tabular-nums">{stats.total.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Total variants</p>
                </Card>
                <Card className="p-3 text-center">
                  <p className="text-2xl font-bold tabular-nums text-severity-high">{stats.bad}</p>
                  <p className="text-[10px] text-muted-foreground">Bad repute</p>
                </Card>
                <Card className="p-3 text-center">
                  <p className="text-2xl font-bold tabular-nums text-severity-low">{stats.good}</p>
                  <p className="text-[10px] text-muted-foreground">Good repute</p>
                </Card>
                <Card className="p-3 text-center">
                  <p className="text-2xl font-bold tabular-nums">{stats.highMag}</p>
                  <p className="text-[10px] text-muted-foreground">High impact (≥3)</p>
                </Card>
              </div>
            )}

            {/* Condition tags */}
            {allConditions.length > 0 && (
              <Card className="p-4 space-y-2">
                <h3 className="text-sm font-semibold">Top Conditions</h3>
                <div className="flex flex-wrap gap-1">
                  <Badge
                    variant={condFilter === null ? 'default' : 'outline'}
                    className="text-[10px] cursor-pointer"
                    onClick={() => setCondFilter(null)}
                  >
                    All
                  </Badge>
                  {allConditions.map(([cond, count]) => (
                    <Badge
                      key={cond}
                      variant={condFilter === cond ? 'default' : 'outline'}
                      className="text-[10px] cursor-pointer"
                      onClick={() => setCondFilter(condFilter === cond ? null : cond)}
                    >
                      {cond} ({count})
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by SNP, summary, condition..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-3 w-3 text-muted-foreground" />
                <div className="flex gap-1">
                  {(['all', 'Bad', 'Good', 'none'] as ReputeFilter[]).map(r => (
                    <Badge
                      key={r}
                      variant={reputeFilter === r ? 'default' : 'outline'}
                      className={cn('text-[10px] cursor-pointer', {
                        'text-severity-high border-severity-high': r === 'Bad' && reputeFilter !== r,
                        'text-severity-low border-severity-low': r === 'Good' && reputeFilter !== r,
                      })}
                      onClick={() => setReputeFilter(r)}
                    >
                      {r === 'none' ? 'Unset' : r}
                    </Badge>
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground ml-auto">
                  Min magnitude:
                </span>
                <select
                  value={minMag}
                  onChange={e => setMinMag(Number(e.target.value))}
                  className="text-xs bg-muted rounded px-2 py-1"
                >
                  {[0, 1, 2, 3, 4, 5].map(v => (
                    <option key={v} value={v}>≥{v}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-muted-foreground">
                Showing {Math.min(showCount, filtered.length)} of {filtered.length} variants
              </p>
            </div>

            {/* Variant list */}
            <div className="space-y-2">
              {filtered.slice(0, showCount).map((v, i) => (
                <VariantCard key={`${v.rsnum || v.title}-${i}`} variant={v} />
              ))}
            </div>

            {showCount < filtered.length && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowCount(s => s + 50)}
              >
                Load more ({filtered.length - showCount} remaining)
              </Button>
            )}

            {/* Re-upload */}
            <div className="text-center">
              <label className="cursor-pointer">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".html,.htm"
                  onChange={handleUpload}
                  className="hidden"
                />
                <Button variant="ghost" size="sm" asChild disabled={parsing}>
                  <span>
                    <Upload className="h-3 w-3 mr-1" />
                    {parsing ? 'Parsing...' : 'Upload new report'}
                  </span>
                </Button>
              </label>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

function VariantCard({ variant: v }: { variant: DnaVariant }) {
  const [expanded, setExpanded] = useState(false);
  const snpId = v.rsnum || v.title || 'Unknown';
  const snpediaUrl = `https://www.snpedia.com/index.php/${snpId}${v.geno || ''}`;

  return (
    <Card className="p-3 space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {v.repute === 'Bad' ? (
            <AlertTriangle className="h-4 w-4 text-severity-high shrink-0" />
          ) : v.repute === 'Good' ? (
            <Shield className="h-4 w-4 text-severity-low shrink-0" />
          ) : (
            <Dna className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <a
                href={snpediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono font-medium text-primary hover:underline"
              >
                {snpId}
              </a>
              {v.geno && (
                <span className="text-xs text-muted-foreground font-mono">{v.geno}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="outline" className={cn('text-[10px]', {
            'text-severity-severe border-severity-severe': v.magnitude >= 4,
            'text-severity-high border-severity-high': v.magnitude >= 3 && v.magnitude < 4,
            'text-severity-moderate border-severity-moderate': v.magnitude >= 2 && v.magnitude < 3,
            'text-muted-foreground border-muted': v.magnitude < 2,
          })}>
            mag {v.magnitude}
          </Badge>
          {v.repute && (
            <Badge variant="outline" className={cn('text-[10px]', {
              'text-severity-high border-severity-high': v.repute === 'Bad',
              'text-severity-low border-severity-low': v.repute === 'Good',
            })}>
              {v.repute}
            </Badge>
          )}
        </div>
      </div>

      {v.genosummary && (
        <p className="text-xs text-foreground">{cleanHtml(v.genosummary)}</p>
      )}

      {v.conditions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {v.conditions.map(c => (
            <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
          ))}
        </div>
      )}

      {v.clinvarSignificance && (
        <Badge variant="outline" className={cn('text-[10px]', {
          'text-severity-severe border-severity-severe': v.clinvarSignificance === 'Pathogenic',
          'text-severity-high border-severity-high': v.clinvarSignificance === 'Probable pathogenic',
          'text-severity-low border-severity-low': v.clinvarSignificance?.includes('non-pathogenic'),
        })}>
          ClinVar: {v.clinvarSignificance}
        </Badge>
      )}

      {(v.genobody || v.medications.length > 0 || v.topics.length > 0) && (
        <Button
          variant="ghost"
          size="sm"
          className="text-[10px] p-0 h-auto"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
          Details
        </Button>
      )}

      {expanded && (
        <div className="space-y-2 text-xs text-muted-foreground animate-fade-in border-t border-border pt-2">
          {v.genobody && <p className="whitespace-pre-wrap">{cleanHtml(v.genobody)}</p>}
          {v.medications.length > 0 && (
            <div>
              <span className="font-medium text-foreground">Medications: </span>
              {v.medications.join(', ')}
            </div>
          )}
          {v.topics.length > 0 && (
            <div>
              <span className="font-medium text-foreground">Topics: </span>
              {v.topics.join(', ')}
            </div>
          )}
          {v.chromosome && (
            <div>
              <span className="font-medium text-foreground">Location: </span>
              Chr{v.chromosome}:{v.position?.toLocaleString()}
              {v.frequency !== undefined && ` · MAF: ${(v.frequency * 100).toFixed(2)}%`}
            </div>
          )}
          <a
            href={snpediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            View on SNPedia <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </Card>
  );
}
