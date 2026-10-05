import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/*
 * Skeletons mirror the real layouts' geometry so content doesn't jump when it
 * arrives. Route-level `loading.tsx` files compose these.
 */

export function PageHeaderSkeleton({ withActions = true }: { withActions?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      {withActions && <Skeleton className="h-8 w-40" />}
    </div>
  );
}

export function KpiCardSkeleton({ withSparkline = false }: { withSparkline?: boolean }) {
  return (
    <Card className="gap-0 px-4 py-4 sm:px-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="size-8 rounded-lg" />
      </div>
      <Skeleton className="mt-3 h-7 w-32" />
      <Skeleton className="mt-3 h-4 w-40" />
      {withSparkline && <Skeleton className="mt-3 h-9 w-full" />}
    </Card>
  );
}

export function KpiGridSkeleton({ count = 4, withSparkline }: { count?: number; withSparkline?: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <KpiCardSkeleton key={index} withSparkline={withSparkline} />
      ))}
    </div>
  );
}

export function ChartCardSkeleton({ height = 300, className }: { height?: number; className?: string }) {
  return (
    <Card className={cn("gap-5 px-4 py-5 sm:px-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>
      <Skeleton className="w-full" style={{ height }} />
    </Card>
  );
}

export function TableSkeleton({ rows = 8, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="divide-y" aria-hidden="true">
      <div className="flex gap-4 px-4 py-3">
        {Array.from({ length: columns }, (_, index) => (
          <Skeleton key={index} className="h-3.5 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex items-center gap-4 px-4 py-3.5">
          <div className="flex flex-1 items-center gap-2.5">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          {Array.from({ length: columns - 1 }, (_, column) => (
            <Skeleton key={column} className="h-3.5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function TablePageSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-6" role="status" aria-label={label}>
      <PageHeaderSkeleton />
      <Card className="gap-0 py-0">
        <div className="flex flex-wrap gap-2 border-b p-4">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>
        <TableSkeleton />
      </Card>
    </div>
  );
}
