import { REFERENCE_DATE } from "@/lib/constants";

const DAY_MS = 86_400_000;

/** Parses a YYYY-MM-DD string as a UTC midnight date. */
export function parseDay(day: string) {
  return new Date(`${day}T00:00:00Z`);
}

export function toDayString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(day: string, amount: number) {
  return toDayString(new Date(parseDay(day).getTime() + amount * DAY_MS));
}

export function daysBetween(from: string, to: string) {
  return Math.round((parseDay(to).getTime() - parseDay(from).getTime()) / DAY_MS);
}

/** Monday-based start of week for a YYYY-MM-DD string. */
export function startOfWeek(day: string) {
  const weekday = (parseDay(day).getUTCDay() + 6) % 7;
  return addDays(day, -weekday);
}

export function startOfMonth(day: string) {
  return `${day.slice(0, 7)}-01`;
}

/** The demo's "now": 9:41 AM UTC on the reference date. */
export function getReferenceNow() {
  return new Date(`${REFERENCE_DATE}T09:41:00Z`);
}
