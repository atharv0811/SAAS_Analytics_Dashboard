"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BrandMark } from "@/components/layout/brand-mark";
import { UserMenu } from "@/components/layout/user-menu";
import { PRIMARY_NAV, SECONDARY_NAV, isActivePath, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { usePreferencesStore } from "@/store/preferences-store";
import type { UserProfile } from "@/types";

interface SidebarContentProps {
  user: UserProfile;
  workspace: { name: string; plan: string };
  /** Desktop sidebar supports collapsing; the mobile drawer never collapses. */
  collapsible?: boolean;
  onNavigate?: () => void;
}

/*
 * Collapsed styling is driven by a `data-sidebar-collapsed` attribute on
 * <html> (see the `sidebar-collapsed` variant) so the persisted state is
 * applied before first paint with no layout shift.
 */
function NavLink({
  item,
  active,
  showTooltip,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  showTooltip: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/nav flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm font-medium transition-colors outline-none",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        "lg:sidebar-collapsed:justify-center lg:sidebar-collapsed:px-0",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_var(--sidebar-border)]"
          : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon
        className={cn(
          "size-[18px] shrink-0 transition-colors",
          active ? "text-primary" : "text-muted-foreground group-hover/nav:text-sidebar-accent-foreground",
        )}
        aria-hidden="true"
      />
      <span className="truncate lg:sidebar-collapsed:sr-only">{item.title}</span>
    </Link>
  );

  if (!showTooltip) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.title}</TooltipContent>
    </Tooltip>
  );
}

export function SidebarContent({ user, workspace, collapsible = false, onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const collapsed = usePreferencesStore((state) => state.sidebarCollapsed);
  const toggleSidebar = usePreferencesStore((state) => state.toggleSidebar);
  const showTooltips = collapsible && collapsed;

  const renderItems = (items: NavItem[]) =>
    items.map((item) => (
      <li key={item.href}>
        <NavLink
          item={item}
          active={isActivePath(pathname, item.href)}
          showTooltip={showTooltips}
          onNavigate={onNavigate}
        />
      </li>
    ));

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4 lg:sidebar-collapsed:justify-center lg:sidebar-collapsed:px-0">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <BrandMark />
          <span className="min-w-0 lg:sidebar-collapsed:hidden">
            <span className="block text-[15px] leading-tight font-semibold tracking-tight text-sidebar-accent-foreground">
              MetricFlow
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {workspace.name} · {workspace.plan}
            </span>
          </span>
        </Link>
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
        <div>
          <p className="mb-1.5 px-2.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase lg:sidebar-collapsed:sr-only">
            Workspace
          </p>
          <ul className="flex flex-col gap-0.5">{renderItems(PRIMARY_NAV)}</ul>
        </div>
        <div className="mt-auto">
          <ul className="flex flex-col gap-0.5">{renderItems(SECONDARY_NAV)}</ul>
          {collapsible && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleSidebar}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  className="mt-0.5 flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-sm font-medium text-sidebar-foreground transition-colors outline-none hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 lg:sidebar-collapsed:justify-center lg:sidebar-collapsed:px-0"
                >
                  <PanelLeftClose
                    className="size-[18px] text-muted-foreground lg:sidebar-collapsed:hidden"
                    aria-hidden="true"
                  />
                  <PanelLeftOpen
                    className="hidden size-[18px] text-muted-foreground lg:sidebar-collapsed:block"
                    aria-hidden="true"
                  />
                  <span className="lg:sidebar-collapsed:sr-only">Collapse</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{collapsed ? "Expand sidebar" : "Collapse sidebar"}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-3 lg:sidebar-collapsed:px-2">
        <UserMenu user={user} variant="sidebar" />
      </div>
    </div>
  );
}
