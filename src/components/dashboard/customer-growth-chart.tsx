"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  AXIS_PROPS,
  CHART_MARGIN,
  ChartDataTable,
  ChartTooltip,
  GRID_PROPS,
  type SeriesConfig,
} from "@/components/charts/chart-primitives";
import { TrendBadge } from "@/components/shared/trend-badge";
import { useMetricsDataset, useReportRange } from "@/hooks/use-metrics";
import { useSvgId } from "@/hooks/use-svg-id";
import { DATE_RANGES, DEFAULT_GRANULARITY } from "@/lib/constants";
import { formatNumber, percentChange } from "@/lib/format";
import { getCustomerSeries, getCustomerTotals } from "@/lib/metrics";
import type { CustomerPoint, PlanFilter } from "@/types";

type CustomerMetric = "new" | "returning" | "churned" | "growth";

const METRICS: Record<
  CustomerMetric,
  SeriesConfig & { key: keyof CustomerPoint; tab: string; summary: string; higherIsBetter: boolean }
> = {
  new: {
    key: "newCustomers",
    tab: "New",
    label: "New customers",
    color: "var(--chart-1)",
    summary: "new paying customers",
    higherIsBetter: true,
  },
  returning: {
    key: "returningCustomers",
    tab: "Returning",
    label: "Returning customers",
    color: "var(--chart-3)",
    summary: "customers reactivated a subscription",
    higherIsBetter: true,
  },
  churned: {
    key: "churnedCustomers",
    tab: "Churn",
    label: "Churned customers",
    color: "var(--chart-2)",
    summary: "customers cancelled",
    higherIsBetter: false,
  },
  growth: {
    key: "activeCustomers",
    tab: "Growth",
    label: "Active customers",
    color: "var(--chart-1)",
    summary: "active customers at period end",
    higherIsBetter: true,
  },
};

const METRIC_KEYS = Object.keys(METRICS) as CustomerMetric[];

export function CustomerGrowthChart({ plan = "all", className }: { plan?: PlanFilter; className?: string }) {
  const dataset = useMetricsDataset();
  const [range] = useReportRange();
  const [metric, setMetric] = useState<CustomerMetric>("new");
  const fillId = useSvgId("customers-fill");
  const config = METRICS[metric];
  const series = [config];

  const data = useMemo(
    () => getCustomerSeries(dataset, { range, granularity: DEFAULT_GRANULARITY[range], plan }),
    [dataset, range, plan],
  );

  const values = data.map((point) => point[config.key] as number);
  const isGrowth = metric === "growth";
  const totals = useMemo(() => getCustomerTotals(dataset, range, plan), [dataset, range, plan]);
  const headline = totals[config.key as keyof typeof totals];
  const half = Math.floor(values.length / 2);
  const recent = values.slice(half).reduce((sum, value) => sum + value, 0);
  const earlier = values.slice(0, half).reduce((sum, value) => sum + value, 0);
  const change = isGrowth ? percentChange(values[values.length - 1], values[0]) : percentChange(recent, earlier);

  const tooltip = <ChartTooltip series={series} formatValue={formatNumber} />;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col gap-4 px-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="space-y-1">
          <CardTitle>Customer analytics</CardTitle>
          <CardDescription>
            {formatNumber(headline)} {config.summary} · {DATE_RANGES[range].label.toLowerCase()}
          </CardDescription>
          <div className="pt-1 text-xs text-muted-foreground">
            <TrendBadge change={change} higherIsBetter={config.higherIsBetter} />{" "}
            {isGrowth ? "over the period" : "second half vs. first half"}
          </div>
        </div>
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          spacing={0}
          value={metric}
          onValueChange={(next) => next && setMetric(next as CustomerMetric)}
          aria-label="Customer metric"
          className="bg-card"
        >
          {METRIC_KEYS.map((key) => (
            <ToggleGroupItem
              key={key}
              value={key}
              className="px-2.5 text-xs data-[state=on]:bg-muted data-[state=on]:font-semibold data-[state=on]:text-foreground"
            >
              {METRICS[key].tab}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardHeader>
      <figure className="flex min-h-[260px] flex-1 flex-col px-2 sm:px-4" aria-label={`${config.label} chart`}>
        {isGrowth ? (
          <AreaChart
            responsive
            data={data}
            margin={CHART_MARGIN}
            style={{ width: "100%", height: "100%", minHeight: 260, flex: 1 }}
          >
            <defs>
              <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={config.color} stopOpacity={0.2} />
                <stop offset="100%" stopColor={config.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="label" {...AXIS_PROPS} minTickGap={24} />
            <YAxis {...AXIS_PROPS} width={48} domain={["dataMin - 40", "dataMax + 20"]} tickFormatter={formatNumber} />
            <Tooltip cursor={{ stroke: "var(--chart-axis)", strokeDasharray: "3 3" }} content={tooltip} />
            <Area
              type="monotone"
              dataKey={config.key}
              stroke={config.color}
              strokeWidth={2}
              fill={`url(#${fillId})`}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
              animationDuration={500}
            />
          </AreaChart>
        ) : (
          <BarChart
            responsive
            data={data}
            margin={CHART_MARGIN}
            style={{ width: "100%", height: "100%", minHeight: 260, flex: 1 }}
          >
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="label" {...AXIS_PROPS} minTickGap={16} />
            <YAxis {...AXIS_PROPS} width={48} allowDecimals={false} />
            <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.6 }} content={tooltip} />
            <Bar
              dataKey={config.key}
              fill={config.color}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              animationDuration={500}
            />
          </BarChart>
        )}
        <ChartDataTable caption={`${config.label} by period`} data={data} series={series} formatValue={formatNumber} />
      </figure>
    </Card>
  );
}
