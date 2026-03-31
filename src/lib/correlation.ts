/**
 * Computes Pearson correlation coefficient between two arrays.
 */
export function pearson(xs: number[], ys: number[]): number | null {
  const n = xs.length;
  if (n < 4) return null;
  const avgX = xs.reduce((s, v) => s + v, 0) / n;
  const avgY = ys.reduce((s, v) => s + v, 0) / n;
  let num = 0, denA = 0, denB = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - avgX;
    const dy = ys[i] - avgY;
    num += dx * dy;
    denA += dx * dx;
    denB += dy * dy;
  }
  const den = Math.sqrt(denA * denB);
  if (den === 0) return null;
  return num / den;
}

export function getCorrelationStrength(r: number): 'strong' | 'moderate' | 'weak' | 'none' {
  const abs = Math.abs(r);
  if (abs >= 0.6) return 'strong';
  if (abs >= 0.3) return 'moderate';
  if (abs >= 0.15) return 'weak';
  return 'none';
}

export function generateInsight(a: string, b: string, r: number): string {
  const abs = Math.abs(r);
  const dir = r > 0 ? 'increases' : 'decreases';
  if (abs < 0.15) return `No meaningful relationship detected between ${a} and ${b}.`;
  if (abs < 0.3) return `Weak tendency: ${a} slightly ${dir} as ${b} rises.`;
  if (abs < 0.6) return `Moderate pattern: ${a} tends to ${r > 0 ? 'rise' : 'fall'} when ${b} is higher.`;
  return `Strong correlation: ${a} consistently ${dir} with ${b}.`;
}

export interface CorrelationResult {
  varA: string;
  varB: string;
  r: number;
  strength: 'strong' | 'moderate' | 'weak' | 'none';
  direction: 'positive' | 'negative';
  insight: string;
}
