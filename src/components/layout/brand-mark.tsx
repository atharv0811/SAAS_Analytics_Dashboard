import { cn } from "@/lib/utils";

/** MetricFlow logomark: three ascending bars joined by a flow line. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-[18px]">
        <rect x="4" y="13" width="3.2" height="7" rx="1.2" fill="currentColor" opacity="0.55" />
        <rect x="10.4" y="9.5" width="3.2" height="10.5" rx="1.2" fill="currentColor" opacity="0.75" />
        <rect x="16.8" y="5" width="3.2" height="15" rx="1.2" fill="currentColor" />
        <path
          d="M4.5 9.5 10 6.5l4 1.8L20 3.6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
