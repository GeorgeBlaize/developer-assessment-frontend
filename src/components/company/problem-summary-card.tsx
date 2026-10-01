import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { ProblemType } from "@/types/api";

interface ProblemSummaryCardProps {
  index: number;
  type: ProblemType;
  title: string;
  description: string;
  marks: number;
  options?: { text: string; isCorrect?: boolean }[];
  testCaseCount?: number;
  actions?: ReactNode;
  className?: string;
}

/** Compact, read-only view of a question used in the wizard and on the assessment page. */
export function ProblemSummaryCard({
  index,
  type,
  title,
  description,
  marks,
  options,
  testCaseCount,
  actions,
  className,
}: ProblemSummaryCardProps) {
  return (
    <article className={cn("rounded-xl border bg-card p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">Q{index + 1}</span>
            <StatusBadge status={type} label={type === "MCQ" ? "MCQ" : undefined} />
            <span className="text-xs font-medium text-muted-foreground">{marks} marks</span>
          </div>
          <h3 className="font-medium break-words">{title}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-0.5">{actions}</div> : null}
      </div>
      {type === "MCQ" && options?.length ? (
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {options.map((o, i) => (
            <li
              key={i}
              className={cn(
                "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm",
                o.isCorrect && "border-success/40 bg-success/8",
              )}
            >
              {o.isCorrect ? (
                <CheckCircle2 className="size-3.5 shrink-0 text-success" aria-label="Correct answer" />
              ) : (
                <span className="size-3.5 shrink-0 rounded-full border" aria-hidden />
              )}
              <span className="truncate">{o.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {type === "CODING" && testCaseCount !== undefined ? (
        <p className="mt-3 text-xs text-muted-foreground">
          {testCaseCount} test case{testCaseCount === 1 ? "" : "s"}
        </p>
      ) : null}
    </article>
  );
}
