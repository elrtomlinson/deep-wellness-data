import { useCallback } from 'react';

/**
 * Haptic feedback using the Vibration API.
 * Falls back silently on unsupported devices.
 */
export function useHaptic() {
  const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const light = useCallback(() => {
    if (canVibrate) navigator.vibrate(10);
  }, [canVibrate]);

  const medium = useCallback(() => {
    if (canVibrate) navigator.vibrate(25);
  }, [canVibrate]);

  const heavy = useCallback(() => {
    if (canVibrate) navigator.vibrate(50);
  }, [canVibrate]);

  const success = useCallback(() => {
    if (canVibrate) navigator.vibrate([10, 30, 10]);
  }, [canVibrate]);

  const warning = useCallback(() => {
    if (canVibrate) navigator.vibrate([30, 20, 30]);
  }, [canVibrate]);

  const error = useCallback(() => {
    if (canVibrate) navigator.vibrate([50, 30, 50, 30, 50]);
  }, [canVibrate]);

  return { light, medium, heavy, success, warning, error, canVibrate };
}
