import { SidebarContent } from "@/components/layout/sidebar-content";
import { Topbar } from "@/components/layout/topbar";
import { getCurrentUser, getNotifications, getSearchIndex, getWorkspace } from "@/services";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, workspace, notifications, searchIndex] = await Promise.all([
    getCurrentUser(),
    getWorkspace(),
    getNotifications(),
    getSearchIndex(),
  ]);

  return (
    <div className="min-h-dvh">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-sidebar-border transition-[width] duration-200 ease-out lg:block sidebar-collapsed:w-[68px]">
        <SidebarContent user={user} workspace={workspace} collapsible />
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-col transition-[padding] duration-200 ease-out lg:pl-60 lg:sidebar-collapsed:pl-[68px]">
        <Topbar user={user} workspace={workspace} notifications={notifications} searchIndex={searchIndex} />
        <main
          id="main-content"
          className="mx-auto w-full max-w-[1440px] min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
