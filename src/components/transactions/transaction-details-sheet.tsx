"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PaymentMethodLabel } from "@/components/shared/payment-method";
import { PlanBadge } from "@/components/shared/plan-badge";
import { TransactionStatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getTransactionTimeline } from "@/lib/timeline";
import { refundTransaction } from "@/services/mutations";
import { useSelectionStore } from "@/store/selection-store";
import type { Transaction } from "@/types";

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
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium">{children}</dd>
    </div>
  );
}

interface TransactionDetailsSheetProps {
  transaction: Transaction | null;
  onOpenChange: (open: boolean) => void;
  onRefunded: (id: string) => void;
}

export function TransactionDetailsSheet({
  transaction: selected,
  onOpenChange,
  onRefunded,
}: TransactionDetailsSheetProps) {
  // Keep showing the last record while the sheet animates closed.
  const [transaction, setTransaction] = useState(selected);
  if (selected && selected !== transaction) setTransaction(selected);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const selectCustomer = useSelectionStore((state) => state.selectCustomer);
  const timeline = useMemo(() => (transaction ? getTransactionTimeline(transaction) : []), [transaction]);

  if (!transaction) return null;

  const net = transaction.status === "failed" ? 0 : transaction.amount - transaction.fee;

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(transaction.id);
      toast.success("Transaction ID copied", { description: transaction.id });
    } catch {
      toast.error("Couldn't access the clipboard");
    }
  };

  const refund = async () => {
    setRefunding(true);
    await refundTransaction(transaction.id);
    setRefunding(false);
    onRefunded(transaction.id);
    toast.success("Refund issued", {
      description: `${formatCurrency(transaction.amount, { precise: true })} returned to ${transaction.customerName}.`,
    });
  };

  return (
    <>
      <Sheet open={selected !== null} onOpenChange={onOpenChange}>
        <SheetContent className="w-full gap-0 sm:max-w-md">
          <SheetHeader className="border-b p-5">
            <SheetDescription className="font-mono text-xs">{transaction.id}</SheetDescription>
            <SheetTitle className="tabular text-2xl font-semibold tracking-tight">
              {formatCurrency(transaction.amount, { precise: true })}
            </SheetTitle>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <TransactionStatusBadge status={transaction.status} />
              <span className="text-xs text-muted-foreground">{formatDateTime(transaction.createdAt)} UTC</span>
            </div>
          </SheetHeader>

          <div className="flex-1 space-y-7 overflow-y-auto p-5">
            {transaction.failureReason && (
              <p
                className="rounded-lg border border-danger/25 bg-danger-soft px-3 py-2.5 text-sm text-danger"
                role="note"
              >
                {transaction.failureReason}
              </p>
            )}

            <Section title="Transaction">
              <dl className="divide-y rounded-lg border px-3">
                <DetailRow label="Description">{transaction.description}</DetailRow>
                <DetailRow label="Invoice">
                  <span className="font-mono text-xs">{transaction.invoiceId}</span>
                </DetailRow>
                <DetailRow label="Created">{formatDateTime(transaction.createdAt)}</DetailRow>
              </dl>
            </Section>

            <Section title="Customer">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <UserAvatar name={transaction.customerName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{transaction.customerName}</p>
                  <p className="truncate text-xs text-muted-foreground">{transaction.customerEmail}</p>
                </div>
                <PlanBadge plan={transaction.plan} />
              </div>
              <Button variant="link" size="sm" className="h-auto px-0" asChild>
                <Link href="/customers" onClick={() => selectCustomer(transaction.customerId)}>
                  View customer profile
                </Link>
              </Button>
            </Section>

            <Section title="Payment">
              <dl className="divide-y rounded-lg border px-3">
                <DetailRow label="Method">
                  <PaymentMethodLabel transaction={transaction} className="text-foreground" />
                </DetailRow>
                <DetailRow label="Amount">{formatCurrency(transaction.amount, { precise: true })}</DetailRow>
                <DetailRow label="Processing fee">
                  {transaction.fee ? `−${formatCurrency(transaction.fee, { precise: true })}` : "—"}
                </DetailRow>
                <DetailRow label="Net">{formatCurrency(net, { precise: true })}</DetailRow>
              </dl>
            </Section>

            <Section title="Activity">
              <Timeline events={timeline} />
            </Section>
          </div>

          <SheetFooter className="flex-row gap-2 border-t p-4">
            <Button variant="outline" className="flex-1" onClick={copyId}>
              <Copy />
              Copy ID
            </Button>
            {transaction.status === "paid" && (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => setConfirmOpen(true)}
                disabled={refunding}
              >
                {refunding ? <Loader2 className="animate-spin" /> : <RotateCcw />}
                {refunding ? "Refunding…" : "Issue refund"}
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Refund ${formatCurrency(transaction.amount, { precise: true })}?`}
        description={`The full amount is returned to ${transaction.customerName}'s original payment method. Processing fees are not returned.`}
        confirmLabel="Issue refund"
        onConfirm={refund}
      />
    </>
  );
}
