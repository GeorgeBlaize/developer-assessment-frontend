"use client";

import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Code2, FileText, ListChecks, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField, fieldA11y } from "@/components/shared/form-field";
import { LazyCodeEditor } from "@/components/shared/lazy-code-editor";
import { LANGUAGES, PROBLEM_TYPES, emptyProblem, problemSchema, type ProblemInput } from "@/lib/validations/assessment";
import { cn } from "@/lib/utils";
import type { ProblemType } from "@/types/api";

const TYPE_ICONS: Record<ProblemType, typeof Code2> = { MCQ: ListChecks, CODING: Code2, WRITTEN: FileText };
const MAX_OPTIONS = 8;

interface ProblemFormProps {
  id: string;
  defaultValues?: ProblemInput;
  onSubmit: (values: ProblemInput) => void;
  onCancel?: () => void;
  submitLabel?: string;
  pending?: boolean;
  /** The API can't change a question's type after creation. */
  lockType?: boolean;
}

export function ProblemForm({ id, defaultValues, onSubmit, onCancel, submitLabel = "Save question", pending, lockType }: ProblemFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm<ProblemInput>({
    resolver: zodResolver(problemSchema),
    mode: "onTouched",
    defaultValues: defaultValues ?? emptyProblem(),
  });
  const type = watch("type");
  const options = useFieldArray({ control, name: "options" });
  const testCases = useFieldArray({ control, name: "testCases" });
  const f = (name: string) => `${id}-${name}`;

  const switchType = (next: ProblemType) => {
    if (next === type) return;
    const { title, description, marks } = getValues();
    reset({ ...emptyProblem(next), title, description, marks });
  };

  const setCorrect = (index: number) => {
    getValues("options").forEach((_, i) => setValue(`options.${i}.isCorrect`, i === index, { shouldValidate: true }));
  };

  const optionsError = errors.options?.message ?? errors.options?.root?.message;

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <fieldset disabled={lockType} className="space-y-2">
        <legend className="mb-2 text-sm font-medium">Question type</legend>
        <div role="radiogroup" className="grid gap-2 sm:grid-cols-3">
          {PROBLEM_TYPES.map((t) => {
            const Icon = TYPE_ICONS[t.value];
            const selected = type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => switchType(t.value)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60",
                  selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/40",
                )}
              >
                <Icon className={cn("size-4.5 shrink-0", selected ? "text-primary" : "text-muted-foreground")} aria-hidden />
                <span>
                  <span className="block text-sm font-medium">{t.label}</span>
                  <span className="block text-xs text-muted-foreground">{t.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-[1fr_120px]">
        <FormField label="Question title" htmlFor={f("title")} error={errors.title?.message} required>
          <Input {...fieldA11y(f("title"), errors.title?.message)} {...register("title")} />
        </FormField>
        <FormField label="Marks" htmlFor={f("marks")} error={errors.marks?.message} required>
          <Input
            {...fieldA11y(f("marks"), errors.marks?.message)}
            type="number"
            min={1}
            {...register("marks", { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <FormField label="Question details" htmlFor={f("description")} error={errors.description?.message} required>
        <Textarea {...fieldA11y(f("description"), errors.description?.message)} rows={3} {...register("description")} />
      </FormField>

      {type === "MCQ" ? (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">
            Answer options <span className="font-normal text-muted-foreground">(select the correct one)</span>
          </legend>
          {options.fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <Controller
                control={control}
                name={`options.${index}.isCorrect`}
                render={({ field: correct }) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={correct.value}
                    aria-label={`Mark option ${index + 1} as correct`}
                    onClick={() => setCorrect(index)}
                    className={cn(
                      "mt-1.5 grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                      correct.value ? "border-success bg-success" : "border-muted-foreground/40 hover:border-success",
                    )}
                  >
                    {correct.value ? <span className="size-2 rounded-full bg-white" /> : null}
                  </button>
                )}
              />
              <div className="flex-1 space-y-1">
                <Input
                  placeholder={`Option ${index + 1}`}
                  aria-label={`Option ${index + 1} text`}
                  aria-invalid={errors.options?.[index]?.text ? true : undefined}
                  {...register(`options.${index}.text`)}
                />
                {errors.options?.[index]?.text ? (
                  <p className="text-xs text-destructive">{errors.options[index]?.text?.message}</p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => options.remove(index)}
                disabled={options.fields.length <= 2}
                aria-label={`Remove option ${index + 1}`}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
          {optionsError ? (
            <p role="alert" className="text-sm text-destructive">
              {optionsError}
            </p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => options.append({ text: "", isCorrect: false })}
            disabled={options.fields.length >= MAX_OPTIONS}
          >
            <Plus /> Add option
          </Button>
        </fieldset>
      ) : null}

      {type === "CODING" ? (
        <div className="space-y-5">
          <FormField label="Language" htmlFor={f("language")}>
            <Controller
              control={control}
              name="languageHint"
              render={({ field }) => (
                <Select value={field.value || "javascript"} onValueChange={field.onChange}>
                  <SelectTrigger id={f("language")} className="w-full sm:w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l} value={l} className="capitalize">
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField label="Starter code" htmlFor={f("starter")} description="Pre-filled in the candidate's editor. Optional.">
            <Controller
              control={control}
              name="starterCode"
              render={({ field }) => (
                <LazyCodeEditor
                  id={f("starter")}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  language={watch("languageHint")}
                  minHeight="140px"
                  ariaLabel="Starter code"
                />
              )}
            />
          </FormField>
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">
              Test cases <span className="font-normal text-muted-foreground">(guide manual grading)</span>
            </legend>
            {testCases.fields.length === 0 ? (
              <p className="text-sm text-muted-foreground">No test cases yet.</p>
            ) : null}
            {testCases.fields.map((field, index) => (
              <div key={field.id} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-start">
                <Input placeholder="Input, e.g. &quot;hello&quot;" aria-label={`Test ${index + 1} input`} className="font-mono" {...register(`testCases.${index}.input`)} />
                <div className="space-y-1">
                  <Input
                    placeholder="Expected output"
                    aria-label={`Test ${index + 1} expected output`}
                    aria-invalid={errors.testCases?.[index]?.expectedOutput ? true : undefined}
                    className="font-mono"
                    {...register(`testCases.${index}.expectedOutput`)}
                  />
                  {errors.testCases?.[index]?.expectedOutput ? (
                    <p className="text-xs text-destructive">{errors.testCases[index]?.expectedOutput?.message}</p>
                  ) : null}
                </div>
                <Controller
                  control={control}
                  name={`testCases.${index}.hidden`}
                  render={({ field: hidden }) => (
                    <label className="flex h-8 items-center gap-2 text-sm whitespace-nowrap">
                      <Checkbox checked={hidden.value} onCheckedChange={(v) => hidden.onChange(v === true)} />
                      Hidden
                    </label>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => testCases.remove(index)} aria-label={`Remove test ${index + 1}`}>
                  <Trash2 />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => testCases.append({ input: "", expectedOutput: "", hidden: false })}>
              <Plus /> Add test case
            </Button>
          </fieldset>
        </div>
      ) : null}

      {type === "WRITTEN" ? (
        <FormField
          label="Model answer / grading rubric"
          htmlFor={f("answer")}
          description="Never shown to candidates. Graders see it next to each answer."
        >
          <Textarea id={f("answer")} rows={4} {...register("correctAnswerText")} />
        </FormField>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
