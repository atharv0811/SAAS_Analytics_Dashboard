"use client";

import { useMemo } from "react";
import { CircleDollarSign, Gauge, Repeat, Target, TrendingUp, UserMinus, UserPlus, Users } from "lucide-react";
import { KpiCard } from "@/components/shared/kpi-card";
import { useMetricsDataset } from "@/hooks/use-metrics";
import { DATE_RANGES } from "@/lib/constants";
import { getMetrics, getSparkline, type MetricId } from "@/lib/metrics";
import { useFiltersStore } from "@/store/filters-store";

const ANALYTICS_KPIS: { id: MetricId; icon: typeof Users }[] = [
  { id: "revenue", icon: CircleDollarSign },
  { id: "mrr", icon: Repeat },
  { id: "arr", icon: TrendingUp },
  { id: "arpu", icon: Gauge },
  { id: "activeCustomers", icon: Users },
  { id: "newCustomers", icon: UserPlus },
  { id: "churnRate", icon: UserMinus },
  { id: "conversionRate", icon: Target },
];

export function AnalyticsKpis() {
  const dataset = useMetricsDataset();
  const range = useFiltersStore((state) => state.range);
  const plan = useFiltersStore((state) => state.plan);

  const cards = useMemo(() => {
    const metrics = getMetrics(dataset, range, plan);
    return ANALYTICS_KPIS.map(({ id, icon }) => ({
      metric: metrics[id],
      icon,
      sparkline: getSparkline(dataset, id, range, plan),
    }));
  }, [dataset, range, plan]);

  const comparison = `previous ${DATE_RANGES[range].label.replace("Last ", "")}`;

  return (
    <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ metric, icon, sparkline }) => (
        <KpiCard key={metric.id} metric={metric} icon={icon} sparkline={sparkline} comparisonLabel={comparison} />
      ))}
    </section>
  );
}
