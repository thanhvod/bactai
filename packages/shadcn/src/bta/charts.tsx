import * as React from 'react';
import { Bar, BarChart as RBarChart, CartesianGrid, Legend, Line, LineChart as RLineChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts';
import { formatVnd } from '@bta/shared';
import { cn } from '../lib/utils';

export interface ChartSeries {
  name: string;
  values: number[];
  colorToken?: 1 | 2 | 3 | 4;
}

export interface ChartProps {
  labels: string[];
  series: ChartSeries[];
  height?: number;
  money?: boolean;
  /** Luôn kèm bảng dữ liệu (a11y) */
  withTable?: boolean;
  className?: string;
}

const COLORS = ['var(--bta-chart-1)', 'var(--bta-chart-2)', 'var(--bta-chart-3)', 'var(--bta-chart-4)'];

function toData(labels: string[], series: ChartSeries[]) {
  return labels.map((l, i) => Object.fromEntries([['label', l], ...series.map((s) => [s.name, s.values[i] ?? 0])]));
}

const compact = (n: number) => (Math.abs(n) >= 1_000_000_000 ? `${(n / 1_000_000_000).toFixed(1)} tỷ` : Math.abs(n) >= 1_000_000 ? `${Math.round(n / 1_000_000)} tr` : Math.abs(n) >= 1000 ? `${Math.round(n / 1000)} k` : String(n));

function DataTableSmall({ labels, series, money }: ChartProps) {
  return (
    <table className="mt-2 w-full text-body-sm">
      <thead className="text-text-muted">
        <tr>
          <th className="py-1 text-left font-medium">Kỳ</th>
          {series.map((s) => (
            <th key={s.name} className="py-1 text-right font-medium">
              {s.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {labels.map((l, i) => (
          <tr key={l} className="border-t border-border">
            <td className="py-1">{l}</td>
            {series.map((s) => (
              <td key={s.name} className="py-1 text-right tabular-nums">
                {money ? formatVnd(s.values[i] ?? 0, false) : s.values[i] ?? 0}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function common(money?: boolean) {
  return {
    grid: <CartesianGrid vertical={false} stroke="var(--bta-border)" />,
    x: <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--bta-text-muted)' }} axisLine={{ stroke: 'var(--bta-border)' }} tickLine={false} />,
    y: <YAxis tick={{ fontSize: 12, fill: 'var(--bta-text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => (money ? compact(v) : String(v))} width={56} />,
    tip: <RTooltip formatter={(v: unknown) => (money ? formatVnd(Number(v)) : String(v))} contentStyle={{ borderRadius: 6, border: '1px solid var(--bta-border)', fontSize: 13 }} />,
  };
}

export function BarChart({ labels, series, height = 240, money, withTable = true, className }: ChartProps) {
  const c = common(money);
  return (
    <div className={cn(className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RBarChart data={toData(labels, series)} barCategoryGap="30%">
          {c.grid}
          {c.x}
          {c.y}
          {c.tip}
          {series.length >= 2 ? <Legend wrapperStyle={{ fontSize: 12 }} /> : null}
          {series.map((s, i) => (
            <Bar key={s.name} dataKey={s.name} fill={COLORS[(s.colorToken ?? i + 1) - 1]} radius={[3, 3, 0, 0]} />
          ))}
        </RBarChart>
      </ResponsiveContainer>
      {withTable ? <DataTableSmall labels={labels} series={series} money={money} /> : null}
    </div>
  );
}

export function LineChart({ labels, series, height = 240, money, withTable = true, className }: ChartProps) {
  const c = common(money);
  return (
    <div className={cn(className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RLineChart data={toData(labels, series)}>
          {c.grid}
          {c.x}
          {c.y}
          {c.tip}
          {series.length >= 2 ? <Legend wrapperStyle={{ fontSize: 12 }} /> : null}
          {series.map((s, i) => (
            <Line key={s.name} type="monotone" dataKey={s.name} stroke={COLORS[(s.colorToken ?? i + 1) - 1]} strokeWidth={2} dot={{ r: 3 }} />
          ))}
        </RLineChart>
      </ResponsiveContainer>
      {withTable ? <DataTableSmall labels={labels} series={series} money={money} /> : null}
    </div>
  );
}
