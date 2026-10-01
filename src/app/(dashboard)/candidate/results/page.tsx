import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { serverFetch } from "@/lib/api/server";
import { formatDateTime } from "@/lib/format";
import type { MyAttempt } from "@/types/api";

export const metadata: Metadata = { title: "My results" };

const columns: Column<MyAttempt>[] = [
  {
    key: "assessment",
    header: "Assessment",
    cell: (a) => (
      <Link href={`/candidate/results/${a.id}`} className="font-medium hover:underline">
        {a.assessment.title}
      </Link>
    ),
  },
  { key: "status", header: "Status", cell: (a) => <StatusBadge status={a.status} /> },
  {
    key: "score",
    header: "Score",
    cell: (a) => (
      <div className="w-28 space-y-1">
        <span className="text-sm font-medium tabular-nums">
          {a.totalScore ?? 0}
          <span className="text-muted-foreground"> / {a.assessment.totalMarks}</span>
        </span>
        <Progress value={a.assessment.totalMarks ? ((a.totalScore ?? 0) / a.assessment.totalMarks) * 100 : 0} className="h-1.5" />
      </div>
    ),
  },
  {
    key: "result",
    header: "Result",
    cell: (a) =>
      a.isPassed === null ? (
        <span className="text-xs text-muted-foreground">{a.status === "IN_PROGRESS" ? "In progress" : "Grading in progress"}</span>
      ) : (
        <StatusBadge status={a.isPassed ? "PASSED" : "NOT_PASSED"} label={a.isPassed ? "Passed" : "Not passed"} />
      ),
  },
  {
    key: "submitted",
    header: "Submitted",
    hideOnMobile: true,
    cell: (a) => <span className="text-sm">{formatDateTime(a.submittedAt, "—")}</span>,
  },
  {
    key: "open",
    header: <span className="sr-only">Open</span>,
    className: "text-right",
    cell: (a) =>
      a.status === "IN_PROGRESS" ? (
        <Button asChild size="sm">
          <Link href={`/attempt/${a.id}`}>Resume</Link>
        </Button>
      ) : (
        <Button asChild size="icon" variant="ghost" aria-label={`Open result for ${a.assessment.title}`}>
          <Link href={`/candidate/results/${a.id}`}>
            <ArrowRight />
          </Link>
        </Button>
      ),
  },
];

/** Pure Server Component: the list has no client interactivity, so it ships zero JS for the table. */
export default async function CandidateResultsPage() {
  const { data: attempts } = await serverFetch<MyAttempt[]>("/attempts");

  return (
    <div className="space-y-6">
      <PageHeader title="My results" description="Scores, pass/fail outcomes and grader feedback for every assessment you've taken." />
      <DataTable
        caption="Your assessment attempts"
        columns={columns}
        rows={attempts}
        getRowKey={(a) => a.id}
        empty={
          <EmptyState
            icon={Trophy}
            title="No attempts yet"
            description="Once you start an assessment, your results will appear here."
            action={
              <Button asChild variant="outline">
                <Link href="/candidate/invitations">View invitations</Link>
              </Button>
            }
          />
        }
      />
    </div>
  );
}
