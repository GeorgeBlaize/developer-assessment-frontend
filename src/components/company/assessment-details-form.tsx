"use client";

import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, fieldA11y } from "@/components/shared/form-field";
import { assessmentDetailsSchema, type AssessmentDetailsInput } from "@/lib/validations/assessment";

interface AssessmentDetailsFormProps {
  id: string;
  defaultValues?: Partial<AssessmentDetailsInput>;
  onSubmit: (values: AssessmentDetailsInput) => void;
  /** Rendered under the fields (submit buttons etc). */
  footer?: ReactNode;
}

/** Title, description, timing rules and availability window. Shared by the wizard and the edit dialog. */
export function AssessmentDetailsForm({ id, defaultValues, onSubmit, footer }: AssessmentDetailsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssessmentDetailsInput>({
    resolver: zodResolver(assessmentDetailsSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      description: "",
      durationMinutes: 45,
      passingScore: 0,
      startWindow: "",
      endWindow: "",
      ...defaultValues,
    },
  });

  const f = (name: string) => `${id}-${name}`;

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormField label="Title" htmlFor={f("title")} error={errors.title?.message} required>
        <Input
          {...fieldA11y(f("title"), errors.title?.message)}
          placeholder="e.g. Senior Backend Engineer Screening"
          {...register("title")}
        />
      </FormField>
      <FormField
        label="Description & instructions"
        htmlFor={f("description")}
        error={errors.description?.message}
        description="Candidates read this before they start the timer."
        required
      >
        <Textarea {...fieldA11y(f("description"), errors.description?.message)} rows={4} {...register("description")} />
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Duration (minutes)" htmlFor={f("duration")} error={errors.durationMinutes?.message} required>
          <Input
            {...fieldA11y(f("duration"), errors.durationMinutes?.message)}
            type="number"
            min={1}
            max={600}
            {...register("durationMinutes", { valueAsNumber: true })}
          />
        </FormField>
        <FormField
          label="Passing score (marks)"
          htmlFor={f("passing")}
          error={errors.passingScore?.message}
          description="Minimum total marks to pass."
          required
        >
          <Input
            {...fieldA11y(f("passing"), errors.passingScore?.message)}
            type="number"
            min={0}
            {...register("passingScore", { valueAsNumber: true })}
          />
        </FormField>
        <FormField label="Opens at" htmlFor={f("start")} error={errors.startWindow?.message} description="Optional">
          <Input {...fieldA11y(f("start"), errors.startWindow?.message)} type="datetime-local" {...register("startWindow")} />
        </FormField>
        <FormField label="Closes at" htmlFor={f("end")} error={errors.endWindow?.message} description="Optional">
          <Input {...fieldA11y(f("end"), errors.endWindow?.message)} type="datetime-local" {...register("endWindow")} />
        </FormField>
      </div>
      {footer}
    </form>
  );
}
