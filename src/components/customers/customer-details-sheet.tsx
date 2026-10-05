"use client";

import { useMemo, useState } from "react";
import { Activity, Building2, CalendarDays, Mail, MapPin, Pencil, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CustomerStatusBadge } from "@/components/shared/status-badge";
import { PlanBadge } from "@/components/shared/plan-badge";
import { Timeline } from "@/components/shared/timeline";
import { UserAvatar } from "@/components/shared/user-avatar";
import { EmptyState } from "@/components/shared/states";
import { PLANS } from "@/data/plans";
import { formatCurrency, formatDate } from "@/lib/format";
import { getCustomerActivity } from "@/lib/timeline";
import type { Customer, Transaction } from "@/types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">{title}</h3>
      {children}
    </section>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

interface CustomerDetailsSheetProps {
  customer: Customer | null;
  transactions: Transaction[];
  onOpenChange: (open: boolean) => void;
  onEdit: (customer: Customer) => void;
}

export function CustomerDetailsSheet({
  customer: selected,
  transactions,
  onOpenChange,
  onEdit,
}: CustomerDetailsSheetProps) {
  // Keep showing the last customer while the sheet animates closed.
  const [customer, setCustomer] = useState(selected);
  if (selected && selected !== customer) setCustomer(selected);

  const customerTransactions = useMemo(
    () => (customer ? transactions.filter((transaction) => transaction.customerId === customer.id) : []),
    [customer, transactions],
  );
  const activity = useMemo(
    () => (customer ? getCustomerActivity(customer, customerTransactions) : []),
    [customer, customerTransactions],
  );

  const paid = customerTransactions.filter((transaction) => transaction.status === "paid");
  const collectedRecent = paid.reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <Sheet open={selected !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        {customer && (
          <>
            <SheetHeader className="border-b p-5">
              <div className="flex items-center gap-3 pr-8">
                <UserAvatar name={customer.name} size="lg" />
                <div className="min-w-0">
                  <SheetTitle className="truncate text-base">{customer.name}</SheetTitle>
                  <SheetDescription className="truncate">
                    {customer.company} · <span className="font-mono text-xs">{customer.id}</span>
                  </SheetDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <CustomerStatusBadge status={customer.status} />
                <PlanBadge plan={customer.subscription.plan} />
              </div>
            </SheetHeader>

            <div className="flex-1 space-y-7 overflow-y-auto p-5">
              <div className="grid grid-cols-3 divide-x rounded-lg border">
                {[
                  { label: "MRR", value: formatCurrency(customer.subscription.mrr, { precise: true }) },
                  { label: "Lifetime", value: formatCurrency(customer.revenue) },
                  { label: "Paid · 150d", value: formatCurrency(collectedRecent) },
                ].map((stat) => (
                  <div key={stat.label} className="px-3 py-2.5">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="tabular mt-0.5 text-sm font-semibold">{stat.value}</p>
                  </div>
                ))}
              </div>

              <Section title="Contact information">
                <ul className="space-y-2.5 text-sm">
                  {[
                    { icon: Mail, value: customer.email, href: `mailto:${customer.email}` },
                    { icon: Phone, value: customer.phone, href: `tel:${customer.phone.replace(/[^+\d]/g, "")}` },
                    { icon: Building2, value: customer.company },
                    { icon: MapPin, value: `${customer.city}, ${customer.country}` },
                    { icon: CalendarDays, value: `Customer since ${formatDate(customer.joinedAt)}` },
                  ].map(({ icon: Icon, value, href }) => (
                    <li key={value} className="flex items-center gap-2.5">
                      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      {href ? (
                        <a href={href} className="truncate underline-offset-4 hover:underline">
                          {value}
                        </a>
                      ) : (
                        <span className="truncate">{value}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Subscription">
                <dl className="divide-y rounded-lg border px-3">
                  <DetailRow label="Plan">{PLANS[customer.subscription.plan].name}</DetailRow>
                  <DetailRow label="Billing cycle">
                    {customer.subscription.billingCycle === "annual" ? "Annual" : "Monthly"}
                  </DetailRow>
                  <DetailRow label="Seats">{customer.subscription.seats}</DetailRow>
                  <DetailRow label={customer.status === "churned" ? "Ended" : "Next renewal"}>
                    {formatDate(customer.status === "churned" ? customer.lastActiveAt : customer.subscription.renewsAt)}
                  </DetailRow>
                </dl>
              </Section>

              <Section title="Recent activity">
                {activity.length ? (
                  <Timeline events={activity} />
                ) : (
                  <EmptyState icon={Activity} title="No activity yet" className="py-6" />
                )}
              </Section>
            </div>

            <SheetFooter className="border-t p-4">
              <Button variant="outline" onClick={() => onEdit(customer)}>
                <Pencil />
                Edit customer
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
