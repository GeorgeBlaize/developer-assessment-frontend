"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { LazyCodeEditor } from "@/components/shared/lazy-code-editor";
import { cn } from "@/lib/utils";
import type { Problem } from "@/types/api";

interface AnswerInputProps {
  problem: Problem;
  answerText?: string;
  selectedOptionId?: string;
  onText: (value: string) => void;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}

/** The right control for each question type. */
export function AnswerInput({ problem, answerText, selectedOptionId, onText, onSelect, disabled }: AnswerInputProps) {
  if (problem.type === "MCQ") {
    const options = [...problem.options].sort((a, b) => a.order - b.order);
    return (
      <RadioGroup value={selectedOptionId ?? ""} onValueChange={onSelect} disabled={disabled} aria-label="Answer options" className="gap-2.5">
        {options.map((option, i) => {
          const id = `option-${option.id}`;
          const checked = selectedOptionId === option.id;
          return (
            <Label
              key={option.id}
              htmlFor={id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-normal transition-colors hover:border-primary/40",
                checked && "border-primary bg-primary/5 ring-1 ring-primary",
              )}
            >
              <RadioGroupItem id={id} value={option.id} />
              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-muted font-mono text-xs">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="leading-snug">{option.text}</span>
            </Label>
          );
        })}
      </RadioGroup>
    );
  }

  if (problem.type === "CODING") {
    return (
      <div className="space-y-3">
        <LazyCodeEditor
          value={answerText ?? problem.starterCode ?? ""}
          onChange={onText}
          language={problem.languageHint}
          readOnly={disabled}
          minHeight="320px"
          ariaLabel="Your code"
        />
        {problem.testCases?.filter((t) => !t.hidden).length ? (
          <div className="rounded-xl border">
            <p className="border-b px-4 py-2 text-xs font-medium text-muted-foreground">Example test cases</p>
            <ul className="divide-y">
              {problem.testCases
                .filter((t) => !t.hidden)
                .map((t, i) => (
                  <li key={i} className="grid gap-1 px-4 py-2.5 font-mono text-xs sm:grid-cols-2">
                    <span>
                      <span className="text-muted-foreground">input: </span>
                      {t.input || "∅"}
                    </span>
                    <span>
                      <span className="text-muted-foreground">expected: </span>
                      {t.expectedOutput}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Textarea
        value={answerText ?? ""}
        onChange={(e) => onText(e.target.value)}
        disabled={disabled}
        rows={12}
        placeholder="Write your answer…"
        aria-label="Your answer"
        className="min-h-64 text-base leading-relaxed"
      />
      <p className="text-right text-xs text-muted-foreground tabular-nums">
        {(answerText ?? "").trim().split(/\s+/).filter(Boolean).length} words
      </p>
    </div>
  );
}
