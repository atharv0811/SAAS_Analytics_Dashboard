import { REFERENCE_DATE } from "@/lib/constants";
import { addDays, parseDay } from "@/lib/dates";
import { createRandom } from "@/lib/random";
import { PLANS } from "@/data/plans";
import type { BillingCycle, Customer, CustomerStatus, PlanId } from "@/types";

const FIRST_NAMES = [
  "Olivia",
  "Liam",
  "Maya",
  "Noah",
  "Aisha",
  "Ethan",
  "Sofia",
  "Lucas",
  "Priya",
  "Mateo",
  "Hannah",
  "Daniel",
  "Chloe",
  "Kenji",
  "Amara",
  "Jonas",
  "Elena",
  "Omar",
  "Grace",
  "Felix",
  "Nadia",
  "Samuel",
  "Isla",
  "Ravi",
  "Zoe",
  "Tobias",
  "Leah",
  "Marcus",
  "Yara",
  "Adrian",
  "Mei",
  "Caleb",
  "Freya",
  "Diego",
  "Ines",
  "Victor",
  "Talia",
  "Hugo",
  "Anika",
  "Rowan",
] as const;

const LAST_NAMES = [
  "Bennett",
  "Okafor",
  "Lindqvist",
  "Hartley",
  "Moreau",
  "Castillo",
  "Nakamura",
  "Fischer",
  "Reyes",
  "Adeyemi",
  "Sullivan",
  "Kowalski",
  "Brennan",
  "Haddad",
  "Iyer",
  "Novak",
  "Whitfield",
  "Sato",
  "Delgado",
  "Larsen",
  "Mensah",
  "Calloway",
  "Duarte",
  "Ferreira",
  "Ghosh",
  "Holloway",
  "Kaplan",
  "Marsh",
  "Quinn",
  "Varga",
] as const;

const COMPANY_PREFIXES = [
  "Brightline",
  "Copperleaf",
  "Halcyon",
  "Ironbark",
  "Juniper",
  "Kestrel",
  "Meridian",
  "Northbeam",
  "Orchard",
  "Pinecrest",
  "Quarry",
  "Saltmarsh",
  "Tidewater",
  "Willowby",
  "Yellowfin",
  "Zephyr",
  "Bluefern",
  "Cinderpath",
  "Driftwood",
  "Emberly",
  "Foxglove",
  "Granite Bay",
  "Inkwell",
  "Larkspur",
  "Mosswood",
  "Oakhollow",
] as const;

const COMPANY_SUFFIXES = [
  "Labs",
  "Studio",
  "Health",
  "Logistics",
  "Analytics",
  "Software",
  "Collective",
  "Systems",
  "Commerce",
  "Learning",
  "Media",
  "Robotics",
  "Finance",
  "Cloud",
] as const;

const DOMAINS = ["io", "com", "co", "app"] as const;

const LOCATIONS = [
  ["United States", "San Francisco"],
  ["United States", "Austin"],
  ["United States", "New York"],
  ["United States", "Seattle"],
  ["United States", "Denver"],
  ["United Kingdom", "London"],
  ["United Kingdom", "Manchester"],
  ["Germany", "Berlin"],
  ["Germany", "Munich"],
  ["Canada", "Toronto"],
  ["Netherlands", "Amsterdam"],
  ["Australia", "Sydney"],
  ["Singapore", "Singapore"],
  ["India", "Bengaluru"],
  ["Brazil", "São Paulo"],
  ["France", "Paris"],
] as const;

const CUSTOMER_COUNT = 148;
const ANNUAL_DISCOUNT = 0.83;

const SEAT_RANGES: Record<PlanId, [number, number]> = {
  starter: [1, 2],
  professional: [2, 8],
  business: [5, 25],
  enterprise: [25, 120],
};

function monthsBetween(from: string, to: string) {
  const start = parseDay(from);
  const end = parseDay(to);
  return Math.max((end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth(), 0);
}

function nextRenewal(joinedAt: string, cycle: BillingCycle) {
  const joined = parseDay(joinedAt.slice(0, 10));
  const reference = parseDay(REFERENCE_DATE);
  const step = cycle === "annual" ? 12 : 1;
  const renewal = new Date(joined);
  while (renewal <= reference) {
    renewal.setUTCMonth(renewal.getUTCMonth() + step);
  }
  return renewal.toISOString();
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function withTime(day: string, random: ReturnType<typeof createRandom>) {
  const hour = String(random.int(7, 20)).padStart(2, "0");
  const minute = String(random.int(0, 59)).padStart(2, "0");
  return `${day}T${hour}:${minute}:00.000Z`;
}

function generateCustomers(): Customer[] {
  const random = createRandom(4821);
  const usedCompanies = new Set<string>();

  const customers = Array.from({ length: CUSTOMER_COUNT }, (_, index): Customer => {
    const firstName = random.pick(FIRST_NAMES);
    const lastName = random.pick(LAST_NAMES);

    let company = "";
    do {
      company = `${random.pick(COMPANY_PREFIXES)} ${random.pick(COMPANY_SUFFIXES)}`;
    } while (usedCompanies.has(company));
    usedCompanies.add(company);

    const plan = random.weighted<PlanId>([
      ["starter", 0.46],
      ["professional", 0.31],
      ["business", 0.15],
      ["enterprise", 0.08],
    ]);
    const status = random.weighted<CustomerStatus>([
      ["active", 0.72],
      ["trialing", 0.09],
      ["past_due", 0.07],
      ["churned", 0.12],
    ]);
    const billingCycle: BillingCycle = plan === "enterprise" || random.next() < 0.32 ? "annual" : "monthly";

    const joinedDay =
      status === "trialing"
        ? addDays(REFERENCE_DATE, -random.int(0, 13))
        : addDays(REFERENCE_DATE, -random.int(1, 720));
    const joinedAt = withTime(joinedDay, random);

    const lastActiveDay =
      status === "churned"
        ? addDays(
            REFERENCE_DATE,
            -random.int(25, Math.min(200, Math.max(26, monthsBetween(joinedDay, REFERENCE_DATE) * 30))),
          )
        : status === "past_due"
          ? addDays(REFERENCE_DATE, -random.int(1, 9))
          : addDays(REFERENCE_DATE, -random.int(0, 2));

    const [minSeats, maxSeats] = SEAT_RANGES[plan];
    const seats = random.int(minSeats, maxSeats);
    const listPrice = plan === "enterprise" ? Math.round(random.between(78, 140)) : PLANS[plan].monthlyPrice;
    const mrr = Math.round((billingCycle === "annual" ? listPrice * ANNUAL_DISCOUNT : listPrice) * 100) / 100;

    const billedUntil = status === "churned" ? lastActiveDay : REFERENCE_DATE;
    const monthsBilled = status === "trialing" ? 0 : monthsBetween(joinedDay, billedUntil) + 1;
    const revenue = Math.round(mrr * monthsBilled * 100) / 100;

    const name = `${firstName} ${lastName}`;
    const [country, city] = random.pick(LOCATIONS);

    return {
      id: `CUS-${1001 + index}`,
      name,
      email: `${slug(firstName)}.${slug(lastName)}@${slug(company)}.${random.pick(DOMAINS)}`,
      company,
      phone: `+1 (555) 01${String(random.int(0, 99)).padStart(2, "0")}-${String(random.int(1000, 9999))}`,
      country,
      city,
      status,
      subscription: {
        plan,
        billingCycle,
        mrr: status === "churned" || status === "trialing" ? 0 : mrr,
        seats,
        renewsAt: nextRenewal(joinedAt, billingCycle),
      },
      revenue,
      joinedAt,
      lastActiveAt: withTime(lastActiveDay, random),
    };
  });

  return customers.sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
}

export const customers: Customer[] = generateCustomers();
