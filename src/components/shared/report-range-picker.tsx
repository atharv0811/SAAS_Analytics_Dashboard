"use client";

import { DateRangePicker } from "@/components/shared/date-range-picker";
import { useReportRange } from "@/hooks/use-metrics";

/** Page-level period picker bound to the report range shared across pages. */
export function ReportRangePicker() {
  const [range, setRange] = useReportRange();
  return <DateRangePicker value={range} onChange={setRange} />;
}
