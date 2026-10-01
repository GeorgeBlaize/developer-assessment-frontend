import { z } from "zod";

// Mirrors backend src/modules/user/user.validation.ts (updateMeValidation).
const optionalUrl = z
  .string()
  .trim()
  .url("Enter a full URL, including https://")
  .optional()
  .or(z.literal(""));

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  // company
  companyName: z.string().trim().max(150, "Company name is too long").optional(),
  website: optionalUrl,
  industry: z.string().trim().max(80, "Industry is too long").optional(),
  // candidate
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,20}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  resumeUrl: optionalUrl,
  skills: z.array(z.string().trim().min(1).max(40)).max(25, "Up to 25 skills"),
});
export type ProfileInput = z.infer<typeof profileSchema>;

/** Builds the PATCH /users/me body: only fields relevant to the role, without empty strings. */
export function toProfilePayload(values: ProfileInput, role: "ADMIN" | "COMPANY" | "CANDIDATE") {
  const clean = (v?: string) => (v && v.trim() ? v.trim() : undefined);
  if (role === "COMPANY") {
    return {
      name: values.name,
      companyName: clean(values.companyName),
      website: clean(values.website),
      industry: clean(values.industry),
    };
  }
  if (role === "CANDIDATE") {
    return { name: values.name, phone: clean(values.phone), resumeUrl: clean(values.resumeUrl), skills: values.skills };
  }
  return { name: values.name };
}
