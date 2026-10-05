import { ChartCardSkeleton, KpiGridSkeleton, PageHeaderSkeleton } from "@/components/shared/skeletons";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading analytics">
      <PageHeaderSkeleton />
      <KpiGridSkeleton count={8} withSparkline />
      <div className="grid gap-6 xl:grid-cols-3">
        <ChartCardSkeleton className="xl:col-span-2" />
        <ChartCardSkeleton />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <ChartCardSkeleton height={280} className="xl:col-span-2" />
        <ChartCardSkeleton height={220} />
      </div>
    </div>
  );
}
