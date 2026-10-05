"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AXIS_PROPS,
  CHART_MARGIN,
  ChartDataTable,
  ChartLegend,
  ChartTooltip,
  GRID_PROPS,
  type SeriesConfig,
} from "@/components/charts/chart-primitives";
import { GranularitySelect, RangeToggle, resolveGranularity } from "@/components/charts/chart-controls";
import { TrendBadge } from "@/components/shared/trend-badge";
import { useMetricsDataset, useReportRange } from "@/hooks/use-metrics";
import { useSvgId } from "@/hooks/use-svg-id";
import { DATE_RANGES } from "@/lib/constants";
import { formatCompactCurrency, formatCurrency, percentChange } from "@/lib/format";
import { getMetrics, getRevenueSeries } from "@/lib/metrics";
import type { Granularity, PlanFilter } from "@/types";

const SERIES: SeriesConfig[] = [
  { key: "revenue", label: "This period", color: "var(--chart-1)" },
  { key: "previousRevenue", label: "Previous period", color: "var(--chart-axis)", dashed: true },
];

interface RevenueChartProps {
  plan?: PlanFilter;
  title?: string;
  className?: string;
}

export function RevenueChart({ plan = "all", title = "Revenue", className }: RevenueChartProps) {
  const dataset = useMetricsDataset();
  const [range, setRange] = useReportRange();
  const [preferredGranularity, setPreferredGranularity] = useState<Granularity | null>(null);
  const granularity = resolveGranularity(range, preferredGranularity);
  const fillId = useSvgId("revenue-fill");

  const data = useMemo(
    () => getRevenueSeries(dataset, { range, granularity, plan }),
    [dataset, range, granularity, plan],
  );
  // Period totals come from the exact range, not the (whole-week) buckets.
  const { revenue } = useMemo(() => getMetrics(dataset, range, plan), [dataset, range, plan]);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{DATE_RANGES[range].label} compared with the previous period</CardDescription>
          <div className="flex flex-wrap items-baseline gap-2 pt-2">
            <span className="tabular text-2xl font-semibold tracking-tight">{formatCurrency(revenue.value)}</span>
            <TrendBadge change={percentChange(revenue.value, revenue.previousValue)} />
          </div>
        </div>
        <CardAction className="col-start-auto row-span-1 row-start-auto flex flex-wrap items-center gap-2 justify-self-start">
          <RangeToggle value={range} onChange={setRange} />
          <GranularitySelect range={range} value={granularity} onChange={setPreferredGranularity} />
        </CardAction>
      </CardHeader>
      <div className="px-2 sm:px-4">
        <ChartLegend series={SERIES} className="mb-3 px-2" />
        <figure aria-label={`${title} chart, ${DATE_RANGES[range].label.toLowerCase()}`}>
          <AreaChart responsive data={data} margin={CHART_MARGIN} style={{ width: "100%", height: 300 }}>
            <defs>
              <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="label" {...AXIS_PROPS} minTickGap={24} />
            <YAxis {...AXIS_PROPS} width={56} tickFormatter={formatCompactCurrency} />
            <Tooltip
              cursor={{ stroke: "var(--chart-axis)", strokeWidth: 1, strokeDasharray: "3 3" }}
              content={<ChartTooltip series={SERIES} formatValue={(value) => formatCurrency(value)} />}
            />
            <Line
              type="monotone"
              dataKey="previousRevenue"
              stroke="var(--chart-axis)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              strokeOpacity={0.7}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill={`url(#${fillId})`}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
              animationDuration={500}
            />
          </AreaChart>
          <ChartDataTable caption={`${title} by period`} data={data} series={SERIES} formatValue={formatCurrency} />
        </figure>
      </div>
    </Card>
  );
}
