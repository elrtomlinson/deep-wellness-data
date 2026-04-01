import { useState, useRef, useCallback, useEffect } from 'react';
import { useHaptic } from './useHaptic';

interface PullToRefreshOptions {
  onRefresh: () => void | Promise<void>;
  threshold?: number; // px to trigger (default 80)
  maxPull?: number;   // max visual pull (default 120)
}

export function usePullToRefresh({ onRefresh, threshold = 80, maxPull = 120 }: PullToRefreshOptions) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isPulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const haptic = useHaptic();
  const triggeredRef = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const el = containerRef.current;
    if (!el || refreshing) return;
    // Only start pull if scrolled to top
    if (el.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
    isPulling.current = true;
    triggeredRef.current = false;
  }, [refreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling.current || refreshing) return;
    currentY.current = e.touches[0].clientY;
    const delta = currentY.current - startY.current;
    if (delta < 0) {
      isPulling.current = false;
      setPulling(false);
      setPullDistance(0);
      return;
    }
    // Dampen the pull with diminishing returns
    const dampened = Math.min(delta * 0.5, maxPull);
    setPulling(true);
    setPullDistance(dampened);

    // Haptic when crossing threshold
    if (dampened >= threshold && !triggeredRef.current) {
      haptic.medium();
      triggeredRef.current = true;
    } else if (dampened < threshold && triggeredRef.current) {
      triggeredRef.current = false;
    }
  }, [refreshing, maxPull, threshold, haptic]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= threshold) {
      setRefreshing(true);
      haptic.success();
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    setPulling(false);
    setPullDistance(0);
  }, [pullDistance, threshold, onRefresh, haptic]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd);
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const isTriggered = pullDistance >= threshold;

  return { containerRef, pulling, pullDistance, refreshing, isTriggered };
}
