import type { Metadata } from "next";
import { CustomerGrowthChart } from "@/components/dashboard/customer-growth-chart";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentCustomers } from "@/components/dashboard/recent-customers";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { RevenueByPlan } from "@/components/dashboard/revenue-by-plan";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { PageHeader } from "@/components/shared/page-header";
import { ReportRangePicker } from "@/components/shared/report-range-picker";
import { getCurrentUser, getRecentCustomers, getRecentTransactions } from "@/services";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const [user, recentTransactions, recentCustomers] = await Promise.all([
    getCurrentUser(),
    getRecentTransactions(6),
    getRecentCustomers(5),
  ]);
  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good morning, ${firstName}`}
        description="Here's what's happening with your business today."
        actions={<ReportRangePicker />}
      />
      <DashboardStats />
      <div className="grid gap-6 xl:grid-cols-3">
        <RevenueChart className="xl:col-span-2" />
        <RevenueByPlan />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <CustomerGrowthChart className="xl:col-span-2" />
        <RecentCustomers customers={recentCustomers} />
      </div>
      <RecentTransactions transactions={recentTransactions} />
    </div>
  );
}
