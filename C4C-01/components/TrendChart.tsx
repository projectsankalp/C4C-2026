"use client";

export type TrendDirection = "Improving" | "Stable" | "Worsening";

export interface TrendSeries {
  label: string;
  unit: string;
  values: number[];
  goodIsHigh?: boolean;
}

function linreg(values: number[]): { slope: number; intercept: number } {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: values[0] ?? 0 };
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }
  const denom = n * sumXX - sumX * sumX;
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function classifyTrend(
  values: number[],
  goodIsHigh: boolean,
): { direction: TrendDirection; slope: number } {
  const { slope } = linreg(values);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const normalized = mean === 0 ? slope : slope / Math.abs(mean);
  const threshold = 0.01;
  if (Math.abs(normalized) < threshold) return { direction: "Stable", slope };
  const rising = normalized > 0;
  const direction: TrendDirection = goodIsHigh
    ? rising
      ? "Improving"
      : "Worsening"
    : rising
      ? "Worsening"
      : "Improving";
  return { direction, slope };
}

export function TrendChart({ series }: { series: TrendSeries }) {
  const w = 160;
  const h = 36;
  const pad = 2;
  const goodIsHigh = series.goodIsHigh ?? false;
  const min = Math.min(...series.values);
  const max = Math.max(...series.values);
  const range = max - min || 1;
  const step = (w - pad * 2) / Math.max(series.values.length - 1, 1);
  const points = series.values
    .map((v, i) => {
      const x = pad + i * step;
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const { direction } = classifyTrend(series.values, goodIsHigh);
  const color =
    direction === "Improving"
      ? "#10b981"
      : direction === "Worsening"
        ? "#ef4444"
        : "#64748b";
  const last = series.values[series.values.length - 1];
  return (
    <div className="flex items-center gap-3">
      <svg width={w} height={h} className="shrink-0">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={1.75}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div className="text-[11px]">
        <div className="font-semibold text-navy-900">
          {series.label}{" "}
          <span className="font-mono text-slate-600">
            {last}
            {series.unit}
          </span>
        </div>
        <div
          className={`font-semibold ${
            direction === "Improving"
              ? "text-green-600"
              : direction === "Worsening"
                ? "text-red-600"
                : "text-slate-500"
          }`}
        >
          {direction}
        </div>
      </div>
    </div>
  );
}
