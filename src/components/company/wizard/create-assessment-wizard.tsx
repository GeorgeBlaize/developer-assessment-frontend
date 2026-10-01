"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CalendarClock,
  Clock,
  FileQuestion,
  Loader2,
  Pencil,
  Plus,
  Rocket,
  Save,
  Target,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { useCompanyDashboard, useCreateAssessmentWithProblems } from "@/hooks/queries/use-company";
import { formatDateTime, formatDuration } from "@/lib/format";
import { useAssessmentWizard, WIZARD_STEPS } from "@/stores/assessment-wizard-store";
import type { ProblemInput } from "@/lib/validations/assessment";
import { AssessmentDetailsForm } from "../assessment-details-form";
import { ProblemDialog } from "../problem-dialog";
import { ProblemSummaryCard } from "../problem-summary-card";
import { WizardStepper } from "./wizard-stepper";

function useWizardHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    void Promise.resolve(useAssessmentWizard.persist.rehydrate()).then(() => setHydrated(true));
  }, []);
  return hydrated;
}

function DetailsStep() {
  const { details, saveDetails, setStep } = useAssessmentWizard();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment details</CardTitle>
        <CardDescription>What candidates will see before they start, and the rules for passing.</CardDescription>
      </CardHeader>
      <CardContent>
        <AssessmentDetailsForm
          id="wizard-details"
          defaultValues={details ?? undefined}
          onSubmit={(values) => {
            saveDetails(values);
            setStep(1);
          }}
          footer={
            <div className="flex justify-end border-t pt-4">
              <Button type="submit">
                Continue to questions <ArrowRight />
              </Button>
            </div>
          }
        />
      </CardContent>
    </Card>
  );
}

function QuestionsStep() {
  const { problems, addProblem, updateProblem, removeProblem, moveProblem, setStep } = useAssessmentWizard();
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const totalMarks = problems.reduce((sum, p) => sum + p.marks, 0);

  const onSave = (values: ProblemInput) => {
    if (editing === "new") addProblem(values);
    else if (typeof editing === "number") updateProblem(editing, values);
    setEditing(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle>Questions</CardTitle>
          <CardDescription>
            {problems.length} question{problems.length === 1 ? "" : "s"} · {totalMarks} total marks
          </CardDescription>
        </div>
        <Button onClick={() => setEditing("new")}>
          <Plus /> Add question
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {problems.length === 0 ? (
          <EmptyState
            icon={FileQuestion}
            title="No questions yet"
            description="Mix multiple-choice, coding and written questions. You need at least one to continue."
            action={
              <Button variant="outline" onClick={() => setEditing("new")}>
                <Plus /> Add your first question
              </Button>
            }
          />
        ) : (
          problems.map((p, i) => (
            <ProblemSummaryCard
              key={`${i}-${p.title}`}
              index={i}
              type={p.type}
              title={p.title}
              description={p.description}
              marks={p.marks}
              options={p.options}
              testCaseCount={p.testCases.length}
              actions={
                <>
                  <Button variant="ghost" size="icon" onClick={() => moveProblem(i, i - 1)} disabled={i === 0} aria-label="Move up">
                    <ArrowUp />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveProblem(i, i + 1)}
                    disabled={i === problems.length - 1}
                    aria-label="Move down"
                  >
                    <ArrowDown />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setEditing(i)} aria-label={`Edit question ${i + 1}`}>
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeProblem(i)}
                    aria-label={`Remove question ${i + 1}`}
                  >
                    <Trash2 />
                  </Button>
                </>
              }
            />
          ))
        )}

        <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={() => setStep(0)}>
            <ArrowLeft /> Back
          </Button>
          <Button onClick={() => setStep(2)} disabled={problems.length === 0}>
            Review <ArrowRight />
          </Button>
        </div>
      </CardContent>

      <ProblemDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={editing === "new" ? "Add question" : "Edit question"}
        defaultValues={typeof editing === "number" ? problems[editing] : undefined}
        onSubmit={onSave}
      />
    </Card>
  );
}

function ReviewStep() {
  const router = useRouter();
  const { details, problems, setStep, reset } = useAssessmentWizard();
  const { data: dashboard } = useCompanyDashboard();
  const create = useCreateAssessmentWithProblems();
  const [progress, setProgress] = useState<string | null>(null);

  // A stale draft without details (e.g. cleared in another tab) goes back to step 1.
  useEffect(() => {
    if (!details) setStep(0);
  }, [details, setStep]);

  if (!details) return null;

  const totalMarks = problems.reduce((sum, p) => sum + p.marks, 0);
  const passingTooHigh = details.passingScore > totalMarks;
  const plan = dashboard?.plan;
  const atPlanLimit = plan ? dashboard.publishedAssessments >= plan.maxActiveAssessments : false;

  const submit = (publish: boolean) => {
    create.mutate(
      { details, problems, publish, onProgress: setProgress },
      {
        onSuccess: ({ assessment, published, publishError }) => {
          reset();
          if (publishError) {
            toast.warning("Saved as draft, but it couldn't be published", { description: publishError });
          } else {
            toast.success(published ? "Assessment published. Invite candidates next!" : "Draft saved");
          }
          router.push(`/company/assessments/${assessment.id}${published ? "/candidates" : ""}`);
        },
        onSettled: () => setProgress(null),
      },
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg">{details.title}</CardTitle>
            <CardDescription className="whitespace-pre-line">{details.description}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setStep(0)}>
            <Pencil /> Edit
          </Button>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-4">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" aria-hidden />
              <div>
                <dt className="text-xs text-muted-foreground">Duration</dt>
                <dd className="font-medium">{formatDuration(details.durationMinutes)}</dd>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target className="size-4 text-muted-foreground" aria-hidden />
              <div>
                <dt className="text-xs text-muted-foreground">Pass mark</dt>
                <dd className="font-medium">
                  {details.passingScore} / {totalMarks}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <CalendarClock className="size-4 text-muted-foreground" aria-hidden />
              <div>
                <dt className="text-xs text-muted-foreground">Window</dt>
                <dd className="font-medium">
                  {details.startWindow || details.endWindow
                    ? `${formatDateTime(details.startWindow, "Anytime")} → ${formatDateTime(details.endWindow, "No deadline")}`
                    : "Always open while published"}
                </dd>
              </div>
            </div>
          </dl>
        </CardContent>
      </Card>

      {passingTooHigh ? (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Pass mark is higher than the total marks</AlertTitle>
          <AlertDescription>
            Nobody could pass: the pass mark is {details.passingScore} but the questions are worth {totalMarks}. Lower the pass mark
            or add questions.
          </AlertDescription>
        </Alert>
      ) : null}

      {atPlanLimit ? (
        <Alert>
          <AlertTriangle />
          <AlertTitle>Plan limit reached</AlertTitle>
          <AlertDescription>
            Your {plan?.name} plan allows {plan?.maxActiveAssessments} published assessment
            {plan?.maxActiveAssessments === 1 ? "" : "s"}. Save this as a draft, archive another assessment, or upgrade in Billing.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-3">
        <h2 className="text-sm font-medium">
          {problems.length} question{problems.length === 1 ? "" : "s"}
        </h2>
        {problems.map((p, i) => (
          <ProblemSummaryCard
            key={`${i}-${p.title}`}
            index={i}
            type={p.type}
            title={p.title}
            description={p.description}
            marks={p.marks}
            options={p.options}
            testCaseCount={p.testCases.length}
          />
        ))}
      </div>

      <Card className="sticky bottom-3 z-10 flex-row flex-wrap items-center justify-between gap-3 px-4 py-3 shadow-lg">
        <Button variant="outline" onClick={() => setStep(1)} disabled={create.isPending}>
          <ArrowLeft /> Back
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          {progress ? (
            <span className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
              <Loader2 className="size-4 animate-spin" /> {progress}
            </span>
          ) : null}
          <Button variant="outline" onClick={() => submit(false)} disabled={create.isPending || passingTooHigh}>
            <Save /> Save as draft
          </Button>
          <Button onClick={() => submit(true)} disabled={create.isPending || passingTooHigh || atPlanLimit}>
            <Rocket /> Create & publish
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function CreateAssessmentWizard() {
  const hydrated = useWizardHydrated();
  const { step, details, problems, reset } = useAssessmentWizard();
  const hasDraft = Boolean(details || problems.length);

  if (!hydrated) {
    return (
      <div className="space-y-6" aria-busy>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <WizardStepper steps={WIZARD_STEPS} current={step} />
        </div>
        {hasDraft ? (
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="sm" className="self-end text-muted-foreground sm:self-auto">
                Discard draft
              </Button>
            }
            title="Discard this draft?"
            description="Your unsaved details and questions will be cleared. This can't be undone."
            confirmLabel="Discard"
            destructive
            onConfirm={reset}
          />
        ) : null}
      </div>
      {step === 0 ? <DetailsStep /> : step === 1 ? <QuestionsStep /> : <ReviewStep />}
    </div>
  );
}
