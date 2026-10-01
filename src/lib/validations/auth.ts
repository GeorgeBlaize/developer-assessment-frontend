import { z } from "zod";

// Mirrors backend src/modules/auth/auth.validation.ts so users see the same rules before submitting.

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    role: z.enum(["COMPANY", "CANDIDATE"], { required_error: "Choose how you'll use CodeAssess" }),
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    companyName: z.string().trim().max(150, "Company name is too long").optional(),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9\s-]{7,20}$/, "Enter a valid phone number")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Passwords do not match", path: ["confirmPassword"] });
    }
    if (data.role === "COMPANY" && (!data.companyName || data.companyName.length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Company name is required (at least 2 characters)",
        path: ["companyName"],
      });
    }
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm the new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.newPassword !== d.oldPassword, {
    message: "New password must differ from the current one",
    path: ["newPassword"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
