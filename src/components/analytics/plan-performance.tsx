"use client";

import { useMemo } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlanBadge } from "@/components/shared/plan-badge";
import { TrendBadge } from "@/components/shared/trend-badge";
import { useMetricsDataset } from "@/hooks/use-metrics";
import { PLAN_IDS } from "@/data/plans";
import { DATE_RANGES } from "@/lib/constants";
import { formatCurrency, formatNumber, formatPercent, percentChange } from "@/lib/format";
import { getMetrics } from "@/lib/metrics";
import { cn } from "@/lib/utils";
import { useFiltersStore } from "@/store/filters-store";

export function PlanPerformance() {
  const dataset = useMetricsDataset();
  const range = useFiltersStore((state) => state.range);
  const selectedPlan = useFiltersStore((state) => state.plan);

  const rows = useMemo(
    () => PLAN_IDS.map((plan) => ({ plan, metrics: getMetrics(dataset, range, plan) })),
    [dataset, range],
  );

  return (
    <Card className="gap-0 pb-0">
      <CardHeader className="border-b px-4 sm:px-6">
        <CardTitle>Plan performance</CardTitle>
        <CardDescription>
          Revenue, growth and retention by tier · {DATE_RANGES[range].label.toLowerCase()}
        </CardDescription>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4 sm:pl-6">Plan</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">MRR</TableHead>
            <TableHead className="text-right">MRR growth</TableHead>
            <TableHead className="text-right">Customers</TableHead>
            <TableHead className="text-right">New</TableHead>
            <TableHead className="text-right">ARPU</TableHead>
            <TableHead className="pr-4 text-right sm:pr-6">Churn</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ plan, metrics }) => (
            <TableRow
              key={plan}
              data-state={selectedPlan === plan ? "selected" : undefined}
              className={cn(selectedPlan !== "all" && selectedPlan !== plan && "opacity-55")}
            >
              <TableCell className="pl-4 sm:pl-6">
                <PlanBadge plan={plan} />
              </TableCell>
              <TableCell className="tabular text-right font-medium">{formatCurrency(metrics.revenue.value)}</TableCell>
              <TableCell className="tabular text-right">{formatCurrency(metrics.mrr.value)}</TableCell>
              <TableCell className="text-right">
                <TrendBadge change={percentChange(metrics.mrr.value, metrics.mrr.previousValue)} />
              </TableCell>
              <TableCell className="tabular text-right">{formatNumber(metrics.activeCustomers.value)}</TableCell>
              <TableCell className="tabular text-right text-muted-foreground">
                {formatNumber(metrics.newCustomers.value)}
              </TableCell>
              <TableCell className="tabular text-right">
                {formatCurrency(metrics.arpu.value, { precise: true })}
              </TableCell>
              <TableCell className="tabular pr-4 text-right sm:pr-6">
                {formatPercent(metrics.churnRate.value)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
