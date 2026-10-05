"use client";

import { CalendarDays } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DATE_RANGES, DATE_RANGE_KEYS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { DateRangeKey } from "@/types";

interface DateRangePickerProps {
  value: DateRangeKey;
  onChange: (value: DateRangeKey) => void;
  className?: string;
}

function isDateRangeKey(value: string): value is DateRangeKey {
  return value in DATE_RANGES;
}

/** Preset reporting periods; ranges end on the most recent day of data. */
export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  return (
    <Select value={value} onValueChange={(next) => isDateRangeKey(next) && onChange(next)}>
      <SelectTrigger className={cn("min-w-40 bg-card", className)} aria-label="Reporting period">
        <CalendarDays className="text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        {DATE_RANGE_KEYS.map((key) => (
          <SelectItem key={key} value={key}>
            {DATE_RANGES[key].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
