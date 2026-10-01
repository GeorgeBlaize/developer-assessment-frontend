"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, ChevronLeft, ChevronRight, CloudOff, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LogoMark } from "@/components/shared/logo";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAttempt, useFinishAttempt, useSubmitAnswer, type AnswerBody } from "@/hooks/queries/use-candidate";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { useAttemptDrafts, type AnswerDraft } from "@/stores/attempt-store";
import type { AttemptDetail, Problem } from "@/types/api";
import { AnswerInput } from "./answer-input";
import { ExamTimer } from "./exam-timer";

type SaveState = "idle" | "saving" | "saved" | "error";
const AUTOSAVE_MS = 1500;

/** Server-side "attempt is over" errors: stop the exam and show the result. */
function isAttemptOver(message: string) {
  return /time is up|expired|already (submitted|evaluated)/i.test(message);
}

export function ExamWorkspace({ initial }: { initial: AttemptDetail }) {
  const router = useRouter();
  const attemptId = initial.id;
  const { data: attempt = initial } = useAttempt(attemptId, initial);
  const submit = useSubmitAnswer(attemptId);
  const finish = useFinishAttempt(attemptId);

  const [hydrated, setHydrated] = useState(false);
  const drafts = useAttemptDrafts((s) => s.drafts[attemptId]);
  const currentIndex = useAttemptDrafts((s) => s.current[attemptId] ?? 0);
  const { setDraft, markSaved, setCurrent, clearAttempt } = useAttemptDrafts.getState();
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});
  const finishing = useRef(false);

  useEffect(() => {
    void Promise.resolve(useAttemptDrafts.persist.rehydrate()).then(() => setHydrated(true));
  }, []);

  const problems = useMemo(
    () => attempt.assessment.problems.filter((p) => !p.deletedAt).sort((a, b) => a.order - b.order),
    [attempt.assessment.problems],
  );
  const serverAnswers = useMemo(() => new Map(attempt.submissions.map((s) => [s.problemId, s])), [attempt.submissions]);
  const index = Math.min(currentIndex, Math.max(problems.length - 1, 0));
  const problem: Problem | undefined = problems[index];

  const valueFor = useCallback(
    (p: Problem): Partial<AnswerDraft> => {
      const draft = drafts?.[p.id];
      if (draft) return draft;
      const saved = serverAnswers.get(p.id);
      return { answerText: saved?.answerText ?? undefined, selectedOptionId: saved?.selectedOptionId ?? undefined };
    },
    [drafts, serverAnswers],
  );

  const isAnswered = (p: Problem) => {
    const v = valueFor(p);
    return Boolean(v.selectedOptionId || v.answerText?.trim());
  };
  const answeredCount = problems.filter(isAnswered).length;
  const dirtyIds = Object.entries(drafts ?? {})
    .filter(([, d]) => d.dirty)
    .map(([id]) => id);

  const endExam = useCallback(
    (message?: string) => {
      clearAttempt(attemptId);
      if (message) toast.info(message);
      router.replace(`/candidate/results/${attemptId}?submitted=1`);
      router.refresh();
    },
    [attemptId, clearAttempt, router],
  );

  /** Pushes one question's draft to the API (no-op if nothing changed). */
  const saveProblem = useCallback(
    async (problemId: string): Promise<boolean> => {
      const draft = useAttemptDrafts.getState().drafts[attemptId]?.[problemId];
      if (!draft?.dirty) return true;
      const body: AnswerBody = { problemId };
      if (draft.selectedOptionId) body.selectedOptionId = draft.selectedOptionId;
      else body.answerText = draft.answerText ?? "";

      setSaveState((s) => ({ ...s, [problemId]: "saving" }));
      try {
        await submit.mutateAsync(body);
        // Only clear the dirty flag if the candidate hasn't typed more since we sent it.
        const latest = useAttemptDrafts.getState().drafts[attemptId]?.[problemId];
        if (latest?.answerText === draft.answerText && latest?.selectedOptionId === draft.selectedOptionId) {
          markSaved(attemptId, problemId);
        }
        setSaveState((s) => ({ ...s, [problemId]: "saved" }));
        return true;
      } catch (error) {
        const message = getErrorMessage(error);
        if (isAttemptOver(message)) {
          endExam("Time is up. Your saved answers were submitted automatically.");
          return false;
        }
        setSaveState((s) => ({ ...s, [problemId]: "error" }));
        toast.error(`Couldn't save your answer: ${message}`);
        return false;
      }
    },
    [attemptId, endExam, markSaved, submit],
  );

  // Debounced autosave for typed answers on the current question.
  const currentDraft = problem ? drafts?.[problem.id] : undefined;
  useEffect(() => {
    if (!problem || !currentDraft?.dirty) return;
    const id = setTimeout(() => void saveProblem(problem.id), AUTOSAVE_MS);
    return () => clearTimeout(id);
  }, [currentDraft, problem, saveProblem]);

  // Warn before closing the tab with unsaved answers.
  useEffect(() => {
    if (!dirtyIds.length) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirtyIds.length]);

  // Ctrl/Cmd + S saves the current answer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s" && problem) {
        e.preventDefault();
        void saveProblem(problem.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [problem, saveProblem]);

  const goTo = (next: number) => {
    if (problem) void saveProblem(problem.id);
    setCurrent(attemptId, next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitAll = useCallback(
    async (auto: boolean) => {
      if (finishing.current) return;
      finishing.current = true;
      for (const id of Object.keys(useAttemptDrafts.getState().drafts[attemptId] ?? {})) {
        await saveProblem(id);
      }
      try {
        await finish.mutateAsync();
        endExam(auto ? "Time is up. Your answers were submitted." : "Assessment submitted. Good luck!");
      } catch (error) {
        const message = getErrorMessage(error);
        if (isAttemptOver(message)) endExam("Time is up. Your saved answers were submitted automatically.");
        else {
          finishing.current = false;
          toast.error(`Couldn't submit: ${message}`);
        }
      }
    },
    [attemptId, endExam, finish, saveProblem],
  );

  if (!hydrated || !problem) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 p-6" aria-busy>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[60vh] w-full rounded-xl" />
      </div>
    );
  }

  const value = valueFor(problem);
  const state = saveState[problem.id] ?? "idle";
  const dirty = Boolean(drafts?.[problem.id]?.dirty);
  const unanswered = problems.length - answeredCount;

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <LogoMark />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{attempt.assessment.title}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {answeredCount} of {problems.length} answered
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExamTimer
              expiresAt={attempt.expiresAt}
              onExpire={() => void submitAll(true)}
              onWarning={(m) => toast.warning(`${m} minute${m === 1 ? "" : "s"} left`, { description: "Your answers are saving automatically." })}
            />
            <ConfirmDialog
              trigger={
                <Button disabled={finish.isPending}>
                  {finish.isPending ? <Loader2 className="animate-spin" /> : <Send />}
                  <span className="hidden sm:inline">Submit</span>
                </Button>
              }
              title="Submit your assessment?"
              description={
                unanswered
                  ? `You still have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"}. You can't change answers after submitting.`
                  : "All questions are answered. You can't change answers after submitting."
              }
              confirmLabel="Submit assessment"
              pending={finish.isPending}
              onConfirm={() => void submitAll(false)}
            />
          </div>
        </div>
        <Progress value={(answeredCount / problems.length) * 100} className="h-1 rounded-none" aria-label="Answered progress" />
      </header>

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
        {/* Question navigator */}
        <nav aria-label="Questions" className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-2 hidden text-xs font-semibold tracking-wider text-muted-foreground uppercase lg:block">Questions</p>
          <ol className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {problems.map((p, i) => {
              const answered = isAnswered(p);
              const active = i === index;
              return (
                <li key={p.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                      active ? "border-primary bg-primary/5 font-medium" : "hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold",
                        answered ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {answered ? <Check className="size-3.5" aria-label="Answered" /> : i + 1}
                    </span>
                    <span className="hidden truncate lg:inline">{p.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Question */}
        <main id="main" className="min-w-0 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                Question {index + 1} / {problems.length}
              </span>
              <StatusBadge status={problem.type} label={problem.type === "MCQ" ? "Multiple choice" : undefined} />
              <span className="text-xs font-medium text-muted-foreground">{problem.marks} marks</span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{problem.title}</h1>
            <p className="whitespace-pre-line text-muted-foreground">{problem.description}</p>
          </div>

          <AnswerInput
            key={problem.id}
            problem={problem}
            answerText={value.answerText}
            selectedOptionId={value.selectedOptionId}
            onText={(text) => setDraft(attemptId, problem.id, { answerText: text })}
            onSelect={(optionId) => {
              setDraft(attemptId, problem.id, { selectedOptionId: optionId });
              // Choices are saved (and auto-graded) immediately.
              setTimeout(() => void saveProblem(problem.id), 0);
            }}
          />

          <div className="flex flex-col-reverse items-stretch gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-live="polite">
              {state === "saving" ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Saving…
                </>
              ) : state === "error" ? (
                <>
                  <CloudOff className="size-4 text-destructive" /> Not saved. We&apos;ll retry when you move on.
                </>
              ) : dirty ? (
                <>
                  <AlertCircle className="size-4" /> Unsaved changes
                </>
              ) : isAnswered(problem) ? (
                <>
                  <Check className="size-4 text-success" /> Saved
                </>
              ) : (
                "Not answered yet"
              )}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => goTo(index - 1)} disabled={index === 0}>
                <ChevronLeft /> Previous
              </Button>
              {index < problems.length - 1 ? (
                <Button onClick={() => goTo(index + 1)}>
                  Save & next <ChevronRight />
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => void saveProblem(problem.id)} disabled={!dirty || state === "saving"}>
                  <Check /> Save answer
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
