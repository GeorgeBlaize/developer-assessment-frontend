import { z } from "zod";
import type { Problem, ProblemType } from "@/types/api";

// ---------------------------------------------------------------------------
// Assessment details — mirrors backend assessment.validation.ts
// ---------------------------------------------------------------------------

export const assessmentDetailsSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(200, "Title is too long"),
    description: z.string().trim().min(10, "Describe the assessment in at least 10 characters"),
    durationMinutes: z
      .number({ invalid_type_error: "Enter a duration in minutes" })
      .int("Whole minutes only")
      .min(1, "At least 1 minute")
      .max(600, "Keep it under 10 hours"),
    passingScore: z.number({ invalid_type_error: "Enter a passing score" }).int("Whole marks only").min(0, "Can't be negative"),
    startWindow: z.string().optional(),
    endWindow: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startWindow && data.endWindow && new Date(data.endWindow) <= new Date(data.startWindow)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Closing time must be after the opening time", path: ["endWindow"] });
    }
  });
export type AssessmentDetailsInput = z.infer<typeof assessmentDetailsSchema>;

/** API body: datetime-local strings -> ISO, empty windows omitted. */
export function toAssessmentPayload(values: AssessmentDetailsInput) {
  return {
    title: values.title,
    description: values.description,
    durationMinutes: values.durationMinutes,
    passingScore: values.passingScore,
    ...(values.startWindow ? { startWindow: new Date(values.startWindow).toISOString() } : {}),
    ...(values.endWindow ? { endWindow: new Date(values.endWindow).toISOString() } : {}),
  };
}

// ---------------------------------------------------------------------------
// Problems — mirrors backend problem.validation.ts (flat shape, rules per type)
// ---------------------------------------------------------------------------

export const PROBLEM_TYPES: ReadonlyArray<{ value: ProblemType; label: string; hint: string }> = [
  { value: "MCQ", label: "Multiple choice", hint: "Auto-graded instantly" },
  { value: "CODING", label: "Coding", hint: "Starter code & test cases" },
  { value: "WRITTEN", label: "Written", hint: "Free-text, graded by you" },
];

export const LANGUAGES = ["javascript", "typescript", "python", "java", "sql"] as const;

export const problemSchema = z
  .object({
    type: z.enum(["CODING", "MCQ", "WRITTEN"]),
    title: z.string().trim().min(3, "Question title must be at least 3 characters").max(200, "Title is too long"),
    description: z.string().trim().min(5, "Describe the question in at least 5 characters"),
    marks: z
      .number({ invalid_type_error: "Enter marks" })
      .int("Whole marks only")
      .positive("Must be worth at least 1 mark")
      .max(1000, "That's a lot of marks"),
    options: z.array(z.object({ text: z.string().trim(), isCorrect: z.boolean() })),
    languageHint: z.string().optional(),
    starterCode: z.string().optional(),
    testCases: z.array(z.object({ input: z.string(), expectedOutput: z.string(), hidden: z.boolean() })),
    correctAnswerText: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "MCQ") {
      const filled = data.options.filter((o) => o.text);
      if (filled.length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Add at least 2 answer options", path: ["options"] });
      }
      data.options.forEach((o, i) => {
        if (!o.text) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Option can't be empty", path: ["options", i, "text"] });
      });
      const correct = data.options.filter((o) => o.isCorrect).length;
      if (correct !== 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Mark exactly one option as correct", path: ["options"] });
      }
    }
    if (data.type === "CODING") {
      data.testCases.forEach((t, i) => {
        if (!t.expectedOutput.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Expected output is required", path: ["testCases", i, "expectedOutput"] });
        }
      });
    }
  });
export type ProblemInput = z.infer<typeof problemSchema>;

export const emptyProblem = (type: ProblemType = "MCQ"): ProblemInput => ({
  type,
  title: "",
  description: "",
  marks: 10,
  options:
    type === "MCQ"
      ? [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
        ]
      : [],
  languageHint: "javascript",
  starterCode: "",
  testCases: [],
  correctAnswerText: "",
});

export function problemToInput(p: Problem): ProblemInput {
  return {
    type: p.type,
    title: p.title,
    description: p.description,
    marks: p.marks,
    options: [...p.options].sort((a, b) => a.order - b.order).map((o) => ({ text: o.text, isCorrect: Boolean(o.isCorrect) })),
    languageHint: p.languageHint ?? "javascript",
    starterCode: p.starterCode ?? "",
    testCases: (p.testCases ?? []).map((t) => ({ ...t, hidden: Boolean(t.hidden) })),
    correctAnswerText: p.correctAnswerText ?? "",
  };
}

/** API body with only the fields that apply to the question type. */
export function toProblemPayload(values: ProblemInput, { includeType = true } = {}) {
  const base = {
    ...(includeType ? { type: values.type } : {}),
    title: values.title,
    description: values.description,
    marks: values.marks,
  };
  if (values.type === "MCQ") return { ...base, options: values.options.filter((o) => o.text) };
  if (values.type === "CODING") {
    return {
      ...base,
      languageHint: values.languageHint || undefined,
      starterCode: values.starterCode || undefined,
      testCases: values.testCases,
    };
  }
  return { ...base, correctAnswerText: values.correctAnswerText || undefined };
}

// ---------------------------------------------------------------------------
// Invitations & grading
// ---------------------------------------------------------------------------

const emailSplitter = /[\s,;]+/;

export const inviteSchema = z
  .object({
    emailsText: z.string().trim().min(1, "Add at least one candidate email"),
    expiresInDays: z
      .number({ invalid_type_error: "Enter a number of days" })
      .int("Whole days only")
      .min(1, "At least 1 day")
      .max(90, "At most 90 days"),
  })
  .superRefine((data, ctx) => {
    const invalid = data.emailsText
      .split(emailSplitter)
      .filter(Boolean)
      .filter((e) => !z.string().email().safeParse(e).success);
    if (invalid.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Not valid email${invalid.length > 1 ? "s" : ""}: ${invalid.slice(0, 3).join(", ")}${invalid.length > 3 ? "…" : ""}`,
        path: ["emailsText"],
      });
    }
  });
export type InviteInput = z.infer<typeof inviteSchema>;

export function parseEmails(text: string) {
  return [...new Set(text.split(emailSplitter).map((e) => e.trim().toLowerCase()).filter(Boolean))];
}

export function gradeSchema(maxMarks: number) {
  return z.object({
    awardedMarks: z
      .number({ invalid_type_error: "Enter a mark" })
      .int("Whole marks only")
      .min(0, "Can't be negative")
      .max(maxMarks, `Maximum for this question is ${maxMarks}`),
    feedback: z.string().trim().max(2000, "Keep feedback under 2000 characters").optional(),
  });
}
export type GradeInput = z.infer<ReturnType<typeof gradeSchema>>;
