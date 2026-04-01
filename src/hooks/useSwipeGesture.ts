import { useState, useRef, useCallback, useEffect } from 'react';
import { useHaptic } from './useHaptic';

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // min px for a swipe (default 50)
  maxVertical?: number; // max vertical movement to count as horizontal swipe
}

export function useSwipeGesture({ onSwipeLeft, onSwipeRight, threshold = 50, maxVertical = 60 }: SwipeOptions) {
  const startX = useRef(0);
  const startY = useRef(0);
  const haptic = useHaptic();

  const handlers = {
    onTouchStart: useCallback((e: React.TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    }, []),

    onTouchEnd: useCallback((e: React.TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dx = endX - startX.current;
      const dy = Math.abs(endY - startY.current);

      if (dy > maxVertical) return; // too vertical
      if (Math.abs(dx) < threshold) return; // too short

      if (dx > 0 && onSwipeRight) {
        haptic.light();
        onSwipeRight();
      } else if (dx < 0 && onSwipeLeft) {
        haptic.light();
        onSwipeLeft();
      }
    }, [onSwipeLeft, onSwipeRight, threshold, maxVertical, haptic]),
  };

  return handlers;
}
