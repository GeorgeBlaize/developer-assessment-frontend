"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileQuestion, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { useDeleteProblem, useProblems, useSaveProblem } from "@/hooks/queries/use-company";
import { problemToInput, type ProblemInput } from "@/lib/validations/assessment";
import type { AssessmentStatus, Problem } from "@/types/api";
import { ProblemDialog } from "./problem-dialog";
import { ProblemSummaryCard } from "./problem-summary-card";

interface QuestionsManagerProps {
  assessmentId: string;
  status: AssessmentStatus;
  initialProblems: Problem[];
}

export function QuestionsManager({ assessmentId, status, initialProblems }: QuestionsManagerProps) {
  const router = useRouter();
  const editable = status === "DRAFT";
  const { data: problems = initialProblems, isError, error, refetch } = useProblems(assessmentId, initialProblems);
  const save = useSaveProblem(assessmentId);
  const remove = useDeleteProblem(assessmentId);
  const [editing, setEditing] = useState<Problem | "new" | null>(null);
  const totalMarks = problems.reduce((sum, p) => sum + p.marks, 0);

  const onSubmit = (values: ProblemInput) =>
    save.mutate(
      { problemId: editing && editing !== "new" ? editing.id : undefined, values },
      {
        onSuccess: () => {
          setEditing(null);
          router.refresh();
        },
      },
    );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle>Questions</CardTitle>
          <CardDescription>
            {problems.length} question{problems.length === 1 ? "" : "s"} · {totalMarks} marks
          </CardDescription>
        </div>
        {editable ? (
          <Button onClick={() => setEditing("new")}>
            <Plus /> Add question
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {!editable ? (
          <Alert>
            <Lock />
            <AlertDescription>
              Questions are locked because this assessment is {status.toLowerCase()}. Candidates always see the version they were
              invited to.
            </AlertDescription>
          </Alert>
        ) : null}

        {isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : problems.length === 0 ? (
          <EmptyState
            icon={FileQuestion}
            title="No questions yet"
            description="Add at least one question before publishing."
            action={
              editable ? (
                <Button variant="outline" onClick={() => setEditing("new")}>
                  <Plus /> Add question
                </Button>
              ) : undefined
            }
          />
        ) : (
          problems.map((p, i) => (
            <ProblemSummaryCard
              key={p.id}
              index={i}
              type={p.type}
              title={p.title}
              description={p.description}
              marks={p.marks}
              options={p.options}
              testCaseCount={p.testCases?.length ?? 0}
              actions={
                editable ? (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => setEditing(p)} aria-label={`Edit question ${i + 1}`}>
                      <Pencil />
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          aria-label={`Delete question ${i + 1}`}
                        >
                          <Trash2 />
                        </Button>
                      }
                      title="Delete this question?"
                      description={`"${p.title}" will be removed from the assessment.`}
                      confirmLabel="Delete"
                      destructive
                      onConfirm={() => remove.mutate(p.id, { onSuccess: () => router.refresh() })}
                    />
                  </>
                ) : undefined
              }
            />
          ))
        )}
      </CardContent>

      <ProblemDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={editing === "new" ? "Add question" : "Edit question"}
        defaultValues={editing && editing !== "new" ? problemToInput(editing) : undefined}
        onSubmit={onSubmit}
        pending={save.isPending}
        lockType={editing !== "new"}
      />
    </Card>
  );
}
