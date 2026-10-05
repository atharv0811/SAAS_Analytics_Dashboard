import type { DateRangeKey, Granularity } from "@/types";

/**
 * Mock data is generated relative to a fixed date so that server and client
 * renders are deterministic and the demo always tells the same story.
 */
export const REFERENCE_DATE = "2026-10-05";

export const DATE_RANGES: Record<
  DateRangeKey,
  { label: string; shortLabel: string; days: number; granularities: Granularity[] }
> = {
  "7d": { label: "Last 7 days", shortLabel: "7D", days: 7, granularities: ["daily"] },
  "30d": { label: "Last 30 days", shortLabel: "30D", days: 30, granularities: ["daily", "weekly"] },
  "90d": { label: "Last 90 days", shortLabel: "90D", days: 90, granularities: ["daily", "weekly"] },
  "12m": { label: "Last 12 months", shortLabel: "12M", days: 365, granularities: ["weekly", "monthly"] },
};

export const DATE_RANGE_KEYS = Object.keys(DATE_RANGES) as DateRangeKey[];

export const DEFAULT_GRANULARITY: Record<DateRangeKey, Granularity> = {
  "7d": "daily",
  "30d": "daily",
  "90d": "weekly",
  "12m": "monthly",
};

export const GRANULARITY_LABELS: Record<Granularity, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

/** localStorage key for persisted preferences, also read by the pre-paint script. */
export const PREFERENCES_STORAGE_KEY = "metricflow-preferences";
