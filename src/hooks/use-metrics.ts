"use client";

import { getMetricsDataset } from "@/data/metrics";
import { useFiltersStore } from "@/store/filters-store";

/**
 * Access point for the metrics dataset. The mock is generated
 * deterministically in the browser (it is far smaller as code than as
 * serialised JSON); a real implementation would fetch aggregated series here.
 */
export function useMetricsDataset() {
  return getMetricsDataset();
}

export function useReportRange() {
  const range = useFiltersStore((state) => state.range);
  const setRange = useFiltersStore((state) => state.setRange);
  return [range, setRange] as const;
}
