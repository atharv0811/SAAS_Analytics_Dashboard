import type { ActiveSession, AppNotification, UserProfile } from "@/types";

export const CURRENT_USER: UserProfile = {
  name: "Alex Morgan",
  email: "alex@kitewing.io",
  company: "Kitewing",
  role: "Head of Revenue Operations",
  initials: "AM",
};

export const WORKSPACE = {
  name: "Kitewing",
  plan: "Growth workspace",
};

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "ntf-1",
    title: "Payment failed for Quarry Learning",
    description: "The Enterprise renewal could not be collected. An automatic retry is scheduled in 3 days.",
    createdAt: "2026-10-05T08:52:00.000Z",
    category: "billing",
    read: false,
  },
  {
    id: "ntf-2",
    title: "MRR crossed $42,500",
    description: "Monthly recurring revenue reached a new high, up 10.7% over the last 90 days.",
    createdAt: "2026-10-05T06:10:00.000Z",
    category: "reports",
    read: false,
  },
  {
    id: "ntf-3",
    title: "3 enterprise trials started",
    description: "New trial workspaces were created from the pricing page this week.",
    createdAt: "2026-10-04T15:24:00.000Z",
    category: "customers",
    read: false,
  },
  {
    id: "ntf-4",
    title: "Weekly revenue report is ready",
    description: "Your summary for Sep 28 – Oct 4 has been generated and emailed to 4 recipients.",
    createdAt: "2026-10-04T07:00:00.000Z",
    category: "reports",
    read: true,
  },
  {
    id: "ntf-5",
    title: "Stripe webhook latency recovered",
    description: "Event delivery is back to normal after a 12 minute delay. No data was lost.",
    createdAt: "2026-10-02T19:45:00.000Z",
    category: "system",
    read: true,
  },
];

export const ACTIVE_SESSIONS: ActiveSession[] = [
  {
    id: "ses-1",
    device: "MacBook Pro",
    browser: "Chrome 141",
    location: "Lisbon, Portugal",
    lastActive: "2026-10-05T09:41:00.000Z",
    current: true,
  },
  {
    id: "ses-2",
    device: "iPhone 17",
    browser: "Safari",
    location: "Lisbon, Portugal",
    lastActive: "2026-10-04T21:12:00.000Z",
    current: false,
  },
  {
    id: "ses-3",
    device: "Windows desktop",
    browser: "Edge 140",
    location: "Porto, Portugal",
    lastActive: "2026-09-29T14:03:00.000Z",
    current: false,
  },
];
