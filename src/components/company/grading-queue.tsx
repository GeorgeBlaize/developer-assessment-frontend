"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2, ClipboardCheck, XCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { LazyCodeEditor } from "@/components/shared/lazy-code-editor";
import { StatusBadge } from "@/components/shared/status-badge";
import { useSubmissions } from "@/hooks/queries/use-company";
import { RelativeTime } from "@/components/shared/relative-time";
import { cn } from "@/lib/utils";
import type { CompanySubmission, SubmissionStatus } from "@/types/api";
import { GradeForm } from "./grade-form";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Needs grading" },
  { value: "MANUALLY_GRADED", label: "Graded by you" },
  { value: "AUTO_GRADED", label: "Auto-graded (MCQ)" },
  { value: "ALL", label: "All answers" },
];

function readStatus(value: string | null): SubmissionStatus | undefined {
  if (value === "ALL") return undefined;
  if (value === "MANUALLY_GRADED" || value === "AUTO_GRADED") return value;
  return "PENDING";
}

function Answer({ submission: s }: { submission: CompanySubmission }) {
  if (s.problem.type === "MCQ") {
    return s.selectedOption ? (
      <p className={cn("flex items-center gap-2 text-sm font-medium", s.isCorrect ? "text-success" : "text-destructive")}>
        {s.isCorrect ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
        {s.selectedOption.text}
      </p>
    ) : (
      <p className="text-sm text-muted-foreground">No option selected</p>
    );
  }
  if (!s.answerText) return <p className="text-sm text-muted-foreground italic">No answer submitted</p>;
  if (s.problem.type === "CODING") {
    return <LazyCodeEditor value={s.answerText} readOnly minHeight="120px" ariaLabel="Candidate's code" />;
  }
  return <p className="rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">{s.answerText}</p>;
}

export function GradingQueue({ assessmentId }: { assessmentId: string }) {
  const searchParams = useSearchParams();
  const status = readStatus(searchParams.get("status"));
  const { data, isPending, isError, error, refetch, isPlaceholderData, isFetching } = useSubmissions(assessmentId, status);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Grading queue</h2>
          <p className="text-sm text-muted-foreground">
            Coding and written answers need your marks. Attempts finalise automatically once every answer is graded.
          </p>
        </div>
        <FilterSelect paramKey="status" label="Show" options={STATUS_OPTIONS} defaultValue="PENDING" className="sm:w-52" />
      </div>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="gap-3 p-5">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </Card>
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title={status === "PENDING" ? "All caught up!" : "Nothing here yet"}
          description={status === "PENDING" ? "There are no answers waiting for a grade." : "No answers match this filter."}
        />
      ) : (
        <ul className={cn("space-y-3 transition-opacity", isPlaceholderData && isFetching && "opacity-60")}>
          {data.map((s) => (
            <li key={s.id}>
              <Card className="gap-4 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={s.problem.type} label={s.problem.type === "MCQ" ? "MCQ" : undefined} />
                      <StatusBadge status={s.status} />
                      <RelativeTime value={s.updatedAt} className="text-xs text-muted-foreground" />
                    </div>
                    <h3 className="font-medium">{s.problem.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {s.attempt.candidate.user.name} · {s.attempt.candidate.user.email}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium tabular-nums">
                    {s.awardedMarks ?? "–"} / {s.problem.marks} marks
                  </p>
                </div>

                <Answer submission={s} />

                {s.problem.correctAnswerText ? (
                  <Accordion type="single" collapsible>
                    <AccordionItem value="rubric" className="border-0">
                      <AccordionTrigger className="py-1 text-sm text-muted-foreground">Model answer / rubric</AccordionTrigger>
                      <AccordionContent className="rounded-lg bg-primary/5 p-3 text-sm whitespace-pre-wrap">
                        {s.problem.correctAnswerText}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : null}

                {s.problem.type !== "MCQ" ? <GradeForm key={s.id + s.status} assessmentId={assessmentId} submission={s} /> : null}
                {s.feedback && s.problem.type === "MCQ" ? <p className="text-sm text-muted-foreground">Feedback: {s.feedback}</p> : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
