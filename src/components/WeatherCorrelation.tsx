import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWeather } from '@/hooks/useWeather';
import { useHealthData } from '@/hooks/useHealthData';
import { CloudRain, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';

interface WeatherCorrelationProps {
  days?: number;
}

export function WeatherCorrelation({ days = 14 }: WeatherCorrelationProps) {
  const { getRecentWeather, hasData } = useWeather();
  const { logs, getRecentLogs } = useHealthData();

  const recentWeather = getRecentWeather(days);
  const recentLogs = getRecentLogs(days);

  const chartData = useMemo(() => {
    if (!recentWeather.length || !recentLogs.length) return [];

    return recentWeather
      .map(w => {
        const log = recentLogs.find(l => l.date === w.date);
        if (!log) return null;
        return {
          date: format(new Date(w.date), 'MMM d'),
          Pain: log.overallPain,
          Pressure: +(w.pressure - 1000).toFixed(0), // Normalize for chart scale
          Humidity: +(w.humidity / 10).toFixed(1), // Scale to 0-10
          PressureΔ: w.pressureChange,
        };
      })
      .filter(Boolean);
  }, [recentWeather, recentLogs]);

  const correlation = useMemo(() => {
    if (chartData.length < 4) return null;

    // Correlate pressure change with pain
    const pairs = chartData.map((d: any) => ({ x: d.PressureΔ, y: d.Pain }));
    const avgX = pairs.reduce((s, p) => s + p.x, 0) / pairs.length;
    const avgY = pairs.reduce((s, p) => s + p.y, 0) / pairs.length;
    let num = 0, denA = 0, denB = 0;
    pairs.forEach(p => {
      const dx = p.x - avgX;
      const dy = p.y - avgY;
      num += dx * dy;
      denA += dx * dx;
      denB += dy * dy;
    });
    const den = Math.sqrt(denA * denB);
    if (den === 0) return null;
    return +(num / den).toFixed(2);
  }, [chartData]);

  if (!hasData || chartData.length < 2) return null;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2">
        <CloudRain className="h-5 w-5 text-primary" aria-hidden="true" />
        <h3 className="font-semibold text-sm">Weather × Symptoms</h3>
      </div>

      <div className="h-40" role="img" aria-label="Chart showing weather conditions vs pain levels">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                fontSize: 11,
              }}
            />
            <Line type="monotone" dataKey="Pain" stroke="hsl(var(--severity-high))" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Pressure" stroke="hsl(var(--chart-2))" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
            <Line type="monotone" dataKey="Humidity" stroke="hsl(var(--chart-3))" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-3 justify-center text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 inline-block rounded" style={{ backgroundColor: 'hsl(var(--severity-high))' }} /> Pain
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 inline-block rounded" style={{ backgroundColor: 'hsl(var(--chart-2))' }} /> Pressure (hPa−1000)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 inline-block rounded" style={{ backgroundColor: 'hsl(var(--chart-3))' }} /> Humidity (÷10)
        </span>
      </div>

      {correlation !== null && (
        <div className="flex items-start gap-3 bg-muted/50 p-3 rounded-lg">
          <TrendingUp className="h-4 w-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-xs text-muted-foreground">
              {Math.abs(correlation) > 0.3
                ? `Pressure changes show a ${correlation > 0 ? 'positive' : 'negative'} correlation with your pain levels. ${
                    correlation > 0
                      ? 'Rising pressure may worsen your symptoms.'
                      : 'Dropping pressure may worsen your symptoms.'
                  }`
                : 'No strong correlation detected between barometric pressure changes and pain. Keep tracking for more data.'}
            </p>
            <Badge variant="secondary" className="mt-1 text-xs">
              Pressure↔Pain r = {correlation}
            </Badge>
          </div>
        </div>
      )}
    </Card>
  );
}
