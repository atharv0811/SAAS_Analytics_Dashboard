"use client";

import type { TooltipContentProps } from "recharts";
import { cn } from "@/lib/utils";

/** Shared, recessive axis styling: muted labels, no axis or tick lines. */
export const AXIS_PROPS = {
  axisLine: false,
  tickLine: false,
  tick: { fill: "var(--chart-axis)", fontSize: 12 },
  tickMargin: 8,
} as const;

export const GRID_PROPS = {
  vertical: false,
  stroke: "var(--chart-grid)",
} as const;

export const CHART_MARGIN = { top: 8, right: 8, bottom: 0, left: 0 } as const;

export interface SeriesConfig {
  key: string;
  label: string;
  color: string;
  /** Render a dashed swatch, used for comparison series. */
  dashed?: boolean;
}

type ChartTooltipProps = Partial<TooltipContentProps<number, string>> & {
  series: SeriesConfig[];
  formatValue: (value: number) => string;
  /** Optional footer row computed from the hovered datum. */
  footer?: (datum: Record<string, unknown>) => React.ReactNode;
};

/** Tooltip rendered in HTML: values in text ink, identity from the swatch. */
export function ChartTooltip({ active, payload, series, formatValue, footer }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const datum = payload[0].payload as Record<string, unknown>;
  const rows = series.filter((item) => typeof datum[item.key] === "number");

  return (
    <div className="min-w-44 rounded-lg border bg-popover px-3 py-2.5 text-xs text-popover-foreground shadow-lg">
      <p className="mb-1.5 font-medium">{String(datum.fullLabel ?? datum.label ?? "")}</p>
      <ul className="space-y-1">
        {rows.map((item) => (
          <li key={item.key} className="flex items-center gap-2">
            <SeriesSwatch color={item.color} dashed={item.dashed} />
            <span className="text-muted-foreground">{item.label}</span>
            <span className="tabular ml-auto pl-3 font-medium">{formatValue(Math.abs(datum[item.key] as number))}</span>
          </li>
        ))}
      </ul>
      {footer && <div className="mt-1.5 border-t pt-1.5">{footer(datum)}</div>}
    </div>
  );
}

function SeriesSwatch({ color, dashed }: { color: string; dashed?: boolean }) {
  return dashed ? (
    <span className="h-0 w-3 shrink-0 border-t-2 border-dashed" style={{ borderColor: color }} aria-hidden="true" />
  ) : (
    <span className="size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: color }} aria-hidden="true" />
  );
}

export function ChartLegend({ series, className }: { series: SeriesConfig[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground", className)}>
      {series.map((item) => (
        <li key={item.key} className="flex items-center gap-1.5">
          <SeriesSwatch color={item.color} dashed={item.dashed} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

/** Visually hidden table so screen-reader users get the numbers behind a chart. */
export function ChartDataTable<T extends { fullLabel: string }>({
  caption,
  data,
  series,
  formatValue,
}: {
  caption: string;
  data: T[];
  series: SeriesConfig[];
  formatValue: (value: number) => string;
}) {
  return (
    // Wrapped in a div: tables ignore the 1px width that sr-only relies on.
    <div className="sr-only">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            {series.map((item) => (
              <th key={item.key} scope="col">
                {item.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.fullLabel}>
              <th scope="row">{row.fullLabel}</th>
              {series.map((item) => (
                <td key={item.key}>{formatValue(Number((row as Record<string, unknown>)[item.key] ?? 0))}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
