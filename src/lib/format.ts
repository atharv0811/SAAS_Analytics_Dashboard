import type { MetricFormat } from "@/types";

/*
 * All formatters pin the locale and time zone so server and client output
 * match exactly and hydration never diverges.
 */
const LOCALE = "en-US";
const TIME_ZONE = "UTC";

const currency = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const currencyPrecise = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactCurrency = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const integer = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });

const shortDate = new Intl.DateTimeFormat(LOCALE, {
  month: "short",
  day: "numeric",
  timeZone: TIME_ZONE,
});

const mediumDate = new Intl.DateTimeFormat(LOCALE, {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const monthYear = new Intl.DateTimeFormat(LOCALE, {
  month: "short",
  year: "2-digit",
  timeZone: TIME_ZONE,
});

const dateTime = new Intl.DateTimeFormat(LOCALE, {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

const time = new Intl.DateTimeFormat(LOCALE, {
  hour: "numeric",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

export function formatCurrency(value: number, options?: { precise?: boolean }) {
  return options?.precise ? currencyPrecise.format(value) : currency.format(value);
}

export function formatCompactCurrency(value: number) {
  return compactCurrency.format(value);
}

export function formatNumber(value: number) {
  return integer.format(value);
}

export function formatPercent(value: number, fractionDigits = 2) {
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatMetric(value: number, format: MetricFormat) {
  switch (format) {
    case "currency":
      // Small amounts such as ARPU need cents to show meaningful movement.
      return formatCurrency(value, { precise: Math.abs(value) < 100 });
    case "percent":
      return formatPercent(value);
    default:
      return formatNumber(value);
  }
}

export function formatShortDate(iso: string) {
  return shortDate.format(new Date(iso));
}

export function formatDate(iso: string) {
  return mediumDate.format(new Date(iso));
}

export function formatMonthYear(iso: string) {
  return monthYear.format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return dateTime.format(new Date(iso));
}

export function formatTime(iso: string) {
  return time.format(new Date(iso));
}

/** Relative time against the fixed demo reference instant. */
export function formatRelativeTime(iso: string, now: Date) {
  const diffMinutes = Math.round((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatShortDate(iso);
}

/** Percentage change between two values, safe for a zero baseline. */
export function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
