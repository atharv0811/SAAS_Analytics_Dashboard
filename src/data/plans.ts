import type { Plan, PlanId } from "@/types";

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: "starter",
    name: "Starter",
    monthlyPrice: 9,
    description: "Core dashboards for solo founders",
  },
  professional: {
    id: "professional",
    name: "Professional",
    monthlyPrice: 19,
    description: "Cohorts, forecasting and team seats",
  },
  business: {
    id: "business",
    name: "Business",
    monthlyPrice: 39,
    description: "Advanced segmentation and API access",
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 96,
    description: "Custom contracts, SSO and audit logs",
  },
};

export const PLAN_IDS = Object.keys(PLANS) as PlanId[];
