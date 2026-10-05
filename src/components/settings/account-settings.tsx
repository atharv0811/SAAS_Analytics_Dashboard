"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormField } from "@/components/shared/form-field";
import { SaveButton } from "@/components/settings/save-button";
import { SettingsSection } from "@/components/settings/settings-section";
import { accountSchema, type AccountValues } from "@/lib/schemas/settings";
import { saveSettings } from "@/services/mutations";

const FORM_ID = "account-form";

const TIMEZONES = [
  { value: "Europe/Lisbon", label: "Lisbon (GMT+1)" },
  { value: "Europe/London", label: "London (GMT+1)" },
  { value: "Europe/Berlin", label: "Berlin (GMT+2)" },
  { value: "America/New_York", label: "New York (GMT−4)" },
  { value: "America/Los_Angeles", label: "Los Angeles (GMT−7)" },
  { value: "Asia/Singapore", label: "Singapore (GMT+8)" },
];

const CURRENCIES: { value: AccountValues["currency"]; label: string }[] = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
];

const FISCAL_MONTHS: { value: AccountValues["fiscalYearStart"]; label: string }[] = [
  { value: "january", label: "January" },
  { value: "april", label: "April" },
  { value: "july", label: "July" },
  { value: "october", label: "October" },
];

export function AccountSettings({ workspaceName }: { workspaceName: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty, isSubmitSuccessful },
  } = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { workspace: workspaceName, timezone: "Europe/Lisbon", currency: "USD", fiscalYearStart: "january" },
  });

  const onSubmit = async (values: AccountValues) => {
    await saveSettings(values);
    reset(values);
    toast.success("Workspace settings saved", { description: "Reports will use the new defaults." });
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Workspace"
        description="Defaults applied to every report and export in this workspace."
        footer={<SaveButton form={FORM_ID} isSubmitting={isSubmitting} isDirty={isDirty} saved={isSubmitSuccessful} />}
      >
        <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5 sm:grid-cols-2">
          <FormField label="Workspace name" error={errors.workspace?.message} className="sm:col-span-2">
            {(field) => <Input {...field} {...register("workspace")} />}
          </FormField>
          <FormField label="Time zone" error={errors.timezone?.message} description="Used for daily cut-offs">
            {(field) => (
              <Controller
                control={control}
                name="timezone"
                render={({ field: { value, onChange } }) => (
                  <Select value={value} onValueChange={onChange}>
                    <SelectTrigger {...field} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((zone) => (
                        <SelectItem key={zone.value} value={zone.value}>
                          {zone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>
          <FormField label="Reporting currency" error={errors.currency?.message} description="Applied to new exports">
            {(field) => (
              <Controller
                control={control}
                name="currency"
                render={({ field: { value, onChange } }) => (
                  <Select value={value} onValueChange={onChange}>
                    <SelectTrigger {...field} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>
          <FormField label="Fiscal year starts in" error={errors.fiscalYearStart?.message}>
            {(field) => (
              <Controller
                control={control}
                name="fiscalYearStart"
                render={({ field: { value, onChange } }) => (
                  <Select value={value} onValueChange={onChange}>
                    <SelectTrigger {...field} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FISCAL_MONTHS.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>
        </form>
      </SettingsSection>

      <SettingsSection title="Subscription" description="Your MetricFlow plan and usage this billing cycle.">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Plan", value: "Growth", detail: "$149/mo · renews Jan 14, 2027" },
            { label: "Tracked revenue", value: "$512K ARR", detail: "of $1M included" },
            { label: "Team seats", value: "4 of 10", detail: "6 seats available" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-1 font-semibold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Danger zone"
        description="Permanently delete this workspace, its data sources and all report history."
        className="ring-destructive/25"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Deleting <span className="font-medium text-foreground">{workspaceName}</span> can&apos;t be undone.
          </p>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            Delete workspace
          </Button>
        </div>
      </SettingsSection>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete ${workspaceName}?`}
        description="All dashboards, data connections and report history will be removed for every member."
        confirmLabel="Delete workspace"
        onConfirm={() =>
          toast.info("Workspace deletion is disabled in this demo", {
            description: "Nothing was deleted. In production this would schedule deletion after a 7-day grace period.",
          })
        }
      />
    </div>
  );
}
