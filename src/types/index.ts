export type PlanId = "starter" | "professional" | "business" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  /** List price per month in USD. Enterprise contracts are custom-priced. */
  monthlyPrice: number;
  description: string;
}

export type CustomerStatus = "active" | "trialing" | "past_due" | "churned";
export type BillingCycle = "monthly" | "annual";

export interface Subscription {
  plan: PlanId;
  billingCycle: BillingCycle;
  mrr: number;
  seats: number;
  renewsAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  country: string;
  city: string;
  status: CustomerStatus;
  subscription: Subscription;
  /** Lifetime revenue collected in USD. */
  revenue: number;
  joinedAt: string;
  lastActiveAt: string;
}

export type TransactionStatus = "paid" | "pending" | "failed" | "refunded";
export type PaymentMethod = "visa" | "mastercard" | "amex" | "paypal" | "bank_transfer";

export interface Transaction {
  id: string;
  invoiceId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  company: string;
  plan: PlanId;
  description: string;
  amount: number;
  fee: number;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  /** Last four digits for card payments, account suffix for bank transfers. */
  paymentLast4: string | null;
  createdAt: string;
  failureReason: string | null;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  tone: "default" | "success" | "warning" | "danger";
}

/** One day of subscription metrics for a single plan. */
export interface PlanDailyMetrics {
  date: string;
  revenue: number;
  mrr: number;
  newMrr: number;
  expansionMrr: number;
  contractionMrr: number;
  churnedMrr: number;
  activeCustomers: number;
  newCustomers: number;
  reactivatedCustomers: number;
  churnedCustomers: number;
}

/** One day of top-of-funnel traffic, not segmented by plan. */
export interface TrafficDailyMetrics {
  date: string;
  visitors: number;
  signups: number;
  activatedTrials: number;
}

export interface MetricsDataset {
  plans: Record<PlanId, PlanDailyMetrics[]>;
  traffic: TrafficDailyMetrics[];
}

export type DateRangeKey = "7d" | "30d" | "90d" | "12m";
export type Granularity = "daily" | "weekly" | "monthly";
export type PlanFilter = PlanId | "all";

/** Shared shape for every bucketed time-series point. */
export interface SeriesPoint {
  date: string;
  /** Compact axis label. */
  label: string;
  /** Unambiguous label for tooltips and screen readers. */
  fullLabel: string;
}

export interface RevenuePoint extends SeriesPoint {
  revenue: number;
  previousRevenue: number;
}

export interface CustomerPoint extends SeriesPoint {
  newCustomers: number;
  returningCustomers: number;
  churnedCustomers: number;
  activeCustomers: number;
}

export interface MrrMovementPoint extends SeriesPoint {
  newMrr: number;
  expansionMrr: number;
  contractionMrr: number;
  churnedMrr: number;
  netMrr: number;
}

export interface ValuePoint extends SeriesPoint {
  value: number;
}

export type MetricFormat = "currency" | "number" | "percent";

export interface AnalyticsMetric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  format: MetricFormat;
  /** Whether an increase is good news (false for churn). */
  higherIsBetter: boolean;
  description: string;
}

export interface PlanBreakdownItem {
  plan: PlanId;
  name: string;
  customers: number;
  revenue: number;
  share: number;
}

export interface FunnelStage {
  id: string;
  label: string;
  value: number;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  category: "billing" | "customers" | "system" | "reports";
  read: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  company: string;
  role: string;
  initials: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export interface SearchIndex {
  customers: Pick<Customer, "id" | "name" | "email" | "company">[];
  transactions: Pick<Transaction, "id" | "customerName" | "amount" | "status">[];
}
