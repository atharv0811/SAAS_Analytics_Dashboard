"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Laptop, Loader2, Monitor, Smartphone, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FormField } from "@/components/shared/form-field";
import { SuccessState } from "@/components/shared/states";
import { SettingsSection } from "@/components/settings/settings-section";
import { getReferenceNow } from "@/lib/dates";
import { formatRelativeTime } from "@/lib/format";
import { passwordSchema, type PasswordValues } from "@/lib/schemas/settings";
import { revokeSession, saveSettings } from "@/services/mutations";
import type { ActiveSession } from "@/types";

const PASSWORD_FORM_ID = "password-form";
const EMPTY_PASSWORD: PasswordValues = { currentPassword: "", newPassword: "", confirmPassword: "" };

function PasswordForm() {
  const [updated, setUpdated] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema), defaultValues: EMPTY_PASSWORD });

  const onSubmit = async (values: PasswordValues) => {
    await saveSettings({ passwordChanged: values.newPassword.length > 0 });
    reset(EMPTY_PASSWORD);
    setUpdated(true);
    toast.success("Password updated", { description: "Other sessions will be asked to sign in again." });
  };

  if (updated) {
    return (
      <SettingsSection title="Password" description="Use a long, unique password you don't use elsewhere.">
        <SuccessState
          title="Your password has been changed"
          description="We've emailed a confirmation to alex@kitewing.io."
          className="py-6"
          action={
            <Button variant="outline" onClick={() => setUpdated(false)}>
              Done
            </Button>
          }
        />
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title="Password"
      description="Use a long, unique password you don't use elsewhere."
      footer={
        <Button type="submit" form={PASSWORD_FORM_ID} disabled={isSubmitting} className="min-w-36">
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? "Updating…" : "Update password"}
        </Button>
      }
    >
      <form id={PASSWORD_FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Current password"
          error={errors.currentPassword?.message}
          className="sm:col-span-2 sm:max-w-[calc(50%-0.625rem)]"
        >
          {(field) => (
            <Input {...field} {...register("currentPassword")} type="password" autoComplete="current-password" />
          )}
        </FormField>
        <FormField
          label="New password"
          error={errors.newPassword?.message}
          description="At least 10 characters, one uppercase letter and one number."
        >
          {(field) => <Input {...field} {...register("newPassword")} type="password" autoComplete="new-password" />}
        </FormField>
        <FormField label="Confirm new password" error={errors.confirmPassword?.message}>
          {(field) => <Input {...field} {...register("confirmPassword")} type="password" autoComplete="new-password" />}
        </FormField>
      </form>
    </SettingsSection>
  );
}

function TwoFactorSettings() {
  const [enabled, setEnabled] = useState(true);
  const [pending, setPending] = useState(false);
  const id = useId();

  const toggle = async (next: boolean) => {
    setPending(true);
    await saveSettings({ twoFactor: next });
    setEnabled(next);
    setPending(false);
    if (next) toast.success("Two-factor authentication enabled");
    else toast.warning("Two-factor authentication disabled", { description: "Your account is now less secure." });
  };

  return (
    <SettingsSection
      title="Two-factor authentication"
      description="Require a one-time code from an authenticator app at sign-in."
    >
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-0.5">
          <Label htmlFor={id}>Authenticator app</Label>
          <p className="text-sm text-muted-foreground">
            {enabled ? "Enabled · 8 backup codes remaining" : "Not enabled. We strongly recommend turning this on."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Saving" />}
          <Switch id={id} checked={enabled} onCheckedChange={toggle} disabled={pending} />
        </div>
      </div>
    </SettingsSection>
  );
}

const DEVICE_ICONS: Record<string, LucideIcon> = { "MacBook Pro": Laptop, "iPhone 17": Smartphone };

function SessionList({ initialSessions }: { initialSessions: ActiveSession[] }) {
  const [sessions, setSessions] = useState(initialSessions);
  const [revoking, setRevoking] = useState<string | null>(null);
  const now = getReferenceNow();

  const revoke = async (session: ActiveSession) => {
    setRevoking(session.id);
    await revokeSession(session.id);
    setSessions((current) => current.filter((item) => item.id !== session.id));
    setRevoking(null);
    toast.success("Session signed out", { description: `${session.device} · ${session.location}` });
  };

  return (
    <SettingsSection title="Active sessions" description="Devices currently signed in to your account.">
      <ul className="divide-y">
        {sessions.map((session) => {
          const Icon = DEVICE_ICONS[session.device] ?? Monitor;
          return (
            <li key={session.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  {session.device} · {session.browser}
                  {session.current && (
                    <span className="rounded-md bg-success-soft px-1.5 py-0.5 text-[11px] font-medium text-success">
                      This device
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {session.location} ·{" "}
                  {session.current ? "Active now" : `Last active ${formatRelativeTime(session.lastActive, now)}`}
                </p>
              </div>
              {!session.current && (
                <Button variant="outline" size="sm" onClick={() => revoke(session)} disabled={revoking === session.id}>
                  {revoking === session.id && <Loader2 className="animate-spin" />}
                  Sign out
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </SettingsSection>
  );
}

export function SecuritySettings({ sessions }: { sessions: ActiveSession[] }) {
  return (
    <div className="space-y-6">
      <PasswordForm />
      <TwoFactorSettings />
      <SessionList initialSessions={sessions} />
    </div>
  );
}
