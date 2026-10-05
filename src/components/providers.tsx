"use client";

import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { usePreferencesHydrated, usePreferencesStore } from "@/store/preferences-store";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Keeps <html> in sync with persisted preferences after hydration. */
function PreferencesSync() {
  const theme = usePreferencesStore((state) => state.theme);
  const sidebarCollapsed = usePreferencesStore((state) => state.sidebarCollapsed);
  const hydrated = usePreferencesHydrated();

  useEffect(() => {
    void usePreferencesStore.persist.rehydrate();
  }, []);

  // Until stored preferences load, the pre-paint script owns <html>.
  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    const media = window.matchMedia(DARK_QUERY);
    const apply = () => {
      root.classList.toggle("dark", theme === "dark" || (theme === "system" && media.matches));
    };
    apply();
    if (theme !== "system") return;
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [hydrated, theme]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.toggleAttribute("data-sidebar-collapsed", sidebarCollapsed);
  }, [hydrated, sidebarCollapsed]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={300}>
      <PreferencesSync />
      {children}
      <Toaster position="bottom-right" closeButton />
    </TooltipProvider>
  );
}
