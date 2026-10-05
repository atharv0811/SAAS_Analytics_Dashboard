import { DATE_RANGES, REFERENCE_DATE } from "@/lib/constants";
import { addDays, parseDay } from "@/lib/dates";
import { PLANS, PLAN_IDS } from "@/data/plans";
import type {
  AnalyticsMetric,
  CustomerPoint,
  DateRangeKey,
  FunnelStage,
  Granularity,
  MetricsDataset,
  MrrMovementPoint,
  PlanBreakdownItem,
  PlanDailyMetrics,
  PlanFilter,
  RevenuePoint,
  SeriesPoint,
  ValuePoint,
} from "@/types";

const DAYS_PER_MONTH = 30.42;

/* ------------------------------------------------------------------------ */
/* Day-indexed access                                                        */
/* ------------------------------------------------------------------------ */

interface DailyIndex {
  days: PlanDailyMetrics[];
  byDate: Map<string, number>;
}

const combinedCache = new WeakMap<MetricsDataset, Map<PlanFilter, DailyIndex>>();

/** Daily metrics for one plan, or summed across all plans. Memoised per dataset. */
function getDaily(dataset: MetricsDataset, plan: PlanFilter): DailyIndex {
  let byPlan = combinedCache.get(dataset);
  if (!byPlan) {
    byPlan = new Map();
    combinedCache.set(dataset, byPlan);
  }
  const cached = byPlan.get(plan);
  if (cached) return cached;

  const source = plan === "all" ? PLAN_IDS.map((id) => dataset.plans[id]) : [dataset.plans[plan]];
  const days = source[0].map((first, index) => {
    const total: PlanDailyMetrics = { ...first };
    for (const series of source.slice(1)) {
      const day = series[index];
      total.revenue += day.revenue;
      total.mrr += day.mrr;
      total.newMrr += day.newMrr;
      total.expansionMrr += day.expansionMrr;
      total.contractionMrr += day.contractionMrr;
      total.churnedMrr += day.churnedMrr;
      total.activeCustomers += day.activeCustomers;
      total.newCustomers += day.newCustomers;
      total.reactivatedCustomers += day.reactivatedCustomers;
      total.churnedCustomers += day.churnedCustomers;
    }
    return total;
  });

  const index: DailyIndex = {
    days,
    byDate: new Map(days.map((day, position) => [day.date, position])),
  };
  byPlan.set(plan, index);
  return index;
}

function daysIn(index: DailyIndex, start: string, end: string) {
  const from = index.byDate.get(start) ?? 0;
  const to = index.byDate.get(end) ?? index.days.length - 1;
  return index.days.slice(from, to + 1);
}

function dayAt(index: DailyIndex, date: string) {
  return index.days[index.byDate.get(date) ?? 0];
}

type NumericKey<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T];

function sum<T>(rows: T[], key: NumericKey<T>) {
  return rows.reduce((total, row) => total + (row[key] as number), 0);
}

/* ------------------------------------------------------------------------ */
/* Buckets                                                                   */
/* ------------------------------------------------------------------------ */

interface Bucket {
  start: string;
  end: string;
  previousStart: string;
  previousEnd: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function dayLabel(day: string) {
  const date = parseDay(day);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

function bucketLabels(bucket: Bucket, granularity: Granularity): Omit<SeriesPoint, "date"> {
  const start = parseDay(bucket.start);
  if (granularity === "monthly") {
    return {
      label: MONTHS[start.getUTCMonth()],
      fullLabel: `${MONTHS_LONG[start.getUTCMonth()]} ${start.getUTCFullYear()}`,
    };
  }
  if (granularity === "weekly") {
    return {
      label: dayLabel(bucket.start),
      fullLabel: `${dayLabel(bucket.start)} – ${dayLabel(bucket.end)}`,
    };
  }
  return {
    label: dayLabel(bucket.start),
    fullLabel: `${dayLabel(bucket.start)}, ${start.getUTCFullYear()}`,
  };
}

function monthBounds(year: number, month: number) {
  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 0));
  return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)] as const;
}

/**
 * Builds the buckets for a range. Weekly buckets are rolling 7-day blocks
 * ending today (so the latest week is never partial); monthly buckets are the
 * last twelve complete calendar months.
 */
function buildBuckets(range: DateRangeKey, granularity: Granularity): Bucket[] {
  const periodDays = DATE_RANGES[range].days;

  if (granularity === "monthly") {
    const reference = parseDay(REFERENCE_DATE);
    return Array.from({ length: 12 }, (_, offset) => {
      const monthIndex = reference.getUTCMonth() - 12 + offset;
      const [start, end] = monthBounds(reference.getUTCFullYear(), monthIndex);
      const [previousStart, previousEnd] = monthBounds(reference.getUTCFullYear() - 1, monthIndex);
      return { start, end, previousStart, previousEnd };
    });
  }

  const size = granularity === "weekly" ? 7 : 1;
  const count = Math.ceil(periodDays / size);
  return Array.from({ length: count }, (_, offset) => {
    const end = addDays(REFERENCE_DATE, -(count - 1 - offset) * size);
    const start = addDays(end, -(size - 1));
    return {
      start,
      end,
      previousStart: addDays(start, -periodDays),
      previousEnd: addDays(end, -periodDays),
    };
  });
}

function mapBuckets<T extends SeriesPoint>(
  range: DateRangeKey,
  granularity: Granularity,
  build: (bucket: Bucket) => Omit<T, keyof SeriesPoint>,
): T[] {
  return buildBuckets(range, granularity).map(
    (bucket) =>
      ({
        date: bucket.start,
        ...bucketLabels(bucket, granularity),
        ...build(bucket),
      }) as T,
  );
}

/* ------------------------------------------------------------------------ */
/* Series selectors                                                          */
/* ------------------------------------------------------------------------ */

export interface SeriesQuery {
  range: DateRangeKey;
  granularity: Granularity;
  plan?: PlanFilter;
}

export function getRevenueSeries(dataset: MetricsDataset, query: SeriesQuery): RevenuePoint[] {
  const index = getDaily(dataset, query.plan ?? "all");
  return mapBuckets<RevenuePoint>(query.range, query.granularity, (bucket) => ({
    revenue: sum(daysIn(index, bucket.start, bucket.end), "revenue"),
    previousRevenue: sum(daysIn(index, bucket.previousStart, bucket.previousEnd), "revenue"),
  }));
}

export function getCustomerSeries(dataset: MetricsDataset, query: SeriesQuery): CustomerPoint[] {
  const index = getDaily(dataset, query.plan ?? "all");
  return mapBuckets<CustomerPoint>(query.range, query.granularity, (bucket) => {
    const days = daysIn(index, bucket.start, bucket.end);
    return {
      newCustomers: sum(days, "newCustomers"),
      returningCustomers: sum(days, "reactivatedCustomers"),
      churnedCustomers: sum(days, "churnedCustomers"),
      activeCustomers: dayAt(index, bucket.end).activeCustomers,
    };
  });
}

export function getMrrMovementSeries(dataset: MetricsDataset, query: SeriesQuery): MrrMovementPoint[] {
  const index = getDaily(dataset, query.plan ?? "all");
  return mapBuckets<MrrMovementPoint>(query.range, query.granularity, (bucket) => {
    const days = daysIn(index, bucket.start, bucket.end);
    const newMrr = sum(days, "newMrr");
    const expansionMrr = sum(days, "expansionMrr");
    const contractionMrr = sum(days, "contractionMrr");
    const churnedMrr = sum(days, "churnedMrr");
    return {
      newMrr,
      expansionMrr,
      // Losses are stored as negatives so they plot below the zero line.
      contractionMrr: -contractionMrr,
      churnedMrr: -churnedMrr,
      netMrr: newMrr + expansionMrr - contractionMrr - churnedMrr,
    };
  });
}

export function getMrrSeries(dataset: MetricsDataset, query: SeriesQuery): ValuePoint[] {
  const index = getDaily(dataset, query.plan ?? "all");
  return mapBuckets<ValuePoint>(query.range, query.granularity, (bucket) => ({
    value: dayAt(index, bucket.end).mrr,
  }));
}

export function getArpuSeries(dataset: MetricsDataset, query: SeriesQuery): ValuePoint[] {
  const index = getDaily(dataset, query.plan ?? "all");
  return mapBuckets<ValuePoint>(query.range, query.granularity, (bucket) => {
    const day = dayAt(index, bucket.end);
    return { value: Number((day.mrr / day.activeCustomers).toFixed(2)) };
  });
}

/** Rolling 30-day churn at each bucket end, so every granularity reads as a monthly rate. */
export function getChurnRateSeries(dataset: MetricsDataset, query: SeriesQuery): ValuePoint[] {
  const index = getDaily(dataset, query.plan ?? "all");
  return mapBuckets<ValuePoint>(query.range, query.granularity, (bucket) => {
    const days = daysIn(index, addDays(bucket.end, -29), bucket.end);
    const rate = (sum(days, "churnedCustomers") / days[0].activeCustomers) * 100;
    return { value: Number(rate.toFixed(2)) };
  });
}

export function getConversionSeries(dataset: MetricsDataset, query: Omit<SeriesQuery, "plan">): ValuePoint[] {
  const byDate = new Map(dataset.traffic.map((day, position) => [day.date, position]));
  return mapBuckets<ValuePoint>(query.range, query.granularity, (bucket) => {
    const days = dataset.traffic.slice(byDate.get(bucket.start), (byDate.get(bucket.end) ?? 0) + 1);
    return {
      value: Number(((sum(days, "signups") / sum(days, "visitors")) * 100).toFixed(2)),
    };
  });
}

/* ------------------------------------------------------------------------ */
/* Period summaries                                                          */
/* ------------------------------------------------------------------------ */

function periodWindow(range: DateRangeKey) {
  const days = DATE_RANGES[range].days;
  const start = addDays(REFERENCE_DATE, -(days - 1));
  return {
    days,
    start,
    end: REFERENCE_DATE,
    previousStart: addDays(start, -days),
    previousEnd: addDays(start, -1),
  };
}

function summarise(index: DailyIndex, start: string, end: string, periodDays: number) {
  const days = daysIn(index, start, end);
  const closing = days[days.length - 1];
  const opening = days[0];
  return {
    revenue: sum(days, "revenue"),
    mrr: closing.mrr,
    activeCustomers: closing.activeCustomers,
    newCustomers: sum(days, "newCustomers"),
    churnRate: (sum(days, "churnedCustomers") / opening.activeCustomers) * (DAYS_PER_MONTH / periodDays) * 100,
    arpu: closing.mrr / closing.activeCustomers,
  };
}

function conversionRate(dataset: MetricsDataset, start: string, end: string) {
  const days = dataset.traffic.filter((day) => day.date >= start && day.date <= end);
  return (sum(days, "signups") / sum(days, "visitors")) * 100;
}

export type MetricId =
  "revenue" | "mrr" | "arr" | "activeCustomers" | "newCustomers" | "churnRate" | "conversionRate" | "arpu";

export function getMetrics(
  dataset: MetricsDataset,
  range: DateRangeKey,
  plan: PlanFilter = "all",
): Record<MetricId, AnalyticsMetric> {
  const index = getDaily(dataset, plan);
  const period = periodWindow(range);
  const current = summarise(index, period.start, period.end, period.days);
  const previous = summarise(index, period.previousStart, period.previousEnd, period.days);

  return {
    revenue: {
      id: "revenue",
      label: "Total Revenue",
      value: current.revenue,
      previousValue: previous.revenue,
      format: "currency",
      higherIsBetter: true,
      description: "Gross revenue collected in the period",
    },
    mrr: {
      id: "mrr",
      label: "Monthly Recurring Revenue",
      value: current.mrr,
      previousValue: previous.mrr,
      format: "currency",
      higherIsBetter: true,
      description: "Normalised monthly subscription revenue",
    },
    arr: {
      id: "arr",
      label: "Annual Run Rate",
      value: current.mrr * 12,
      previousValue: previous.mrr * 12,
      format: "currency",
      higherIsBetter: true,
      description: "MRR annualised",
    },
    activeCustomers: {
      id: "activeCustomers",
      label: "Active Customers",
      value: current.activeCustomers,
      previousValue: previous.activeCustomers,
      format: "number",
      higherIsBetter: true,
      description: "Paying accounts at period end",
    },
    newCustomers: {
      id: "newCustomers",
      label: "New Customers",
      value: current.newCustomers,
      previousValue: previous.newCustomers,
      format: "number",
      higherIsBetter: true,
      description: "First-time paid conversions",
    },
    churnRate: {
      id: "churnRate",
      label: "Churn Rate",
      value: current.churnRate,
      previousValue: previous.churnRate,
      format: "percent",
      higherIsBetter: false,
      description: "Customer churn, normalised monthly",
    },
    conversionRate: {
      id: "conversionRate",
      label: "Conversion Rate",
      value: conversionRate(dataset, period.start, period.end),
      previousValue: conversionRate(dataset, period.previousStart, period.previousEnd),
      format: "percent",
      higherIsBetter: true,
      description: "Visitor to sign-up conversion",
    },
    arpu: {
      id: "arpu",
      label: "Avg. Revenue per User",
      value: current.arpu,
      previousValue: previous.arpu,
      format: "currency",
      higherIsBetter: true,
      description: "MRR divided by active customers",
    },
  };
}

/** Daily (or weekly for 12 months) values used to draw KPI sparklines. */
export function getSparkline(
  dataset: MetricsDataset,
  metric: MetricId,
  range: DateRangeKey,
  plan: PlanFilter = "all",
): number[] {
  const query: SeriesQuery = { range, plan, granularity: range === "12m" ? "weekly" : "daily" };
  switch (metric) {
    case "revenue":
      return getRevenueSeries(dataset, query).map((point) => point.revenue);
    case "mrr":
    case "arr":
      return getMrrSeries(dataset, query).map((point) => point.value);
    case "activeCustomers":
      return getCustomerSeries(dataset, query).map((point) => point.activeCustomers);
    case "newCustomers":
      return getCustomerSeries(dataset, query).map((point) => point.newCustomers);
    case "churnRate":
      return getChurnRateSeries(dataset, query).map((point) => point.value);
    case "conversionRate":
      return getConversionSeries(dataset, query).map((point) => point.value);
    case "arpu":
      return getArpuSeries(dataset, query).map((point) => point.value);
  }
}

export function getPlanBreakdown(dataset: MetricsDataset): PlanBreakdownItem[] {
  const latest = PLAN_IDS.map((plan) => {
    const days = dataset.plans[plan];
    return { plan, day: days[days.length - 1] };
  });
  const totalMrr = latest.reduce((total, { day }) => total + day.mrr, 0);
  return latest.map(({ plan, day }) => ({
    plan,
    name: PLANS[plan].name,
    customers: day.activeCustomers,
    revenue: day.mrr,
    share: (day.mrr / totalMrr) * 100,
  }));
}

export function getFunnel(dataset: MetricsDataset, range: DateRangeKey): FunnelStage[] {
  const period = periodWindow(range);
  const traffic = dataset.traffic.filter((day) => day.date >= period.start && day.date <= period.end);
  const paid = sum(daysIn(getDaily(dataset, "all"), period.start, period.end), "newCustomers");
  return [
    { id: "visitors", label: "Website visitors", value: sum(traffic, "visitors") },
    { id: "signups", label: "Trial sign-ups", value: sum(traffic, "signups") },
    { id: "activated", label: "Activated trials", value: sum(traffic, "activatedTrials") },
    { id: "paid", label: "Paid conversions", value: paid },
  ];
}

/** Exact customer flow totals for a period (charts may bucket by whole weeks). */
export function getCustomerTotals(dataset: MetricsDataset, range: DateRangeKey, plan: PlanFilter = "all") {
  const period = periodWindow(range);
  const days = daysIn(getDaily(dataset, plan), period.start, period.end);
  return {
    newCustomers: sum(days, "newCustomers"),
    returningCustomers: sum(days, "reactivatedCustomers"),
    churnedCustomers: sum(days, "churnedCustomers"),
    activeCustomers: days[days.length - 1].activeCustomers,
  } satisfies Partial<Record<keyof CustomerPoint, number>>;
}
