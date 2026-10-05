import { Suspense } from "react";
import type { Metadata } from "next";
import { SettingsView } from "@/components/settings/settings-view";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsSkeleton } from "@/components/settings/settings-skeleton";
import { getActiveSessions, getCurrentUser, getWorkspace } from "@/services";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const [user, workspace, sessions] = await Promise.all([getCurrentUser(), getWorkspace(), getActiveSessions()]);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your profile, workspace defaults, notifications and security." />
      {/* The active tab is read from the URL, which is only known in the browser for this static page. */}
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsView user={user} workspaceName={workspace.name} sessions={sessions} />
      </Suspense>
    </div>
  );
}
