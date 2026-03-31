import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useHealthData } from '@/hooks/useHealthData';
import { useWeather } from '@/hooks/useWeather';
import { useFlarePredictor, FlareRiskLevel } from '@/hooks/useFlarePredictor';
import { AlertTriangle, Shield, ShieldAlert, ShieldCheck, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const RISK_CONFIG: Record<FlareRiskLevel, {
  icon: typeof Shield;
  label: string;
  colorClass: string;
  progressClass: string;
}> = {
  low: {
    icon: ShieldCheck,
    label: 'Low Risk',
    colorClass: 'text-severity-low',
    progressClass: '[&>div]:bg-severity-low',
  },
  moderate: {
    icon: Shield,
    label: 'Moderate Risk',
    colorClass: 'text-severity-moderate',
    progressClass: '[&>div]:bg-severity-moderate',
  },
  high: {
    icon: ShieldAlert,
    label: 'High Risk',
    colorClass: 'text-severity-high',
    progressClass: '[&>div]:bg-severity-high',
  },
  critical: {
    icon: AlertTriangle,
    label: 'Critical Risk',
    colorClass: 'text-severity-severe',
    progressClass: '[&>div]:bg-severity-severe',
  },
};

export function FlareForecast() {
  const { logs } = useHealthData();
  const { weather } = useWeather();
  const forecast = useFlarePredictor(logs, weather);

  if (!forecast) return null;

  const config = RISK_CONFIG[forecast.riskLevel];
  const Icon = config.icon;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-5 w-5', config.colorClass)} aria-hidden="true" />
          <h3 className="font-semibold text-sm">Flare Forecast</h3>
        </div>
        <Badge variant="outline" className={cn('text-xs', config.colorClass)}>
          {config.label}
        </Badge>
      </div>

      {/* Risk gauge */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Risk Score</span>
          <span className="tabular-nums font-medium">{forecast.riskScore}/100</span>
        </div>
        <Progress
          value={forecast.riskScore}
          className={cn('h-2.5', config.progressClass)}
        />
      </div>

      {/* Contributing factors */}
      {forecast.signals.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Contributing Factors</p>
          <div className="flex flex-wrap gap-1.5">
            {forecast.signals
              .sort((a, b) => b.weight - a.weight)
              .map(signal => (
                <Badge
                  key={signal.factor}
                  variant="secondary"
                  className="text-xs"
                  title={signal.description}
                >
                  {signal.factor}
                </Badge>
              ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div className="flex items-start gap-2.5 bg-muted/50 p-3 rounded-lg">
        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          {forecast.recommendation}
        </p>
      </div>

      {/* Confidence indicator */}
      <p className="text-[10px] text-muted-foreground/60 text-center">
        Confidence: {forecast.confidence} · Based on {logs.length} logged day{logs.length !== 1 ? 's' : ''}
      </p>
    </Card>
  );
}
