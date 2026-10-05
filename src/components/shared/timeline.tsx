import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/types";

const TONE_DOT: Record<TimelineEvent["tone"], string> = {
  default: "bg-muted-foreground/40",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px before:bg-border">
      {events.map((event) => (
        <li key={event.id} className="relative flex gap-3 pl-0">
          <span
            className={cn(
              "relative mt-1.5 size-[11px] shrink-0 rounded-full ring-4 ring-popover",
              TONE_DOT[event.tone],
            )}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="text-sm font-medium">{event.title}</p>
              <time dateTime={event.timestamp} className="text-xs text-muted-foreground">
                {formatDateTime(event.timestamp)}
              </time>
            </div>
            <p className="text-xs text-muted-foreground">{event.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
