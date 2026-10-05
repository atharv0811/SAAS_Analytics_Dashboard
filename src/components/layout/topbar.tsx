"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NotificationsMenu } from "@/components/layout/notifications-menu";
import { SearchCommand } from "@/components/layout/search-command";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { ALL_NAV, isActivePath } from "@/lib/navigation";
import type { AppNotification, SearchIndex, UserProfile } from "@/types";

interface TopbarProps {
  user: UserProfile;
  workspace: { name: string; plan: string };
  notifications: AppNotification[];
  searchIndex: SearchIndex;
}

export function Topbar({ user, workspace, notifications, searchIndex }: TopbarProps) {
  const pathname = usePathname();
  const current = ALL_NAV.find((item) => isActivePath(pathname, item.href));

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 sm:gap-3 sm:px-6">
      <MobileNav user={user} workspace={workspace} />

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex items-center gap-1.5 text-sm">
          <li className="hidden sm:block">
            <Link href="/dashboard" className="rounded text-muted-foreground transition-colors hover:text-foreground">
              {workspace.name}
            </Link>
          </li>
          <li className="hidden sm:block" aria-hidden="true">
            <ChevronRight className="size-3.5 text-muted-foreground/60" />
          </li>
          <li className="truncate font-medium" aria-current="page">
            {current?.title ?? "MetricFlow"}
          </li>
        </ol>
      </nav>

      <div className="flex items-center gap-1 md:flex-1 md:justify-end md:gap-2">
        <SearchCommand index={searchIndex} />
        <div className="flex items-center gap-0.5">
          <NotificationsMenu notifications={notifications} />
          <ThemeToggle />
          <UserMenu user={user} variant="topbar" />
        </div>
      </div>
    </header>
  );
}
