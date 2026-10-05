import type { Metadata } from "next";
import { AnalyticsKpis } from "@/components/analytics/analytics-kpis";
import { AnalyticsToolbar } from "@/components/analytics/analytics-toolbar";
import { ConversionFunnel } from "@/components/analytics/conversion-funnel";
import { ArpuTrend, ChurnTrend, ConversionTrend, MrrTrend } from "@/components/analytics/metric-trends";
import { MrrMovementsChart } from "@/components/analytics/mrr-movements-chart";
import { PlanFilteredCustomers, PlanFilteredRevenue } from "@/components/analytics/plan-filtered-charts";
import { PlanPerformance } from "@/components/analytics/plan-performance";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Analytics",
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Revenue, retention and acquisition performance across your subscription business."
        actions={<AnalyticsToolbar />}
      />
      <AnalyticsKpis />

      <div className="grid gap-6 xl:grid-cols-3">
        <PlanFilteredRevenue />
        <ConversionFunnel />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <MrrMovementsChart className="xl:col-span-2" />
        <MrrTrend />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <PlanFilteredCustomers />
        <ChurnTrend />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ArpuTrend />
        <ConversionTrend />
      </div>
      <PlanPerformance />
    </div>
  );
}
