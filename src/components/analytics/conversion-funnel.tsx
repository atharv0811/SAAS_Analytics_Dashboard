"use client";

import { useMemo } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMetricsDataset } from "@/hooks/use-metrics";
import { DATE_RANGES } from "@/lib/constants";
import { formatNumber, formatPercent } from "@/lib/format";
import { getFunnel } from "@/lib/metrics";
import { useFiltersStore } from "@/store/filters-store";

export function ConversionFunnel({ className }: { className?: string }) {
  const dataset = useMetricsDataset();
  const range = useFiltersStore((state) => state.range);
  const stages = useMemo(() => getFunnel(dataset, range), [dataset, range]);
  const top = stages[0].value;

  return (
    <Card className={className}>
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>Acquisition funnel</CardTitle>
        <CardDescription>{DATE_RANGES[range].label} · all plans</CardDescription>
      </CardHeader>
      <ol className="flex flex-1 flex-col justify-center gap-5 px-4 sm:px-6">
        {stages.map((stage, index) => {
          const ofTop = (stage.value / top) * 100;
          const ofPrevious = index === 0 ? 100 : (stage.value / stages[index - 1].value) * 100;
          // Bars use a square-root scale so the small final stages stay visible.
          const width = Math.max(Math.sqrt(ofTop / 100) * 100, 4);
          return (
            <li key={stage.id}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium">{stage.label}</span>
                <span className="tabular font-semibold">{formatNumber(stage.value)}</span>
              </div>
              <div className="mt-2 h-2.5 rounded-full bg-muted" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-chart-1 transition-[width] duration-500"
                  style={{ width: `${width}%`, opacity: 1 - index * 0.16 }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {index === 0
                  ? "Top of funnel"
                  : `${formatPercent(ofPrevious, 1)} of previous step · ${formatPercent(ofTop, 2)} of visitors`}
              </p>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
