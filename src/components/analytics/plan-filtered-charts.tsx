"use client";

import { PLANS } from "@/data/plans";
import { CustomerGrowthChart } from "@/components/dashboard/customer-growth-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { useFiltersStore } from "@/store/filters-store";

/** Dashboard charts re-used on Analytics, scoped to the selected plan segment. */
export function PlanFilteredRevenue() {
  const plan = useFiltersStore((state) => state.plan);
  const title = plan === "all" ? "Revenue" : `${PLANS[plan].name} revenue`;
  return <RevenueChart plan={plan} title={title} className="xl:col-span-2" />;
}

export function PlanFilteredCustomers() {
  const plan = useFiltersStore((state) => state.plan);
  return <CustomerGrowthChart plan={plan} className="xl:col-span-2" />;
}
