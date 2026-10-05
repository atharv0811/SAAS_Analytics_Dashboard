import { useId } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FieldControlProps {
  id: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

interface FormFieldProps {
  label: string;
  /** Validation message from React Hook Form. */
  error?: string;
  description?: string;
  className?: string;
  /** Renders the control; spread the props onto the focusable element. */
  children: (control: FieldControlProps) => React.ReactNode;
}

/** Label, control, help text and error message with correct ARIA relationships. */
export function FormField({ label, error, description, className, children }: FormFieldProps) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ");

  return (
    <div className={cn("grid content-start gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy || undefined,
      })}
      {description && (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
