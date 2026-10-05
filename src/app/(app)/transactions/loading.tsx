import { Card } from "@/components/ui/card";
import { KpiGridSkeleton, PageHeaderSkeleton, TableSkeleton } from "@/components/shared/skeletons";

export default function TransactionsLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading transactions">
      <PageHeaderSkeleton />
      <KpiGridSkeleton />
      <Card className="gap-0 py-0">
        <TableSkeleton />
      </Card>
    </div>
  );
}
