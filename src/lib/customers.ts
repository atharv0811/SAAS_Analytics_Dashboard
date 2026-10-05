import { PLANS } from "@/data/plans";
import { getReferenceNow } from "@/lib/dates";
import type { CustomerFormValues } from "@/lib/schemas/customer";
import type { Customer } from "@/types";

const ANNUAL_DISCOUNT = 0.83;

function mrrFor(values: CustomerFormValues) {
  if (values.status === "churned" || values.status === "trialing") return 0;
  const price = PLANS[values.plan].monthlyPrice;
  return Math.round((values.billingCycle === "annual" ? price * ANNUAL_DISCOUNT : price) * 100) / 100;
}

export function nextCustomerId(customers: Customer[]) {
  const highest = customers.reduce((max, customer) => Math.max(max, Number(customer.id.slice(4))), 1000);
  return `CUS-${highest + 1}`;
}

/** Builds a new record, or applies edits to an existing one, from form values. */
export function applyCustomerForm(values: CustomerFormValues, id: string, existing?: Customer): Customer {
  const now = getReferenceNow().toISOString();
  const renewal = new Date(getReferenceNow());
  renewal.setUTCMonth(renewal.getUTCMonth() + (values.billingCycle === "annual" ? 12 : 1));

  return {
    id,
    phone: existing?.phone ?? "Not provided",
    country: existing?.country ?? "United States",
    city: existing?.city ?? "San Francisco",
    revenue: existing?.revenue ?? 0,
    joinedAt: existing?.joinedAt ?? now,
    lastActiveAt: existing?.lastActiveAt ?? now,
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    company: values.company.trim(),
    status: values.status,
    subscription: {
      plan: values.plan,
      billingCycle: values.billingCycle,
      mrr: mrrFor(values),
      seats: existing?.subscription.seats ?? 1,
      renewsAt: existing?.subscription.renewsAt ?? renewal.toISOString(),
    },
  };
}
