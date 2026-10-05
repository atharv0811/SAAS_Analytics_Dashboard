"use client";

import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AXIS_PROPS,
  CHART_MARGIN,
  ChartDataTable,
  ChartTooltip,
  GRID_PROPS,
  type SeriesConfig,
} from "@/components/charts/chart-primitives";
import { TrendBadge } from "@/components/shared/trend-badge";
import { useSvgId } from "@/hooks/use-svg-id";
import { percentChange } from "@/lib/format";
import type { ValuePoint } from "@/types";

interface TrendChartProps {
  title: string;
  description: string;
  data: ValuePoint[];
  seriesLabel: string;
  color?: string;
  formatValue: (value: number) => string;
  formatTick?: (value: number) => string;
  /** Rates show change in percentage points rather than relative %. */
  isRate?: boolean;
  higherIsBetter?: boolean;
  className?: string;
}

/** Single-series trend card used for MRR, churn, ARPU and conversion. */
export function TrendChart({
  title,
  description,
  data,
  seriesLabel,
  color = "var(--chart-1)",
  formatValue,
  formatTick = formatValue,
  isRate = false,
  higherIsBetter = true,
  className,
}: TrendChartProps) {
  const fillId = useSvgId("trend-fill");
  const series: SeriesConfig[] = [{ key: "value", label: seriesLabel, color }];
  const first = data[0]?.value ?? 0;
  const last = data[data.length - 1]?.value ?? 0;
  const change = isRate ? last - first : percentChange(last, first);

  return (
    <Card className={className}>
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="flex flex-wrap items-baseline gap-2 pt-2">
          <span className="tabular text-2xl font-semibold tracking-tight">{formatValue(last)}</span>
          <TrendBadge change={change} higherIsBetter={higherIsBetter} unit={isRate ? "pp" : "%"} />
          <span className="text-xs text-muted-foreground">over the period</span>
        </div>
      </CardHeader>
      <figure className="px-2 sm:px-4" aria-label={`${title} chart`}>
        <AreaChart responsive data={data} margin={CHART_MARGIN} style={{ width: "100%", height: 220 }}>
          <defs>
            <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="label" {...AXIS_PROPS} minTickGap={24} />
          <YAxis {...AXIS_PROPS} width={52} domain={["auto", "auto"]} tickFormatter={formatTick} />
          <Tooltip
            cursor={{ stroke: "var(--chart-axis)", strokeDasharray: "3 3" }}
            content={<ChartTooltip series={series} formatValue={formatValue} />}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${fillId})`}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
            animationDuration={500}
          />
        </AreaChart>
        <ChartDataTable caption={`${title} by period`} data={data} series={series} formatValue={formatValue} />
      </figure>
    </Card>
  );
}
