import { PageHeaderSkeleton } from "@/components/shared/skeletons";
import { SettingsSkeleton } from "@/components/settings/settings-skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton withActions={false} />
      <SettingsSkeleton />
    </div>
  );
}
