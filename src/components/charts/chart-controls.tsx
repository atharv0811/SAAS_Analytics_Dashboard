"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DATE_RANGES, DATE_RANGE_KEYS, DEFAULT_GRANULARITY, GRANULARITY_LABELS } from "@/lib/constants";
import type { DateRangeKey, Granularity } from "@/types";

export function RangeToggle({ value, onChange }: { value: DateRangeKey; onChange: (value: DateRangeKey) => void }) {
  return (
    <ToggleGroup
      type="single"
      size="sm"
      variant="outline"
      spacing={0}
      value={value}
      onValueChange={(next) => next && onChange(next as DateRangeKey)}
      aria-label="Chart range"
      className="rounded-lg bg-card"
    >
      {DATE_RANGE_KEYS.map((key) => (
        <ToggleGroupItem
          key={key}
          value={key}
          aria-label={DATE_RANGES[key].label}
          className="px-2.5 text-xs data-[state=on]:bg-muted data-[state=on]:font-semibold data-[state=on]:text-foreground"
        >
          {DATE_RANGES[key].shortLabel}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export function GranularitySelect({
  range,
  value,
  onChange,
}: {
  range: DateRangeKey;
  value: Granularity;
  onChange: (value: Granularity) => void;
}) {
  const options = DATE_RANGES[range].granularities;
  return (
    <Select value={value} onValueChange={(next) => onChange(next as Granularity)} disabled={options.length === 1}>
      <SelectTrigger size="sm" className="min-w-26 bg-card text-xs" aria-label="Chart granularity">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {GRANULARITY_LABELS[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Keeps a user's granularity choice while it's valid for the current range. */
export function resolveGranularity(range: DateRangeKey, preferred: Granularity | null): Granularity {
  return preferred && DATE_RANGES[range].granularities.includes(preferred) ? preferred : DEFAULT_GRANULARITY[range];
}
