import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { PREFERENCES_STORAGE_KEY } from "@/lib/constants";

export type ThemePreference = "light" | "dark" | "system";

interface PreferencesState {
  theme: ThemePreference;
  sidebarCollapsed: boolean;
  setTheme: (theme: ThemePreference) => void;
  toggleSidebar: () => void;
}

/**
 * Global, persisted UI preferences. Hydration is deferred (`skipHydration`)
 * and triggered after mount, so the server render and first client render
 * always agree.
 */
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: "system",
      sidebarCollapsed: false,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ theme, sidebarCollapsed }) => ({ theme, sidebarCollapsed }),
      skipHydration: true,
    },
  ),
);

const subscribeToHydration = (callback: () => void) => usePreferencesStore.persist.onFinishHydration(callback);

/** True once persisted preferences have been loaded from storage. */
export function usePreferencesHydrated() {
  return useSyncExternalStore(
    subscribeToHydration,
    () => usePreferencesStore.persist.hasHydrated(),
    () => false,
  );
}
