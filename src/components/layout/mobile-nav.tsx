"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "@/components/layout/sidebar-content";
import type { UserProfile } from "@/types";

interface MobileNavProps {
  user: UserProfile;
  workspace: { name: string; plan: string };
}

export function MobileNav({ user, workspace }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="-ml-1 lg:hidden" aria-label="Open navigation">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 gap-0 p-0 sm:max-w-72" showCloseButton={false}>
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetDescription className="sr-only">Move between MetricFlow sections</SheetDescription>
        <SidebarContent user={user} workspace={workspace} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
