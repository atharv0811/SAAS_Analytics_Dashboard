"use client";

import { useMemo } from "react";
import { CircleDollarSign, Repeat, Target, Users } from "lucide-react";
import { KpiCard } from "@/components/shared/kpi-card";
import { useMetricsDataset, useReportRange } from "@/hooks/use-metrics";
import { DATE_RANGES } from "@/lib/constants";
import { getMetrics, type MetricId } from "@/lib/metrics";

const DASHBOARD_KPIS: { id: MetricId; icon: typeof Users }[] = [
  { id: "revenue", icon: CircleDollarSign },
  { id: "mrr", icon: Repeat },
  { id: "activeCustomers", icon: Users },
  { id: "conversionRate", icon: Target },
];

export function DashboardStats() {
  const dataset = useMetricsDataset();
  const [range] = useReportRange();
  const metrics = useMemo(() => getMetrics(dataset, range), [dataset, range]);
  const comparison = `previous ${DATE_RANGES[range].label.replace("Last ", "")}`;

  return (
    <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {DASHBOARD_KPIS.map(({ id, icon }) => (
        <KpiCard key={id} metric={metrics[id]} icon={icon} comparisonLabel={comparison} />
      ))}
    </section>
  );
}
