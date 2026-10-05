import { REFERENCE_DATE } from "@/lib/constants";
import { addDays, parseDay } from "@/lib/dates";
import { createRandom, type Random } from "@/lib/random";
import { PLAN_IDS } from "@/data/plans";
import type { MetricsDataset, PlanDailyMetrics, PlanId, TrafficDailyMetrics } from "@/types";

/**
 * A little over two years, so even the 12-month range bucketed by calendar
 * month or rolling week always has a complete previous period to compare to.
 */
const HISTORY_DAYS = 800;

/** Calibration targets for the trailing 90-day window ending on REFERENCE_DATE. */
const TARGET_REVENUE_90D = 128_430;
const TARGET_CONVERSION_90D = 0.0486;

interface PlanProfile {
  /** Values on the reference date; history is generated backwards from here. */
  activeCustomers: number;
  mrr: number;
  newPerDay: number;
  reactivatedPerDay: number;
  monthlyChurnRate: number;
  monthlyExpansionRate: number;
  monthlyContractionRate: number;
  oneTimeChance: number;
  oneTimeAmount: number;
}

const PLAN_PROFILES: Record<PlanId, PlanProfile> = {
  starter: {
    activeCustomers: 1845,
    mrr: 16_605,
    newPerDay: 3.0,
    reactivatedPerDay: 0.25,
    monthlyChurnRate: 0.032,
    monthlyExpansionRate: 0.012,
    monthlyContractionRate: 0.005,
    oneTimeChance: 0,
    oneTimeAmount: 0,
  },
  professional: {
    activeCustomers: 760,
    mrr: 14_440,
    newPerDay: 1.15,
    reactivatedPerDay: 0.08,
    monthlyChurnRate: 0.02,
    monthlyExpansionRate: 0.02,
    monthlyContractionRate: 0.006,
    oneTimeChance: 0.03,
    oneTimeAmount: 150,
  },
  business: {
    activeCustomers: 200,
    mrr: 7_800,
    newPerDay: 0.3,
    reactivatedPerDay: 0.02,
    monthlyChurnRate: 0.012,
    monthlyExpansionRate: 0.024,
    monthlyContractionRate: 0.006,
    oneTimeChance: 0.06,
    oneTimeAmount: 450,
  },
  enterprise: {
    activeCustomers: 40,
    mrr: 3_835,
    newPerDay: 0.035,
    reactivatedPerDay: 0,
    monthlyChurnRate: 0.006,
    monthlyExpansionRate: 0.015,
    monthlyContractionRate: 0.004,
    oneTimeChance: 0.02,
    oneTimeAmount: 1_500,
  },
};

const DAYS_PER_MONTH = 30.42;

function weekdayFactor(day: string, weekend: number) {
  const weekday = parseDay(day).getUTCDay();
  return weekday === 0 || weekday === 6 ? weekend : 1;
}

/** Ramp from 0.6 (oldest) to 1 (today): the business has been growing. */
function growthFactor(index: number) {
  return 0.6 + 0.4 * (index / (HISTORY_DAYS - 1));
}

function buildDates() {
  return Array.from({ length: HISTORY_DAYS }, (_, index) => addDays(REFERENCE_DATE, index - (HISTORY_DAYS - 1)));
}

/**
 * Walks backwards from today's known totals so the latest values match the
 * product's headline numbers exactly while history stays internally consistent.
 */
function generatePlanSeries(
  profile: PlanProfile,
  dates: string[],
  random: Random,
): (PlanDailyMetrics & { rawRevenue: number })[] {
  const series = new Array<PlanDailyMetrics & { rawRevenue: number }>(dates.length);
  const arpa = profile.mrr / profile.activeCustomers;
  let active = profile.activeCustomers;
  let mrr = profile.mrr;

  for (let index = dates.length - 1; index >= 0; index -= 1) {
    const day = dates[index];
    const growth = growthFactor(index);
    const weekday = weekdayFactor(day, 0.7);

    const newCustomers = random.poisson(profile.newPerDay * growth * weekday);
    const reactivatedCustomers = random.poisson(profile.reactivatedPerDay * growth);
    const churnedCustomers = Math.min(
      random.poisson((active * profile.monthlyChurnRate) / DAYS_PER_MONTH),
      Math.max(active - 1, 0),
    );

    const newMrr = Math.round((newCustomers + reactivatedCustomers) * arpa * random.between(0.9, 1.08));
    const expansionMrr = Math.round(((mrr * profile.monthlyExpansionRate) / DAYS_PER_MONTH) * random.between(0.4, 1.6));
    const contractionMrr = Math.round(
      ((mrr * profile.monthlyContractionRate) / DAYS_PER_MONTH) * random.between(0.3, 1.7),
    );
    const churnedMrr = Math.round(churnedCustomers * arpa * random.between(0.85, 1.1));

    const oneTime = random.next() < profile.oneTimeChance ? profile.oneTimeAmount * random.between(0.6, 1.4) : 0;
    const rawRevenue = (mrr / DAYS_PER_MONTH) * weekdayFactor(day, 0.82) * random.between(0.9, 1.1) + oneTime;

    series[index] = {
      date: day,
      revenue: 0,
      rawRevenue,
      mrr,
      newMrr,
      expansionMrr,
      contractionMrr,
      churnedMrr,
      activeCustomers: active,
      newCustomers,
      reactivatedCustomers,
      churnedCustomers,
    };

    active = Math.max(active - newCustomers - reactivatedCustomers + churnedCustomers, 1);
    const netMrr = newMrr + expansionMrr - contractionMrr - churnedMrr;
    mrr = Math.max(mrr - netMrr, Math.round(active * arpa * 0.8));
  }

  return series;
}

function generateTraffic(dates: string[], random: Random): TrafficDailyMetrics[] {
  const raw = dates.map((date, index) => {
    const visitors = Math.round(
      1_950 * (0.7 + 0.3 * (index / (dates.length - 1))) * weekdayFactor(date, 0.72) * random.between(0.88, 1.12),
    );
    return { date, visitors, rawSignups: visitors * random.between(0.042, 0.055) };
  });

  const window = raw.slice(-90);
  const visitors90 = window.reduce((sum, day) => sum + day.visitors, 0);
  const rawSignups90 = window.reduce((sum, day) => sum + day.rawSignups, 0);
  const scale = (TARGET_CONVERSION_90D * visitors90) / rawSignups90;

  const traffic = raw.map(({ date, visitors, rawSignups }) => {
    const signups = Math.round(rawSignups * scale);
    return {
      date,
      visitors,
      signups,
      activatedTrials: Math.round(signups * random.between(0.5, 0.62)),
    };
  });

  // Absorb rounding drift on the final day so the 90-day rate is exact.
  const target = Math.round(TARGET_CONVERSION_90D * visitors90);
  const actual = traffic.slice(-90).reduce((sum, day) => sum + day.signups, 0);
  traffic[traffic.length - 1].signups += target - actual;

  return traffic;
}

function generateDataset(): MetricsDataset {
  const dates = buildDates();
  const random = createRandom(20261005);

  const rawPlans = Object.fromEntries(
    PLAN_IDS.map((plan) => [plan, generatePlanSeries(PLAN_PROFILES[plan], dates, random)]),
  ) as Record<PlanId, ReturnType<typeof generatePlanSeries>>;

  const raw90 = PLAN_IDS.reduce(
    (sum, plan) => sum + rawPlans[plan].slice(-90).reduce((acc, day) => acc + day.rawRevenue, 0),
    0,
  );
  const scale = TARGET_REVENUE_90D / raw90;

  const plans = Object.fromEntries(
    PLAN_IDS.map((plan) => [
      plan,
      rawPlans[plan].map(({ rawRevenue, ...day }) => ({
        ...day,
        revenue: Math.round(rawRevenue * scale),
      })),
    ]),
  ) as Record<PlanId, PlanDailyMetrics[]>;

  const rounded90 = PLAN_IDS.reduce(
    (sum, plan) => sum + plans[plan].slice(-90).reduce((acc, day) => acc + day.revenue, 0),
    0,
  );
  plans.starter[plans.starter.length - 1].revenue += TARGET_REVENUE_90D - rounded90;

  return { plans, traffic: generateTraffic(dates, random) };
}

let cache: MetricsDataset | null = null;

/** Lazily generated, memoised dataset shared by every chart in the app. */
export function getMetricsDataset(): MetricsDataset {
  cache ??= generateDataset();
  return cache;
}
