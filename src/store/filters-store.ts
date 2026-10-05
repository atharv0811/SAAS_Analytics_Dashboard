import { create } from "zustand";
import type { DateRangeKey, PlanFilter } from "@/types";

interface FiltersState {
  /** Reporting period shared by the dashboard and analytics pages. */
  range: DateRangeKey;
  /** Plan segment applied on the analytics page. */
  plan: PlanFilter;
  setRange: (range: DateRangeKey) => void;
  setPlan: (plan: PlanFilter) => void;
}

/**
 * Report filters live in a global store so the selected period survives
 * navigation between Dashboard and Analytics and stays in sync between the
 * page header picker and individual chart controls.
 */
export const useFiltersStore = create<FiltersState>()((set) => ({
  range: "90d",
  plan: "all",
  setRange: (range) => set({ range }),
  setPlan: (plan) => set({ plan }),
}));
