import type { LucideIcon } from "lucide-react";
import { CircleAlert, CircleCheck, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StateProps {
  title: string;
  description?: string;
  className?: string;
}

function StateLayout({
  icon: Icon,
  iconClassName,
  title,
  description,
  className,
  children,
  role,
}: StateProps & {
  icon: LucideIcon;
  iconClassName?: string;
  children?: React.ReactNode;
  role?: "alert" | "status";
}) {
  return (
    <div role={role} className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      <span className={cn("flex size-11 items-center justify-center rounded-xl border bg-muted/60", iconClassName)}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {children && <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{children}</div>}
    </div>
  );
}

export function EmptyState({ icon, action, ...props }: StateProps & { icon: LucideIcon; action?: React.ReactNode }) {
  return (
    <StateLayout icon={icon} iconClassName="text-muted-foreground" role="status" {...props}>
      {action}
    </StateLayout>
  );
}

export function ErrorState({
  onRetry,
  title = "Something went wrong",
  description = "We couldn't load this data. Check your connection and try again.",
  className,
}: Partial<StateProps> & { onRetry?: () => void }) {
  return (
    <StateLayout
      icon={CircleAlert}
      iconClassName="border-danger/20 bg-danger-soft text-danger"
      title={title}
      description={description}
      className={className}
      role="alert"
    >
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RotateCw />
          Try again
        </Button>
      )}
    </StateLayout>
  );
}

export function SuccessState({ action, ...props }: StateProps & { action?: React.ReactNode }) {
  return (
    <StateLayout
      icon={CircleCheck}
      iconClassName="border-success/20 bg-success-soft text-success"
      role="status"
      {...props}
    >
      {action}
    </StateLayout>
  );
}
