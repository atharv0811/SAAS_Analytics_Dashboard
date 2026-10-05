"use client";

import { useMemo } from "react";
import { TrendChart } from "@/components/analytics/trend-chart";
import { useMetricsDataset } from "@/hooks/use-metrics";
import { DATE_RANGES, DEFAULT_GRANULARITY } from "@/lib/constants";
import { formatCompactCurrency, formatCurrency, formatPercent } from "@/lib/format";
import { getArpuSeries, getChurnRateSeries, getConversionSeries, getMrrSeries, type SeriesQuery } from "@/lib/metrics";
import { useFiltersStore } from "@/store/filters-store";

function useSeriesQuery(): SeriesQuery {
  const range = useFiltersStore((state) => state.range);
  const plan = useFiltersStore((state) => state.plan);
  return useMemo(() => ({ range, plan, granularity: DEFAULT_GRANULARITY[range] }), [range, plan]);
}

function rangeLabel(query: SeriesQuery) {
  return DATE_RANGES[query.range].label.toLowerCase();
}

export function MrrTrend({ className }: { className?: string }) {
  const dataset = useMetricsDataset();
  const query = useSeriesQuery();
  const data = useMemo(() => getMrrSeries(dataset, query), [dataset, query]);
  return (
    <TrendChart
      className={className}
      title="MRR growth"
      description={`Monthly recurring revenue, ${rangeLabel(query)}`}
      data={data}
      seriesLabel="MRR"
      formatValue={(value) => formatCurrency(value)}
      formatTick={formatCompactCurrency}
    />
  );
}

export function ChurnTrend({ className }: { className?: string }) {
  const dataset = useMetricsDataset();
  const query = useSeriesQuery();
  const data = useMemo(() => getChurnRateSeries(dataset, query), [dataset, query]);
  return (
    <TrendChart
      className={className}
      title="Churn rate"
      description="Rolling 30-day customer churn"
      data={data}
      seriesLabel="Churn rate"
      color="var(--chart-2)"
      formatValue={(value) => formatPercent(value)}
      formatTick={(value) => `${value.toFixed(1)}%`}
      isRate
      higherIsBetter={false}
    />
  );
}

export function ArpuTrend({ className }: { className?: string }) {
  const dataset = useMetricsDataset();
  const query = useSeriesQuery();
  const data = useMemo(() => getArpuSeries(dataset, query), [dataset, query]);
  return (
    <TrendChart
      className={className}
      title="Average revenue per user"
      description="MRR divided by active customers"
      data={data}
      seriesLabel="ARPU"
      color="var(--chart-3)"
      formatValue={(value) => formatCurrency(value, { precise: true })}
      formatTick={(value) => `$${value.toFixed(2)}`}
    />
  );
}

export function ConversionTrend({ className }: { className?: string }) {
  const dataset = useMetricsDataset();
  const range = useFiltersStore((state) => state.range);
  const data = useMemo(
    () => getConversionSeries(dataset, { range, granularity: DEFAULT_GRANULARITY[range] }),
    [dataset, range],
  );
  return (
    <TrendChart
      className={className}
      title="Conversion rate"
      description="Visitor to trial sign-up · all plans"
      data={data}
      seriesLabel="Conversion rate"
      color="var(--chart-5)"
      formatValue={(value) => formatPercent(value)}
      formatTick={(value) => `${value.toFixed(1)}%`}
      isRate
    />
  );
}
