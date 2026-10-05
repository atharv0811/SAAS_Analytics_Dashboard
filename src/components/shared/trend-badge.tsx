import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendBadgeProps {
  /** Percentage change, e.g. 12.4 for +12.4%. */
  change: number;
  /** When false (e.g. churn), a rise is shown as negative news. */
  higherIsBetter?: boolean;
  /** Render a percentage-point delta instead of a relative percentage. */
  unit?: "%" | "pp";
  className?: string;
}

/** Direction is conveyed by arrow, sign and screen-reader text, not colour alone. */
export function TrendBadge({ change, higherIsBetter = true, unit = "%", className }: TrendBadgeProps) {
  // Percentage points are small numbers, so they keep an extra decimal.
  const digits = unit === "pp" ? 2 : 1;
  const rounded = Number(change.toFixed(digits));
  const flat = rounded === 0;
  const up = rounded > 0;
  const good = flat ? null : up === higherIsBetter;
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  const label = `${up ? "+" : ""}${rounded.toFixed(digits)}${unit === "pp" ? " pp" : "%"}`;

  return (
    <span
      className={cn(
        "tabular inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium",
        good === null && "bg-neutral-soft text-muted-foreground",
        good === true && "bg-success-soft text-success",
        good === false && "bg-danger-soft text-danger",
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
      <span className="sr-only">{flat ? "no change" : up ? "increase" : "decrease"}</span>
    </span>
  );
}
