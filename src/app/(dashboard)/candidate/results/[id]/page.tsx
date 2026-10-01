import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Hourglass, MessageSquareText, PartyPopper, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoreRing } from "@/components/candidate/score-ring";
import { LazyCodeEditor } from "@/components/shared/lazy-code-editor";
import { StatusBadge } from "@/components/shared/status-badge";
import { orNotFound } from "@/lib/api/not-found";
import { serverFetch } from "@/lib/api/server";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AttemptDetail, Problem, Submission } from "@/types/api";

export const metadata: Metadata = { title: "Result" };

function minutesBetween(a: string | null, b: string | null) {
  if (!a || !b) return null;
  return Math.max(Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000), 0);
}

function YourAnswer({ problem, submission }: { problem: Problem; submission?: Submission }) {
  if (!submission) return <p className="text-sm text-muted-foreground italic">Not answered</p>;
  if (problem.type === "MCQ") {
    const option = problem.options.find((o) => o.id === submission.selectedOptionId);
    return (
      <p className={cn("flex items-center gap-2 text-sm font-medium", submission.isCorrect ? "text-success" : "text-destructive")}>
        {submission.isCorrect ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
        {option?.text ?? "Option no longer available"}
      </p>
    );
  }
  if (problem.type === "CODING") {
    return <LazyCodeEditor value={submission.answerText ?? ""} language={problem.languageHint} readOnly minHeight="100px" ariaLabel="Your code" />;
  }
  return <p className="rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">{submission.answerText}</p>;
}

export default async function CandidateResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const [{ id }, { submitted }] = await Promise.all([params, searchParams]);
  const { data: attempt } = await orNotFound(serverFetch<AttemptDetail>(`/attempts/${id}`));
  const problems = attempt.assessment.problems.filter((p) => !p.deletedAt).sort((a, b) => a.order - b.order);
  const byProblem = new Map(attempt.submissions.map((s) => [s.problemId, s]));
  const pendingCount = attempt.submissions.filter((s) => s.status === "PENDING").length;
  const minutes = minutesBetween(attempt.startedAt, attempt.submittedAt);
  const totalMarks = attempt.assessment.totalMarks || problems.reduce((s, p) => s + p.marks, 0);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/candidate/results">
          <ArrowLeft /> My results
        </Link>
      </Button>

      {submitted ? (
        <Alert>
          <PartyPopper className="text-primary" />
          <AlertTitle>Submitted. Nice work!</AlertTitle>
          <AlertDescription>
            {pendingCount
              ? "Multiple-choice answers are already scored. The company will grade your written and coding answers next."
              : "Your answers have been scored."}
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="flex-col items-center gap-6 p-6 sm:flex-row sm:items-center">
        <ScoreRing score={attempt.totalScore ?? 0} total={totalMarks} passed={attempt.isPassed} />
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <StatusBadge status={attempt.status} />
            {attempt.isPassed !== null ? (
              <StatusBadge status={attempt.isPassed ? "PASSED" : "NOT_PASSED"} label={attempt.isPassed ? "Passed" : "Not passed"} />
            ) : null}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{attempt.assessment.title}</h1>
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-muted-foreground sm:justify-start">
            <li>Pass mark {attempt.assessment.passingScore}</li>
            <li className="flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden /> {minutes !== null ? `${minutes} min used` : "—"}
            </li>
            <li>Submitted {formatDateTime(attempt.submittedAt, "—")}</li>
          </ul>
          {pendingCount ? (
            <p className="flex items-center justify-center gap-1.5 text-sm text-amber-700 sm:justify-start dark:text-amber-300">
              <Hourglass className="size-4" aria-hidden /> {pendingCount} answer{pendingCount === 1 ? "" : "s"} awaiting manual grading.
              Your score may increase.
            </p>
          ) : null}
        </div>
      </Card>

      <section aria-labelledby="breakdown" className="space-y-3">
        <h2 id="breakdown" className="font-semibold">
          Question breakdown
        </h2>
        {problems.map((p, i) => {
          const s = byProblem.get(p.id);
          return (
            <Card key={p.id} className="gap-4 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">Q{i + 1}</span>
                    <StatusBadge status={p.type} label={p.type === "MCQ" ? "MCQ" : undefined} />
                    {s ? <StatusBadge status={s.status} label={s.status === "PENDING" ? "Awaiting grading" : undefined} /> : null}
                  </div>
                  <h3 className="font-medium">{p.title}</h3>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums">
                  {s?.awardedMarks ?? (s?.status === "PENDING" ? "–" : 0)} / {p.marks}
                </p>
              </div>
              <YourAnswer problem={p} submission={s} />
              {s?.feedback ? (
                <div className="flex gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                  <MessageSquareText className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <div>
                    <p className="font-medium">Grader feedback</p>
                    <p className="whitespace-pre-wrap text-muted-foreground">{s.feedback}</p>
                  </div>
                </div>
              ) : null}
            </Card>
          );
        })}
      </section>
    </div>
  );
}
