"use client";

import { useMemo } from "react";
import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AXIS_PROPS,
  CHART_MARGIN,
  ChartDataTable,
  ChartLegend,
  ChartTooltip,
  GRID_PROPS,
  type SeriesConfig,
} from "@/components/charts/chart-primitives";
import { useMetricsDataset } from "@/hooks/use-metrics";
import { DATE_RANGES, DEFAULT_GRANULARITY } from "@/lib/constants";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import { getMrrMovementSeries } from "@/lib/metrics";
import { useFiltersStore } from "@/store/filters-store";

const SERIES: SeriesConfig[] = [
  { key: "newMrr", label: "New", color: "var(--chart-1)" },
  { key: "expansionMrr", label: "Expansion", color: "var(--chart-3)" },
  { key: "contractionMrr", label: "Contraction", color: "var(--chart-4)" },
  { key: "churnedMrr", label: "Churned", color: "var(--chart-2)" },
];

const NET_SERIES: SeriesConfig = { key: "netMrr", label: "Net new MRR", color: "var(--foreground)" };
const ALL_SERIES = [...SERIES, NET_SERIES];

export function MrrMovementsChart({ className }: { className?: string }) {
  const dataset = useMetricsDataset();
  const range = useFiltersStore((state) => state.range);
  const plan = useFiltersStore((state) => state.plan);

  const data = useMemo(
    () => getMrrMovementSeries(dataset, { range, plan, granularity: DEFAULT_GRANULARITY[range] }),
    [dataset, range, plan],
  );
  const net = data.reduce((sum, point) => sum + point.netMrr, 0);

  return (
    <Card className={className}>
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>MRR movements</CardTitle>
        <CardDescription>
          Where recurring revenue was won and lost · {DATE_RANGES[range].label.toLowerCase()}
        </CardDescription>
        <div className="flex flex-wrap items-baseline gap-2 pt-2">
          <span className="tabular text-2xl font-semibold tracking-tight">
            {net >= 0 ? "+" : "−"}
            {formatCurrency(Math.abs(net))}
          </span>
          <span className="text-xs text-muted-foreground">net new MRR</span>
        </div>
      </CardHeader>
      <div className="px-2 sm:px-4">
        <ChartLegend series={ALL_SERIES} className="mb-3 px-2" />
        <figure aria-label="MRR movements chart">
          <ComposedChart
            responsive
            data={data}
            margin={CHART_MARGIN}
            stackOffset="sign"
            style={{ width: "100%", height: 280 }}
          >
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="label" {...AXIS_PROPS} minTickGap={16} />
            <YAxis {...AXIS_PROPS} width={52} tickFormatter={formatCompactCurrency} />
            <ReferenceLine y={0} stroke="var(--chart-axis)" strokeOpacity={0.5} />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.6 }}
              content={<ChartTooltip series={ALL_SERIES} formatValue={(value) => formatCurrency(value)} />}
            />
            {SERIES.map((series) => (
              <Bar
                key={series.key}
                dataKey={series.key}
                stackId="mrr"
                fill={series.color}
                maxBarSize={28}
                animationDuration={500}
              />
            ))}
            <Line
              type="monotone"
              dataKey="netMrr"
              stroke="var(--foreground)"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3.5, strokeWidth: 2, stroke: "var(--card)" }}
              animationDuration={500}
            />
          </ComposedChart>
          <ChartDataTable
            caption="MRR movements by period"
            data={data}
            series={ALL_SERIES}
            formatValue={(value) => formatCurrency(value)}
          />
        </figure>
      </div>
    </Card>
  );
}
