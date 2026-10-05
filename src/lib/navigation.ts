import { ArrowLeftRight, ChartNoAxesCombined, LayoutDashboard, Settings, Users, type LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const PRIMARY_NAV: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Business overview and key metrics",
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: ChartNoAxesCombined,
    description: "Revenue, retention and funnel reports",
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
    description: "Accounts, plans and subscription status",
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
    description: "Payments, refunds and failed charges",
  },
];

export const SECONDARY_NAV: NavItem[] = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Profile, notifications and security",
  },
];

export const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV];

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
