import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHealthData } from '@/hooks/useHealthData';
import { CloudRain, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { pearson, getCorrelationStrength } from '@/lib/correlation';

interface WeatherCorrelationProps {
  days?: number;
}

export function WeatherCorrelation({ days = 14 }: WeatherCorrelationProps) {
  const { getRecentLogs } = useHealthData();
  const recentLogs = getRecentLogs(days);

  // Use weather stored in daily logs
  const logsWithWeather = useMemo(
    () => recentLogs.filter(l => l.weather),
    [recentLogs]
  );

  const chartData = useMemo(() => {
    if (logsWithWeather.length < 2) return [];
    return logsWithWeather.map(l => {
      const w = l.weather!;
      return {
        date: format(new Date(l.date), 'MMM d'),
        Pain: l.overallPain,
        Pressure: +(w.pressure - 1000).toFixed(0),
        Humidity: +(w.humidity / 10).toFixed(1),
        AQI: w.aqi !== null ? +(w.aqi / 10).toFixed(1) : undefined,
        UV: w.uvIndex ?? undefined,
        Pollen: w.pollenTotal !== null ? +(w.pollenTotal / 10).toFixed(1) : undefined,
      };
    });
  }, [logsWithWeather]);

  const correlations = useMemo(() => {
    if (logsWithWeather.length < 4) return [];

    const pain = logsWithWeather.map(l => l.overallPain);
    const pairs: { name: string; values: number[] }[] = [
      { name: 'Pressure Δ', values: logsWithWeather.map(l => l.weather!.pressureChange) },
      { name: 'Humidity', values: logsWithWeather.map(l => l.weather!.humidity) },
      { name: 'Temperature', values: logsWithWeather.map(l => l.weather!.temperature) },
    ];
    const aqi = logsWithWeather.map(l => l.weather!.aqi).filter((v): v is number => v !== null);
    if (aqi.length === logsWithWeather.length) pairs.push({ name: 'Air Quality', values: aqi });
    const uv = logsWithWeather.map(l => l.weather!.uvIndex).filter((v): v is number => v !== null);
    if (uv.length === logsWithWeather.length) pairs.push({ name: 'UV Index', values: uv });
    const pollen = logsWithWeather.map(l => l.weather!.pollenTotal).filter((v): v is number => v !== null);
    if (pollen.length === logsWithWeather.length) pairs.push({ name: 'Pollen', values: pollen });

    return pairs
      .map(p => {
        const r = pearson(p.values, pain);
        if (r === null) return null;
        const strength = getCorrelationStrength(r);
        if (strength === 'none') return null;
        return { name: p.name, r, strength, direction: r > 0 ? 'positive' as const : 'negative' as const };
      })
      .filter(Boolean)
      .sort((a, b) => Math.abs(b!.r) - Math.abs(a!.r)) as { name: string; r: number; strength: string; direction: 'positive' | 'negative' }[];
  }, [logsWithWeather]);

  if (chartData.length < 2) return null;

  const hasAqi = chartData.some(d => d.AQI !== undefined);
  const hasUv = chartData.some(d => d.UV !== undefined);

  const lines = [
    { key: 'Pain', color: 'hsl(var(--severity-high))', width: 2, dash: undefined },
    { key: 'Pressure', color: 'hsl(var(--chart-2))', width: 1.5, dash: '5 3' },
    { key: 'Humidity', color: 'hsl(var(--chart-3))', width: 1.5, dash: '3 3' },
    ...(hasAqi ? [{ key: 'AQI', color: 'hsl(var(--chart-4))', width: 1.5, dash: '2 2' }] : []),
    ...(hasUv ? [{ key: 'UV', color: 'hsl(var(--chart-5))', width: 1.5, dash: '6 2' }] : []),
  ];

  return (
    <Card className="p-4 sm:p-5 space-y-4">
      <div className="flex items-center gap-2">
        <CloudRain className="h-5 w-5 text-primary" aria-hidden="true" />
        <h3 className="font-semibold text-sm">Weather × Symptoms</h3>
        <Badge variant="secondary" className="text-[10px] ml-auto">
          {logsWithWeather.length} days
        </Badge>
      </div>

      <div className="h-44" role="img" aria-label="Chart showing weather conditions vs pain levels">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis domain={[0, 'auto']} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                fontSize: 11,
              }}
            />
            {lines.map(l => (
              <Line
                key={l.key}
                type="monotone"
                dataKey={l.key}
                stroke={l.color}
                strokeWidth={l.width}
                dot={false}
                strokeDasharray={l.dash}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
        {lines.map(l => (
          <span key={l.key} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span
              className="w-4 h-0.5 inline-block rounded"
              style={{
                backgroundColor: l.color,
                ...(l.dash ? { backgroundImage: 'none', borderBottom: `1.5px dashed ${l.color}`, backgroundColor: 'transparent' } : {}),
              }}
            />
            {l.key === 'Pressure' ? 'Pressure (hPa−1000)' :
             l.key === 'Humidity' ? 'Humidity (÷10)' :
             l.key === 'AQI' ? 'AQI (÷10)' :
             l.key === 'Pollen' ? 'Pollen (÷10)' :
             l.key}
          </span>
        ))}
      </div>

      {/* Correlation summary */}
      {correlations.length > 0 && (
        <div className="space-y-1.5 border-t pt-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Weather ↔ Pain Correlations
          </p>
          {correlations.map(c => (
            <div key={c.name} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
              {c.direction === 'positive' ? (
                <TrendingUp className={cn('h-3.5 w-3.5 shrink-0', {
                  'text-severity-high': c.strength === 'strong',
                  'text-severity-moderate': c.strength === 'moderate',
                  'text-muted-foreground': c.strength === 'weak',
                })} />
              ) : (
                <TrendingDown className={cn('h-3.5 w-3.5 shrink-0', {
                  'text-chart-2': c.strength === 'strong',
                  'text-chart-3': c.strength === 'moderate',
                  'text-muted-foreground': c.strength === 'weak',
                })} />
              )}
              <span className="text-xs flex-1">{c.name}</span>
              <Badge
                variant="outline"
                className={cn('text-[10px]', {
                  'border-severity-high text-severity-high': c.strength === 'strong',
                  'border-severity-moderate text-severity-moderate': c.strength === 'moderate',
                })}
              >
                r = {c.r.toFixed(2)}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
