import { Card } from "@/components/ui/card";
import { ChartCardSkeleton, KpiGridSkeleton, PageHeaderSkeleton, TableSkeleton } from "@/components/shared/skeletons";

export default function DashboardLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard">
      <PageHeaderSkeleton />
      <KpiGridSkeleton />
      <div className="grid gap-6 xl:grid-cols-3">
        <ChartCardSkeleton className="xl:col-span-2" />
        <ChartCardSkeleton />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <ChartCardSkeleton height={260} className="xl:col-span-2" />
        <ChartCardSkeleton height={260} />
      </div>
      <Card className="gap-0 py-0">
        <TableSkeleton rows={6} />
      </Card>
    </div>
  );
}
