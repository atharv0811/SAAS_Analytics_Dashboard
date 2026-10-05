import { PLANS } from "@/data/plans";
import { cn } from "@/lib/utils";
import type { PlanId } from "@/types";

const PLAN_DOT: Record<PlanId, string> = {
  starter: "bg-chart-1",
  professional: "bg-chart-2",
  business: "bg-chart-3",
  enterprise: "bg-chart-4",
};

export function PlanBadge({ plan, className }: { plan: PlanId; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md border bg-background px-2 text-xs font-medium whitespace-nowrap",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", PLAN_DOT[plan])} aria-hidden="true" />
      {PLANS[plan].name}
    </span>
  );
}
