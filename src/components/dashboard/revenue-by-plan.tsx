"use client";

import { useMemo } from "react";
import { Pie, PieChart, Tooltip } from "recharts";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMetricsDataset } from "@/hooks/use-metrics";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { getPlanBreakdown } from "@/lib/metrics";
import type { PlanBreakdownItem, PlanId } from "@/types";

export const PLAN_COLORS: Record<PlanId, string> = {
  starter: "var(--chart-1)",
  professional: "var(--chart-2)",
  business: "var(--chart-3)",
  enterprise: "var(--chart-4)",
};

function PlanTooltip({ active, payload }: { active?: boolean; payload?: { payload: PlanBreakdownItem }[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-medium">{item.name}</p>
      <p className="mt-0.5 text-muted-foreground">
        {formatCurrency(item.revenue)} MRR · {formatPercent(item.share, 1)}
      </p>
    </div>
  );
}

export function RevenueByPlan({ className }: { className?: string }) {
  const dataset = useMetricsDataset();
  const plans = useMemo(() => getPlanBreakdown(dataset), [dataset]);
  const totalMrr = plans.reduce((sum, plan) => sum + plan.revenue, 0);
  const chartData = plans.map((plan) => ({ ...plan, fill: PLAN_COLORS[plan.plan] }));

  return (
    <Card className={className}>
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>Revenue by plan</CardTitle>
        <CardDescription>Current MRR split across subscription tiers</CardDescription>
      </CardHeader>
      <div className="flex flex-1 flex-col gap-5 px-4 sm:px-6">
        <figure className="relative mx-auto size-44" aria-label="MRR share by plan">
          <PieChart responsive style={{ width: "100%", height: "100%" }}>
            <Pie
              data={chartData}
              dataKey="revenue"
              nameKey="name"
              innerRadius="70%"
              outerRadius="100%"
              paddingAngle={2}
              cornerRadius={4}
              stroke="var(--card)"
              strokeWidth={2}
              animationDuration={500}
            />
            <Tooltip content={<PlanTooltip />} />
          </PieChart>
          <figcaption className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground">Total MRR</span>
            <span className="tabular text-lg font-semibold tracking-tight">{formatCurrency(totalMrr)}</span>
          </figcaption>
        </figure>

        <table className="w-full text-sm">
          <caption className="sr-only">Revenue by plan</caption>
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th scope="col" className="pb-2 font-medium">
                Plan
              </th>
              <th scope="col" className="pb-2 text-right font-medium">
                Customers
              </th>
              <th scope="col" className="pb-2 text-right font-medium">
                MRR
              </th>
              <th scope="col" className="pb-2 text-right font-medium">
                Share
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {plans.map((plan) => (
              <tr key={plan.plan}>
                <th scope="row" className="py-2.5 text-left font-medium">
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-[3px]"
                      style={{ backgroundColor: PLAN_COLORS[plan.plan] }}
                      aria-hidden="true"
                    />
                    {plan.name}
                  </span>
                </th>
                <td className="tabular py-2.5 text-right text-muted-foreground">{formatNumber(plan.customers)}</td>
                <td className="tabular py-2.5 text-right">{formatCurrency(plan.revenue)}</td>
                <td className="tabular py-2.5 text-right text-muted-foreground">{formatPercent(plan.share, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
