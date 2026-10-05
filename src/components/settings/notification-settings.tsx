"use client";

import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SaveButton } from "@/components/settings/save-button";
import { SettingsSection } from "@/components/settings/settings-section";
import { notificationsSchema, type NotificationValues } from "@/lib/schemas/settings";
import { saveSettings } from "@/services/mutations";

const FORM_ID = "notifications-form";

const OPTIONS: { name: keyof NotificationValues; label: string; description: string }[] = [
  {
    name: "emailNotifications",
    label: "Email notifications",
    description: "Activity on dashboards you follow, mentions and shared reports.",
  },
  {
    name: "failedPayments",
    label: "Failed payment alerts",
    description: "An email as soon as a customer's renewal can't be collected.",
  },
  {
    name: "weeklyReports",
    label: "Weekly reports",
    description: "Revenue, churn and growth summary every Monday at 8:00 AM.",
  },
  {
    name: "productUpdates",
    label: "Product updates",
    description: "New features, improvements and the occasional changelog.",
  },
  {
    name: "securityAlerts",
    label: "Security alerts",
    description: "New sign-ins, password changes and API key activity.",
  },
];

function NotificationRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-6 py-4 first:pt-0 last:pb-0">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p id={`${id}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={`${id}-description`}
        className="mt-0.5"
      />
    </div>
  );
}

export function NotificationSettings() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty, isSubmitSuccessful },
  } = useForm<NotificationValues>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      emailNotifications: true,
      failedPayments: true,
      weeklyReports: true,
      productUpdates: false,
      securityAlerts: true,
    },
  });

  const onSubmit = async (values: NotificationValues) => {
    await saveSettings(values);
    reset(values);
    toast.success("Notification preferences saved");
  };

  return (
    <SettingsSection
      title="Notifications"
      description="Choose which emails MetricFlow sends to alex@kitewing.io."
      footer={<SaveButton form={FORM_ID} isSubmitting={isSubmitting} isDirty={isDirty} saved={isSubmitSuccessful} />}
    >
      <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="divide-y">
        {OPTIONS.map((option) => (
          <Controller
            key={option.name}
            control={control}
            name={option.name}
            render={({ field }) => (
              <NotificationRow
                label={option.label}
                description={
                  option.name === "securityAlerts"
                    ? `${option.description} Required for workspace owners.`
                    : option.description
                }
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={option.name === "securityAlerts"}
              />
            )}
          />
        ))}
      </form>
    </SettingsSection>
  );
}
