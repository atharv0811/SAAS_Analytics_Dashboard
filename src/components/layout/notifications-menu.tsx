"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, ChartColumn, CreditCard, Server, UserPlus, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatRelativeTime } from "@/lib/format";
import { getReferenceNow } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/types";

const CATEGORY_ICONS: Record<AppNotification["category"], LucideIcon> = {
  billing: CreditCard,
  customers: UserPlus,
  system: Server,
  reports: ChartColumn,
};

export function NotificationsMenu({ notifications }: { notifications: AppNotification[] }) {
  const [items, setItems] = useState(notifications);
  const unread = items.filter((item) => !item.read).length;
  const now = getReferenceNow();

  const markRead = (id: string) =>
    setItems((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        >
          <Bell />
          {unread > 0 && (
            <span className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4 font-semibold text-primary-foreground ring-2 ring-background">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(24rem,calc(100vw-2rem))] gap-0 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">{unread ? `${unread} unread` : "You're all caught up"}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={!unread}
            onClick={() => setItems((current) => current.map((item) => ({ ...item, read: true })))}
          >
            Mark all as read
          </Button>
        </div>
        <ul className="max-h-[22rem] divide-y overflow-y-auto" aria-label="Notification list">
          {items.map((item) => {
            const Icon = CATEGORY_ICONS[item.category];
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => markRead(item.id)}
                  className="flex w-full gap-3 px-4 py-3 text-left transition-colors outline-none hover:bg-muted/60 focus-visible:bg-muted/60"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className={cn("text-sm", item.read ? "font-normal" : "font-medium")}>{item.title}</span>
                      {!item.read && (
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary">
                          <span className="sr-only">Unread</span>
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      {item.description}
                    </span>
                    <time dateTime={item.createdAt} className="mt-1 block text-xs text-muted-foreground/80">
                      {formatRelativeTime(item.createdAt, now)}
                    </time>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="/settings?tab=notifications">Notification settings</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
