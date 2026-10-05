"use client";

import { useId } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { THEME_OPTIONS } from "@/components/layout/theme-toggle";
import { SettingsSection } from "@/components/settings/settings-section";
import { cn } from "@/lib/utils";
import { usePreferencesHydrated, usePreferencesStore, type ThemePreference } from "@/store/preferences-store";

/** Miniature app window rendered in the theme it represents. */
function ThemePreview({ variant }: { variant: "light" | "dark" }) {
  const dark = variant === "dark";
  return (
    <div className={cn("flex h-20 overflow-hidden rounded-md border", dark ? "bg-[#111214]" : "bg-[#f7f7f6]")}>
      <div className={cn("w-1/4 border-r", dark ? "border-white/10 bg-[#17181a]" : "border-black/5 bg-white")} />
      <div className="flex-1 space-y-1.5 p-2">
        <div className={cn("h-1.5 w-1/2 rounded-full", dark ? "bg-white/30" : "bg-black/20")} />
        <div className="grid grid-cols-2 gap-1.5">
          <div className={cn("h-6 rounded", dark ? "bg-[#1d1e21]" : "bg-white")} />
          <div className={cn("h-6 rounded", dark ? "bg-[#1d1e21]" : "bg-white")} />
        </div>
        <div className="h-1.5 w-3/4 rounded-full bg-[#2a78d6]/70" />
      </div>
    </div>
  );
}

export function AppearanceSettings() {
  const theme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const collapsed = usePreferencesStore((state) => state.sidebarCollapsed);
  const toggleSidebar = usePreferencesStore((state) => state.toggleSidebar);
  const hydrated = usePreferencesHydrated();
  const sidebarSwitchId = useId();

  const changeTheme = (value: string) => {
    const option = THEME_OPTIONS.find((item) => item.value === value);
    if (!option) return;
    setTheme(option.value);
    toast.success(`${option.label} theme applied`, { description: "Saved to this browser." });
  };

  return (
    <SettingsSection title="Appearance" description="Personalise how MetricFlow looks on this device.">
      <fieldset className="space-y-3">
        <legend className="mb-3 text-sm font-medium">Theme</legend>
        <RadioGroup
          value={hydrated ? theme : ""}
          onValueChange={changeTheme}
          className="grid gap-3 sm:grid-cols-3"
          aria-label="Theme"
        >
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
            const selected = hydrated && theme === value;
            return (
              <Label
                key={value}
                className={cn(
                  "relative flex cursor-pointer flex-col items-stretch gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/40",
                  "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                  selected && "border-primary ring-1 ring-primary",
                )}
              >
                <RadioGroupItem value={value} className="sr-only" />
                {value === "system" ? (
                  <div className="grid grid-cols-2 overflow-hidden rounded-md">
                    <ThemePreview variant="light" />
                    <ThemePreview variant="dark" />
                  </div>
                ) : (
                  <ThemePreview variant={value as Exclude<ThemePreference, "system">} />
                )}
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                  {label}
                  {selected && <Check className="ml-auto size-4 text-primary" aria-hidden="true" />}
                </span>
              </Label>
            );
          })}
        </RadioGroup>
        <p className="text-xs text-muted-foreground">
          System follows your operating system&apos;s light or dark setting.
        </p>
      </fieldset>

      <div className="mt-6 flex items-start justify-between gap-6 border-t pt-5">
        <div className="space-y-0.5">
          <Label htmlFor={sidebarSwitchId}>Compact sidebar</Label>
          <p className="text-sm text-muted-foreground">Show navigation as icons only on desktop screens.</p>
        </div>
        <Switch id={sidebarSwitchId} checked={hydrated && collapsed} onCheckedChange={toggleSidebar} />
      </div>
    </SettingsSection>
  );
}
