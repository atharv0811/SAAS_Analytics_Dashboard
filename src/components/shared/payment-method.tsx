import { CreditCard, Landmark, Wallet, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethod, Transaction } from "@/types";

export const PAYMENT_METHODS: Record<PaymentMethod, { label: string; icon: LucideIcon }> = {
  visa: { label: "Visa", icon: CreditCard },
  mastercard: { label: "Mastercard", icon: CreditCard },
  amex: { label: "American Express", icon: CreditCard },
  paypal: { label: "PayPal", icon: Wallet },
  bank_transfer: { label: "Bank transfer", icon: Landmark },
};

export function describePaymentMethod(transaction: Pick<Transaction, "paymentMethod" | "paymentLast4">) {
  const { label } = PAYMENT_METHODS[transaction.paymentMethod];
  return transaction.paymentLast4 ? `${label} •••• ${transaction.paymentLast4}` : label;
}

export function PaymentMethodLabel({
  transaction,
  className,
}: {
  transaction: Pick<Transaction, "paymentMethod" | "paymentLast4">;
  className?: string;
}) {
  const { icon: Icon } = PAYMENT_METHODS[transaction.paymentMethod];
  return (
    <span className={cn("inline-flex items-center gap-2 whitespace-nowrap text-muted-foreground", className)}>
      <span className="flex h-5 w-7 items-center justify-center rounded border bg-background">
        <Icon className="size-3.5" aria-hidden="true" />
      </span>
      {describePaymentMethod(transaction)}
    </span>
  );
}
