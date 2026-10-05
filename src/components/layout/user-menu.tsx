"use client";

import Link from "next/link";
import { BellRing, ChevronsUpDown, CreditCard, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types";

const MENU_LINKS = [
  { label: "Profile", href: "/settings?tab=profile", icon: UserRound },
  { label: "Account & billing", href: "/settings?tab=account", icon: CreditCard },
  { label: "Notifications", href: "/settings?tab=notifications", icon: BellRing },
  { label: "Security", href: "/settings?tab=security", icon: ShieldCheck },
];

interface UserMenuProps {
  user: UserProfile;
  variant: "sidebar" | "topbar";
}

export function UserMenu({ user, variant }: UserMenuProps) {
  const handleSignOut = () => {
    toast.info("Sign-out is disabled in this demo", {
      description: "MetricFlow is a portfolio project, so the session stays signed in.",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "sidebar" ? (
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors outline-none",
              "hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:bg-sidebar-accent",
              "lg:sidebar-collapsed:justify-center lg:sidebar-collapsed:p-1",
            )}
            aria-label={`Account menu for ${user.name}`}
          >
            <UserAvatar name={user.name} />
            <span className="min-w-0 flex-1 lg:sidebar-collapsed:hidden">
              <span className="block truncate text-sm font-medium text-sidebar-accent-foreground">{user.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
            </span>
            <ChevronsUpDown className="size-4 text-muted-foreground lg:sidebar-collapsed:hidden" />
          </button>
        ) : (
          <Button variant="ghost" size="icon" className="rounded-full" aria-label={`Account menu for ${user.name}`}>
            <UserAvatar name={user.name} size="sm" className="size-7" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={variant === "sidebar" ? "start" : "end"}
        side={variant === "sidebar" ? "top" : "bottom"}
        className="w-60"
      >
        <DropdownMenuLabel className="flex items-center gap-2.5 py-2 font-normal">
          <UserAvatar name={user.name} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-foreground">{user.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{user.role}</span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {MENU_LINKS.map(({ label, href, icon: Icon }) => (
            <DropdownMenuItem key={href} asChild>
              <Link href={href}>
                <Icon />
                {label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
