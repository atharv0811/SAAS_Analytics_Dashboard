import { CircleCheck, CircleX, Clock3, Landmark } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { Transaction } from "@/types";

function summarise(transactions: Transaction[]) {
  const by = (status: Transaction["status"]) => transactions.filter((transaction) => transaction.status === status);
  const total = (list: Transaction[]) => list.reduce((sum, transaction) => sum + transaction.amount, 0);
  const paid = by("paid");
  const pending = by("pending");
  const failed = by("failed");
  const refunded = by("refunded");
  const settled = paid.length + failed.length;

  return [
    {
      label: "Net volume",
      value: formatCurrency(total(paid) - paid.reduce((sum, t) => sum + t.fee, 0)),
      detail: `${formatCurrency(total(paid))} gross before fees`,
      icon: Landmark,
    },
    {
      label: "Successful",
      value: formatNumber(paid.length),
      detail: settled ? `${formatPercent((paid.length / settled) * 100, 1)} success rate` : "No settled payments",
      icon: CircleCheck,
    },
    {
      label: "Pending",
      value: formatNumber(pending.length),
      detail: `${formatCurrency(total(pending), { precise: true })} awaiting settlement`,
      icon: Clock3,
    },
    {
      label: "Failed & refunded",
      value: formatNumber(failed.length + refunded.length),
      detail: `${formatCurrency(total(failed) + total(refunded))} not collected`,
      icon: CircleX,
    },
  ];
}

export function TransactionSummary({ transactions, filtered }: { transactions: Transaction[]; filtered: boolean }) {
  const stats = summarise(transactions);
  return (
    <section
      aria-label={filtered ? "Summary of filtered transactions" : "Transaction summary"}
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map(({ label, value, detail, icon: Icon }) => (
        <Card key={label} className="flex-row items-center gap-3.5 px-4 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground">
            <Icon className="size-[18px]" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="tabular text-xl font-semibold tracking-tight">{value}</p>
            <p className="truncate text-xs text-muted-foreground">{detail}</p>
          </div>
        </Card>
      ))}
    </section>
  );
}
