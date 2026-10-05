import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SaveButtonProps {
  form: string;
  isSubmitting: boolean;
  isDirty: boolean;
  /** True after a successful save until the form is edited again. */
  saved: boolean;
  label?: string;
}

export function SaveButton({ form, isSubmitting, isDirty, saved, label = "Save changes" }: SaveButtonProps) {
  return (
    <Button type="submit" form={form} disabled={isSubmitting || !isDirty} className="min-w-28">
      {isSubmitting ? <Loader2 className="animate-spin" /> : saved && !isDirty ? <Check /> : null}
      {isSubmitting ? "Saving…" : saved && !isDirty ? "Saved" : label}
    </Button>
  );
}
