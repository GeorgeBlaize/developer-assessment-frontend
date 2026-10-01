"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, fieldA11y } from "@/components/shared/form-field";
import { useGradeSubmission } from "@/hooks/queries/use-company";
import { gradeSchema, type GradeInput } from "@/lib/validations/assessment";
import type { CompanySubmission } from "@/types/api";

export function GradeForm({ assessmentId, submission }: { assessmentId: string; submission: CompanySubmission }) {
  const max = submission.problem.marks;
  const schema = useMemo(() => gradeSchema(max), [max]);
  const grade = useGradeSubmission(assessmentId);
  const id = `grade-${submission.id}`;
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<GradeInput>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { awardedMarks: submission.awardedMarks ?? undefined, feedback: submission.feedback ?? "" },
  });

  return (
    <form
      onSubmit={handleSubmit((v) => grade.mutate({ submissionId: submission.id, awardedMarks: v.awardedMarks, feedback: v.feedback }))}
      noValidate
      className="grid gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-[180px_1fr]"
    >
      <FormField label={`Marks (0–${max})`} htmlFor={`${id}-marks`} error={errors.awardedMarks?.message} required>
        <div className="space-y-2">
          <Input
            {...fieldA11y(`${id}-marks`, errors.awardedMarks?.message)}
            type="number"
            min={0}
            max={max}
            {...register("awardedMarks", { valueAsNumber: true })}
          />
          <div className="flex gap-1">
            {[0, Math.round(max / 2), max].map((v) => (
              <Button
                key={v}
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setValue("awardedMarks", v, { shouldDirty: true, shouldValidate: true })}
              >
                {v}
              </Button>
            ))}
          </div>
        </div>
      </FormField>
      <FormField label="Feedback for the candidate" htmlFor={`${id}-feedback`} error={errors.feedback?.message}>
        <Textarea {...fieldA11y(`${id}-feedback`, errors.feedback?.message)} rows={3} {...register("feedback")} />
      </FormField>
      <div className="flex justify-end sm:col-span-2">
        <Button type="submit" size="sm" disabled={grade.isPending || !isDirty}>
          {grade.isPending ? <Loader2 className="animate-spin" /> : <Save />}
          {submission.status === "MANUALLY_GRADED" ? "Update grade" : "Save grade"}
        </Button>
      </div>
    </form>
  );
}
