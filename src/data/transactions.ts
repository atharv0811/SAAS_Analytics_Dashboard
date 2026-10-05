import { REFERENCE_DATE } from "@/lib/constants";
import { addDays, parseDay, toDayString } from "@/lib/dates";
import { createRandom } from "@/lib/random";
import { customers } from "@/data/customers";
import { PLANS } from "@/data/plans";
import type { Customer, PaymentMethod, Transaction, TransactionStatus } from "@/types";

/** Billing history window, in days before the reference date. */
const HISTORY_DAYS = 150;

const FAILURE_REASONS: Record<PaymentMethod, string[]> = {
  visa: ["Card declined: insufficient funds", "Card expired", "Authentication required (3-D Secure)"],
  mastercard: ["Card declined: insufficient funds", "Card declined: do not honor"],
  amex: ["Card declined: suspected fraud", "Card expired"],
  paypal: ["PayPal balance and backup funding unavailable"],
  bank_transfer: ["Bank account closed", "Insufficient funds (R01)"],
};

function processingFee(amount: number, method: PaymentMethod) {
  switch (method) {
    case "amex":
      return amount * 0.035 + 0.3;
    case "paypal":
      return amount * 0.0349 + 0.49;
    case "bank_transfer":
      return Math.min(amount * 0.008, 5);
    default:
      return amount * 0.029 + 0.3;
  }
}

function paymentMethodFor(customer: Customer, random: ReturnType<typeof createRandom>) {
  if (customer.subscription.plan === "enterprise" && random.next() < 0.6) {
    return "bank_transfer" as const;
  }
  return random.weighted<PaymentMethod>([
    ["visa", 0.4],
    ["mastercard", 0.25],
    ["amex", 0.1],
    ["paypal", 0.15],
    ["bank_transfer", 0.1],
  ]);
}

interface Charge {
  customer: Customer;
  day: string;
  amount: number;
  description: string;
}

/** Recurring charges on each customer's billing anniversary within the window. */
function scheduledCharges(customer: Customer, random: ReturnType<typeof createRandom>): Charge[] {
  if (customer.status === "trialing") return [];

  const windowStart = addDays(REFERENCE_DATE, -HISTORY_DAYS);
  const lastBillable = customer.status === "churned" ? customer.lastActiveAt.slice(0, 10) : REFERENCE_DATE;
  const plan = PLANS[customer.subscription.plan];
  const annual = customer.subscription.billingCycle === "annual";
  const listPrice = customer.subscription.mrr || plan.monthlyPrice;
  const amount = Math.round((annual ? listPrice * 12 : listPrice) * 100) / 100;

  const charges: Charge[] = [];
  const cursor = parseDay(customer.joinedAt.slice(0, 10));
  while (toDayString(cursor) <= lastBillable) {
    const day = toDayString(cursor);
    if (day >= windowStart) {
      charges.push({
        customer,
        day,
        amount,
        description: `${plan.name} plan · ${annual ? "Annual" : "Monthly"}`,
      });
    }
    cursor.setUTCMonth(cursor.getUTCMonth() + (annual ? 12 : 1));
  }

  // Occasional one-off charges: extra seats or onboarding packages.
  if (customer.subscription.plan !== "starter" && random.next() < 0.22) {
    const onboarding = random.next() < 0.5;
    charges.push({
      customer,
      day: addDays(REFERENCE_DATE, -random.int(0, HISTORY_DAYS - 1)),
      amount: onboarding ? random.pick([249, 499, 990]) : random.int(2, 6) * plan.monthlyPrice,
      description: onboarding ? "Onboarding package" : "Additional seats",
    });
  }

  return charges;
}

function statusFor(charge: Charge, isLatest: boolean, random: ReturnType<typeof createRandom>): TransactionStatus {
  const age = Math.round((parseDay(REFERENCE_DATE).getTime() - parseDay(charge.day).getTime()) / 86_400_000);
  if (isLatest && charge.customer.status === "past_due") return "failed";
  if (age <= 2 && random.next() < 0.45) return "pending";
  return random.weighted<TransactionStatus>([
    ["paid", 0.9],
    ["failed", 0.045],
    ["refunded", 0.055],
  ]);
}

function generateTransactions(): Transaction[] {
  const random = createRandom(7319);
  const methods = new Map(customers.map((customer) => [customer.id, paymentMethodFor(customer, random)]));
  const last4 = new Map(customers.map((customer) => [customer.id, String(random.int(1000, 9999))]));

  const charges = customers.flatMap((customer) => {
    const list = scheduledCharges(customer, random).sort((a, b) => a.day.localeCompare(b.day));
    return list.map((charge, index) => ({ charge, isLatest: index === list.length - 1 }));
  });

  charges.sort((a, b) => a.charge.day.localeCompare(b.charge.day));

  const transactions = charges.map(({ charge, isLatest }, index): Transaction => {
    const { customer } = charge;
    const method = methods.get(customer.id) ?? "visa";
    const status = statusFor(charge, isLatest, random);
    const hour = String(random.int(0, 23)).padStart(2, "0");
    const minute = String(random.int(0, 59)).padStart(2, "0");
    const sequence = 48_210 + index;

    return {
      id: `TXN-${sequence}`,
      invoiceId: `INV-${charge.day.slice(0, 7).replace("-", "")}-${String(index + 1).padStart(4, "0")}`,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      company: customer.company,
      plan: customer.subscription.plan,
      description: charge.description,
      amount: charge.amount,
      fee: status === "failed" ? 0 : Math.round(processingFee(charge.amount, method) * 100) / 100,
      status,
      paymentMethod: method,
      paymentLast4: method === "paypal" ? null : (last4.get(customer.id) ?? null),
      createdAt: `${charge.day}T${hour}:${minute}:00.000Z`,
      failureReason: status === "failed" ? random.pick(FAILURE_REASONS[method]) : null,
    };
  });

  // Today's charges cannot be later than the demo's "now" (09:41 UTC).
  for (const transaction of transactions) {
    if (transaction.createdAt.slice(0, 10) === REFERENCE_DATE && transaction.createdAt.slice(11, 16) > "09:41") {
      transaction.createdAt = `${REFERENCE_DATE}T0${random.int(1, 8)}:${String(random.int(10, 59))}:00.000Z`;
    }
  }

  return transactions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const transactions: Transaction[] = generateTransactions();
