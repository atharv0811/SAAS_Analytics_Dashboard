import { PLANS } from "@/data/plans";
import { formatCurrency } from "@/lib/format";
import type { Customer, TimelineEvent, Transaction } from "@/types";

const MINUTE = 60_000;

function shift(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * MINUTE).toISOString();
}

/** Lifecycle events for a single payment, derived from its status. */
export function getTransactionTimeline(transaction: Transaction): TimelineEvent[] {
  const amount = formatCurrency(transaction.amount, { precise: true });
  const events: TimelineEvent[] = [
    {
      id: "created",
      title: "Invoice created",
      description: `${transaction.invoiceId} issued for ${amount}`,
      timestamp: shift(transaction.createdAt, -2),
      tone: "default",
    },
    {
      id: "attempted",
      title: "Payment attempted",
      description: "Charge submitted to the payment processor",
      timestamp: transaction.createdAt,
      tone: "default",
    },
  ];

  switch (transaction.status) {
    case "paid":
      events.push({
        id: "succeeded",
        title: "Payment succeeded",
        description: `${amount} captured, receipt emailed to ${transaction.customerEmail}`,
        timestamp: shift(transaction.createdAt, 1),
        tone: "success",
      });
      break;
    case "pending":
      events.push({
        id: "pending",
        title: "Awaiting confirmation",
        description:
          transaction.paymentMethod === "bank_transfer"
            ? "Bank transfers usually settle within 2–3 business days"
            : "Waiting for the processor to confirm the charge",
        timestamp: shift(transaction.createdAt, 1),
        tone: "warning",
      });
      break;
    case "failed":
      events.push(
        {
          id: "failed",
          title: "Payment failed",
          description: transaction.failureReason ?? "The charge was declined",
          timestamp: shift(transaction.createdAt, 1),
          tone: "danger",
        },
        {
          id: "dunning",
          title: "Dunning email sent",
          description: "Customer asked to update their payment method",
          timestamp: shift(transaction.createdAt, 30),
          tone: "default",
        },
      );
      break;
    case "refunded":
      events.push(
        {
          id: "succeeded",
          title: "Payment succeeded",
          description: `${amount} captured`,
          timestamp: shift(transaction.createdAt, 1),
          tone: "success",
        },
        {
          id: "refunded",
          title: "Refund issued",
          description: `${amount} returned to the original payment method`,
          timestamp: shift(transaction.createdAt, 60 * 26),
          tone: "warning",
        },
      );
      break;
  }

  return events.reverse();
}

/** Recent account activity: payments plus sign-up and status milestones. */
export function getCustomerActivity(customer: Customer, transactions: Transaction[], limit = 6): TimelineEvent[] {
  const plan = PLANS[customer.subscription.plan].name;
  const events: TimelineEvent[] = transactions.map((transaction) => ({
    id: transaction.id,
    title:
      transaction.status === "paid"
        ? `Paid ${formatCurrency(transaction.amount, { precise: true })}`
        : transaction.status === "failed"
          ? "Payment failed"
          : transaction.status === "refunded"
            ? `Refunded ${formatCurrency(transaction.amount, { precise: true })}`
            : "Payment pending",
    description: transaction.failureReason ?? transaction.description,
    timestamp: transaction.createdAt,
    tone:
      transaction.status === "paid"
        ? "success"
        : transaction.status === "failed"
          ? "danger"
          : transaction.status === "refunded"
            ? "warning"
            : "default",
  }));

  events.push({
    id: "joined",
    title: customer.status === "trialing" ? "Started a free trial" : "Signed up",
    description: `${plan} plan · ${customer.subscription.seats} ${customer.subscription.seats === 1 ? "seat" : "seats"}`,
    timestamp: customer.joinedAt,
    tone: "default",
  });

  if (customer.status === "churned") {
    events.push({
      id: "churned",
      title: "Subscription cancelled",
      description: "Account moved to the free tier at period end",
      timestamp: customer.lastActiveAt,
      tone: "danger",
    });
  }

  return events.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
}
