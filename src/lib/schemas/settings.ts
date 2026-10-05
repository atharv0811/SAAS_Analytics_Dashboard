import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60, "Name must be 60 characters or fewer"),
  email: z.email("Enter a valid email address"),
  company: z.string().trim().min(2, "Company must be at least 2 characters").max(60),
  role: z.string().trim().min(2, "Role must be at least 2 characters").max(60),
  bio: z.string().trim().max(160, "Bio must be 160 characters or fewer"),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const accountSchema = z.object({
  workspace: z.string().trim().min(2, "Workspace name must be at least 2 characters").max(40),
  timezone: z.string().min(1, "Choose a time zone"),
  currency: z.enum(["USD", "EUR", "GBP"]),
  fiscalYearStart: z.enum(["january", "april", "july", "october"]),
});
export type AccountValues = z.infer<typeof accountSchema>;

export const notificationsSchema = z.object({
  emailNotifications: z.boolean(),
  productUpdates: z.boolean(),
  weeklyReports: z.boolean(),
  securityAlerts: z.boolean(),
  failedPayments: z.boolean(),
});
export type NotificationValues = z.infer<typeof notificationsSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(10, "Use at least 10 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    path: ["newPassword"],
    message: "Choose a password you haven't used before",
  });
export type PasswordValues = z.infer<typeof passwordSchema>;
