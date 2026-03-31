import { useMemo } from 'react';
import { DailyLog } from '@/types/health';
import { WeatherData } from './useWeather';

export type FlareRiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface FlareSignal {
  factor: string;
  description: string;
  weight: number; // 0-1 contribution to risk
}

export interface FlareForecast {
  riskLevel: FlareRiskLevel;
  riskScore: number; // 0-100
  signals: FlareSignal[];
  recommendation: string;
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Client-side heuristic flare prediction engine.
 * Analyses recent health logs + weather data to estimate flare risk
 * using weighted pattern-matching — no cloud/AI required.
 */
export function useFlarePredictor(
  logs: DailyLog[],
  weather: WeatherData[],
): FlareForecast | null {
  return useMemo(() => {
    if (logs.length < 3) return null;

    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    const last3 = sorted.slice(-3);
    const last7 = sorted.slice(-7);
    const todayWeather = weather.length ? weather[weather.length - 1] : null;

    const signals: FlareSignal[] = [];

    // === 1. Pain trend (rising over 3 days) ===
    if (last3.length >= 3) {
      const painTrend = last3[2].overallPain - last3[0].overallPain;
      if (painTrend >= 2) {
        signals.push({
          factor: 'Rising Pain',
          description: `Pain increased by ${painTrend} points over the last 3 days`,
          weight: Math.min(painTrend / 5, 1) * 0.25,
        });
      }
    }

    // === 2. Poor sleep streak ===
    const poorSleepDays = last3.filter(l => l.sleepQuality <= 4).length;
    if (poorSleepDays >= 2) {
      signals.push({
        factor: 'Poor Sleep',
        description: `${poorSleepDays} of the last 3 days had low sleep quality`,
        weight: (poorSleepDays / 3) * 0.2,
      });
    }

    // === 3. Low mood streak ===
    const lowMoodDays = last3.filter(l => l.mood <= 3).length;
    if (lowMoodDays >= 2) {
      signals.push({
        factor: 'Low Mood',
        description: `Mood has been low for ${lowMoodDays} of the last 3 days`,
        weight: (lowMoodDays / 3) * 0.15,
      });
    }

    // === 4. Energy depletion ===
    const lastLog = last3[last3.length - 1];
    if (lastLog.energyLevel !== undefined && lastLog.energyLevel <= 25) {
      signals.push({
        factor: 'Low Energy',
        description: `Energy level at ${lastLog.energyLevel}% — reserves are depleted`,
        weight: 0.15,
      });
    }

    // === 5. Symptom severity spike ===
    if (last3.length >= 2) {
      const prevSymTotal = last3.slice(0, -1).reduce((sum, l) =>
        sum + l.symptoms.reduce((s, sy) => s + sy.severity, 0), 0) / Math.max(last3.length - 1, 1);
      const curSymTotal = lastLog.symptoms.reduce((s, sy) => s + sy.severity, 0);
      if (curSymTotal > prevSymTotal * 1.5 && curSymTotal > 5) {
        signals.push({
          factor: 'Symptom Spike',
          description: 'Total symptom severity has increased significantly',
          weight: 0.2,
        });
      }
    }

    // === 6. Barometric pressure drop ===
    if (todayWeather && Math.abs(todayWeather.pressureChange) >= 5) {
      const direction = todayWeather.pressureChange < 0 ? 'dropped' : 'risen';
      signals.push({
        factor: 'Pressure Change',
        description: `Barometric pressure has ${direction} by ${Math.abs(todayWeather.pressureChange)} hPa`,
        weight: Math.min(Math.abs(todayWeather.pressureChange) / 15, 1) * 0.2,
      });
    }

    // === 7. High humidity ===
    if (todayWeather && todayWeather.humidity >= 80) {
      signals.push({
        factor: 'High Humidity',
        description: `Humidity at ${todayWeather.humidity}% — may worsen joint/muscle symptoms`,
        weight: 0.1,
      });
    }

    // === 8. Historical pattern: same-weekday flare tendency ===
    if (last7.length >= 5) {
      const highPainDays = last7.filter(l => l.overallPain >= 7).length;
      if (highPainDays >= 3) {
        signals.push({
          factor: 'Recurring Flares',
          description: `${highPainDays} high-pain days in the last week — flare cycle may be active`,
          weight: 0.2,
        });
      }
    }

    // === 9. Missed medications ===
    if (lastLog.medications.length > 0) {
      const missed = lastLog.medications.filter(m => !m.taken).length;
      const total = lastLog.medications.length;
      if (missed > 0 && missed / total >= 0.5) {
        signals.push({
          factor: 'Missed Medications',
          description: `${missed} of ${total} medications were missed recently`,
          weight: (missed / total) * 0.15,
        });
      }
    }

    // Calculate composite risk score (0-100)
    const rawScore = signals.reduce((sum, s) => sum + s.weight, 0);
    const riskScore = Math.min(Math.round(rawScore * 100), 100);

    const riskLevel: FlareRiskLevel =
      riskScore >= 60 ? 'critical' :
      riskScore >= 40 ? 'high' :
      riskScore >= 20 ? 'moderate' : 'low';

    const confidence: 'low' | 'medium' | 'high' =
      logs.length >= 14 ? 'high' :
      logs.length >= 7 ? 'medium' : 'low';

    const recommendation = getRecommendation(riskLevel, signals);

    return { riskLevel, riskScore, signals, recommendation, confidence };
  }, [logs, weather]);
}

function getRecommendation(level: FlareRiskLevel, signals: FlareSignal[]): string {
  const factors = signals.map(s => s.factor.toLowerCase());

  if (level === 'critical') {
    return 'High flare risk detected. Consider resting, staying hydrated, and keeping medications on hand. Avoid overexertion today.';
  }
  if (level === 'high') {
    if (factors.includes('poor sleep')) {
      return 'Prioritise sleep tonight — poor sleep is a strong flare trigger. Consider a lighter schedule tomorrow.';
    }
    if (factors.includes('pressure change')) {
      return 'Weather changes may trigger symptoms. Stay indoors if possible and prepare pain management strategies.';
    }
    return 'Multiple risk factors are elevated. Pace your activities and monitor symptoms closely.';
  }
  if (level === 'moderate') {
    return 'Some warning signs are present. Keep tracking and consider preventive measures like rest and hydration.';
  }
  return 'Risk is currently low. Keep up your routine and continue logging for better predictions.';
}
