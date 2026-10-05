import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row" role="status" aria-label="Loading settings">
      <div className="flex gap-2 lg:w-52 lg:flex-col">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-9 w-28 lg:w-full" />
        ))}
      </div>
      <Card className="flex-1 gap-5 px-6 py-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-72 max-w-full" />
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
