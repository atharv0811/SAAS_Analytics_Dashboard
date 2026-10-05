import { z } from "zod";

export const customerFormSchema = z.object({
  name: z.string().trim().min(2, "Enter the customer's full name").max(80, "Keep the name under 80 characters"),
  email: z.email("Enter a valid email address"),
  company: z.string().trim().min(2, "Enter a company name").max(80, "Keep the company under 80 characters"),
  plan: z.enum(["starter", "professional", "business", "enterprise"]),
  billingCycle: z.enum(["monthly", "annual"]),
  status: z.enum(["active", "trialing", "past_due", "churned"]),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
