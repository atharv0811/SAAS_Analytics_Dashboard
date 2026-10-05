"use client";

import { Download, Layers } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportRangePicker } from "@/components/shared/report-range-picker";
import { useMetricsDataset } from "@/hooks/use-metrics";
import { PLANS, PLAN_IDS } from "@/data/plans";
import { DATE_RANGES } from "@/lib/constants";
import { downloadCsv } from "@/lib/csv";
import { getMetrics } from "@/lib/metrics";
import { useFiltersStore } from "@/store/filters-store";
import type { PlanFilter } from "@/types";

export function AnalyticsToolbar() {
  const dataset = useMetricsDataset();
  const range = useFiltersStore((state) => state.range);
  const plan = useFiltersStore((state) => state.plan);
  const setPlan = useFiltersStore((state) => state.setPlan);

  const handleExport = () => {
    const metrics = Object.values(getMetrics(dataset, range, plan));
    downloadCsv(
      `metricflow-${plan}-${range}.csv`,
      metrics.map((metric) => ({
        metric: metric.label,
        value: Number(metric.value.toFixed(2)),
        previous_period: Number(metric.previousValue.toFixed(2)),
      })),
    );
    toast.success("Report exported", {
      description: `${DATE_RANGES[range].label} · ${plan === "all" ? "All plans" : PLANS[plan].name}`,
    });
  };

  return (
    <>
      <Select value={plan} onValueChange={(value) => setPlan(value as PlanFilter)}>
        <SelectTrigger className="min-w-36 bg-card" aria-label="Plan segment">
          <Layers className="text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" align="end">
          <SelectItem value="all">All plans</SelectItem>
          {PLAN_IDS.map((id) => (
            <SelectItem key={id} value={id}>
              {PLANS[id].name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ReportRangePicker />
      <Button variant="outline" className="bg-card" onClick={handleExport}>
        <Download />
        Export
      </Button>
    </>
  );
}
