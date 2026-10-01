import { z } from "zod";

// Mirrors backend src/modules/plan/plan.validation.ts
export const planSchema = z.object({
  name: z.enum(["FREE", "BASIC", "PRO"], { required_error: "Choose a plan tier" }),
  price: z.number({ invalid_type_error: "Enter a price" }).min(0, "Price can't be negative"),
  durationDays: z
    .number({ invalid_type_error: "Enter a duration" })
    .int("Whole days only")
    .positive("Duration must be at least 1 day"),
  maxActiveAssessments: z
    .number({ invalid_type_error: "Enter a limit" })
    .int("Whole numbers only")
    .positive("Must allow at least 1 assessment"),
  maxInvitesPerAssessment: z
    .number({ invalid_type_error: "Enter a limit" })
    .int("Whole numbers only")
    .positive("Must allow at least 1 invite"),
  features: z.array(z.string().trim().min(1)).max(12, "Keep it to 12 features or fewer"),
  isActive: z.boolean(),
});
export type PlanInput = z.infer<typeof planSchema>;
