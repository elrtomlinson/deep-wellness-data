import { describe, it, expect } from 'vitest';
import { pearson, getCorrelationStrength } from '@/lib/correlation';

describe('pearson', () => {
  it('returns 1 for a perfect positive relationship', () => {
    expect(pearson([1, 2, 3, 4], [2, 4, 6, 8])).toBeCloseTo(1, 5);
  });

  it('returns -1 for a perfect negative relationship', () => {
    expect(pearson([1, 2, 3, 4], [8, 6, 4, 2])).toBeCloseTo(-1, 5);
  });

  it('returns null when a series has no variance', () => {
    expect(pearson([5, 5, 5, 5], [1, 2, 3, 4])).toBeNull();
  });

  it('returns null for mismatched or too-short series', () => {
    expect(pearson([1, 2], [1])).toBeNull();
    expect(pearson([], [])).toBeNull();
  });
});

describe('getCorrelationStrength', () => {
  it('classifies by absolute magnitude', () => {
    expect(getCorrelationStrength(0.8)).toBe('strong');
    expect(getCorrelationStrength(-0.8)).toBe('strong');
    expect(getCorrelationStrength(0.5)).toBe('moderate');
    expect(getCorrelationStrength(0.2)).toBe('weak');
    expect(getCorrelationStrength(0.05)).toBe('none');
  });
});
