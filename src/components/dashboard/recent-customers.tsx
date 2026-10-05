import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerStatusBadge } from "@/components/shared/status-badge";
import { PlanBadge } from "@/components/shared/plan-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatShortDate } from "@/lib/format";
import type { Customer } from "@/types";

export function RecentCustomers({ customers, className }: { customers: Customer[]; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>Recent customers</CardTitle>
        <CardDescription>Newest accounts and trials</CardDescription>
      </CardHeader>
      <ul className="flex-1 divide-y px-4 sm:px-6">
        {customers.map((customer) => (
          <li key={customer.id} className="flex items-center gap-3 py-3 first:pt-0">
            <UserAvatar name={customer.name} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">{customer.name}</p>
                <time dateTime={customer.joinedAt} className="shrink-0 text-xs text-muted-foreground">
                  {formatShortDate(customer.joinedAt)}
                </time>
              </div>
              <p className="truncate text-xs text-muted-foreground">{customer.email}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <PlanBadge plan={customer.subscription.plan} />
                <CustomerStatusBadge status={customer.status} />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <CardFooter className="bg-transparent px-4 py-3 sm:px-6">
        <Button variant="ghost" size="sm" className="-ml-2.5" asChild>
          <Link href="/customers">
            View all customers
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
