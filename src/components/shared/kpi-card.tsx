import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/shared/sparkline";
import { TrendBadge } from "@/components/shared/trend-badge";
import { formatMetric, percentChange } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AnalyticsMetric } from "@/types";

interface KpiCardProps {
  metric: AnalyticsMetric;
  icon: LucideIcon;
  comparisonLabel: string;
  sparkline?: number[];
  className?: string;
}

export function KpiCard({ metric, icon: Icon, comparisonLabel, sparkline, className }: KpiCardProps) {
  // Rates compare in percentage points; everything else as relative change.
  const isRate = metric.format === "percent";
  const change = isRate ? metric.value - metric.previousValue : percentChange(metric.value, metric.previousValue);

  return (
    <Card className={cn("gap-0 px-4 py-4 sm:px-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">{metric.label}</h3>
        <span className="flex size-8 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="tabular mt-2 text-[26px] leading-tight font-semibold tracking-tight">
        {formatMetric(metric.value, metric.format)}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <TrendBadge change={change} higherIsBetter={metric.higherIsBetter} unit={isRate ? "pp" : "%"} />
        <span>
          vs. {formatMetric(metric.previousValue, metric.format)} {comparisonLabel}
        </span>
      </div>
      {sparkline && <Sparkline values={sparkline} className="mt-3" />}
    </Card>
  );
}
