import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaymentMethodLabel } from "@/components/shared/payment-method";
import { TransactionStatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Transaction } from "@/types";

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card className="gap-0 pb-0">
      <CardHeader className="border-b px-4 sm:px-6">
        <CardTitle>Recent transactions</CardTitle>
        <CardDescription>Latest charges across all customers</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" asChild>
            <Link href="/transactions">
              View all transactions
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4 sm:pl-6">Transaction ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment method</TableHead>
            <TableHead className="pr-4 sm:pr-6">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="pl-4 font-mono text-xs text-muted-foreground sm:pl-6">{transaction.id}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <UserAvatar name={transaction.customerName} size="sm" />
                  <div className="min-w-0">
                    <p className="font-medium">{transaction.customerName}</p>
                    <p className="text-xs text-muted-foreground">{transaction.company}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="tabular text-right font-medium">
                {formatCurrency(transaction.amount, { precise: true })}
              </TableCell>
              <TableCell>
                <TransactionStatusBadge status={transaction.status} />
              </TableCell>
              <TableCell>
                <PaymentMethodLabel transaction={transaction} />
              </TableCell>
              <TableCell className="pr-4 text-muted-foreground sm:pr-6">
                <time dateTime={transaction.createdAt} className="whitespace-nowrap">
                  {formatDateTime(transaction.createdAt)}
                </time>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
