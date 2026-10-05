"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Bell, Building2, Palette, ShieldCheck, UserRound } from "lucide-react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { AccountSettings } from "@/components/settings/account-settings";
import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { SecuritySettings } from "@/components/settings/security-settings";
import type { ActiveSession, UserProfile } from "@/types";

const TABS = [
  { value: "profile", label: "Profile", icon: UserRound },
  { value: "account", label: "Account", icon: Building2 },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "appearance", label: "Appearance", icon: Palette },
  { value: "security", label: "Security", icon: ShieldCheck },
] as const;

type TabValue = (typeof TABS)[number]["value"];

function isTab(value: string | null): value is TabValue {
  return TABS.some((tab) => tab.value === value);
}

interface SettingsViewProps {
  user: UserProfile;
  workspaceName: string;
  sessions: ActiveSession[];
}

export function SettingsView({ user, workspaceName, sessions }: SettingsViewProps) {
  const searchParams = useSearchParams();
  const requested = searchParams.get("tab");
  const tab: TabValue = isTab(requested) ? requested : "profile";
  const listRef = useRef<HTMLDivElement>(null);

  // On narrow screens the tab list scrolls horizontally; keep the active tab visible.
  useEffect(() => {
    listRef.current?.querySelector('[data-state="active"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [tab]);

  // The native History API keeps the tab shareable in the URL without a server round trip.
  const changeTab = (value: string) => {
    window.history.replaceState(null, "", `?tab=${value}`);
  };

  return (
    <TabsPrimitive.Root
      value={tab}
      onValueChange={changeTab}
      activationMode="manual"
      className="flex flex-col gap-6 lg:flex-row lg:items-start"
    >
      <TabsPrimitive.List
        ref={listRef}
        aria-label="Settings sections"
        className="-mx-4 flex shrink-0 gap-1 overflow-x-auto border-b px-4 pb-2 sm:mx-0 sm:px-0 lg:sticky lg:top-20 lg:w-52 lg:flex-col lg:border-b-0 lg:pb-0"
      >
        {TABS.map(({ value, label, icon: Icon }) => (
          <TabsPrimitive.Trigger
            key={value}
            value={value}
            className="flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none hover:bg-muted/60 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=active]:bg-muted data-[state=active]:text-foreground [&_svg]:size-4"
          >
            <Icon aria-hidden="true" />
            {label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      <div className="min-w-0 flex-1">
        <TabsPrimitive.Content value="profile" className="outline-none">
          <ProfileSettings user={user} />
        </TabsPrimitive.Content>
        <TabsPrimitive.Content value="account" className="outline-none">
          <AccountSettings workspaceName={workspaceName} />
        </TabsPrimitive.Content>
        <TabsPrimitive.Content value="notifications" className="outline-none">
          <NotificationSettings />
        </TabsPrimitive.Content>
        <TabsPrimitive.Content value="appearance" className="outline-none">
          <AppearanceSettings />
        </TabsPrimitive.Content>
        <TabsPrimitive.Content value="security" className="outline-none">
          <SecuritySettings sessions={sessions} />
        </TabsPrimitive.Content>
      </div>
    </TabsPrimitive.Root>
  );
}
