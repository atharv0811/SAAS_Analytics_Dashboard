import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleMinus,
  CircleX,
  Clock3,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CustomerStatus, TransactionStatus } from "@/types";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  neutral: "bg-neutral-soft text-muted-foreground",
};

interface StatusConfig {
  label: string;
  tone: Tone;
  icon: LucideIcon;
}

export const TRANSACTION_STATUS: Record<TransactionStatus, StatusConfig> = {
  paid: { label: "Paid", tone: "success", icon: CircleCheck },
  pending: { label: "Pending", tone: "warning", icon: Clock3 },
  failed: { label: "Failed", tone: "danger", icon: CircleX },
  refunded: { label: "Refunded", tone: "neutral", icon: RotateCcw },
};

export const CUSTOMER_STATUS: Record<CustomerStatus, StatusConfig> = {
  active: { label: "Active", tone: "success", icon: CircleCheck },
  trialing: { label: "Trialing", tone: "info", icon: CircleDashed },
  past_due: { label: "Past due", tone: "warning", icon: CircleAlert },
  churned: { label: "Churned", tone: "neutral", icon: CircleMinus },
};

/** Status pill that pairs colour with an icon and label, never colour alone. */
function Pill({ config, className }: { config: StatusConfig; className?: string }) {
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center gap-1 rounded-md px-2 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[config.tone],
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}

export function TransactionStatusBadge({ status, className }: { status: TransactionStatus; className?: string }) {
  return <Pill config={TRANSACTION_STATUS[status]} className={className} />;
}

export function CustomerStatusBadge({ status, className }: { status: CustomerStatus; className?: string }) {
  return <Pill config={CUSTOMER_STATUS[status]} className={className} />;
}
