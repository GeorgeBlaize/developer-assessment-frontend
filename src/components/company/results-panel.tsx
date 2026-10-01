"use client";

import dynamic from "next/dynamic";
import { Award, BarChart3, Percent, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, TableSkeleton, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatCard, StatCardSkeleton } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAssessmentAnalytics, useAssessmentAttempts } from "@/hooks/queries/use-company";
import { formatDateTime } from "@/lib/format";
import type { AssessmentAnalytics, CompanyAttempt, InvitationStatus } from "@/types/api";
import type { BarDatum } from "./results-charts";

const SimpleBarChart = dynamic(() => import("./results-charts").then((m) => m.SimpleBarChart), {
  ssr: false,
  loading: () => (
    <Card className="gap-3 p-6">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-52 w-full" />
    </Card>
  ),
});

const FUNNEL: { status: InvitationStatus; label: string }[] = [
  { status: "PENDING", label: "Pending" },
  { status: "ACCEPTED", label: "Accepted" },
  { status: "DECLINED", label: "Declined" },
  { status: "EXPIRED", label: "Expired" },
];

function scoreBins(attempts: CompanyAttempt[], analytics: AssessmentAnalytics): BarDatum[] {
  const total = Math.max(analytics.totalMarks, 1);
  const bins = [0, 20, 40, 60, 80].map((from) => ({ from, to: from + 20, value: 0 }));
  for (const a of attempts) {
    if (a.totalScore === null || a.status === "IN_PROGRESS") continue;
    const pct = Math.min((a.totalScore / total) * 100, 99.99);
    bins[Math.floor(pct / 20)].value++;
  }
  const passPct = (analytics.passingScore / total) * 100;
  return bins.map((b) => ({ label: `${b.from}–${b.to}%`, value: b.value, highlight: b.to > passPct }));
}

export function ResultsPanel({ assessmentId }: { assessmentId: string }) {
  const analytics = useAssessmentAnalytics(assessmentId);
  const attempts = useAssessmentAttempts(assessmentId);

  if (analytics.isError) return <ErrorState error={analytics.error} onRetry={() => analytics.refetch()} />;

  const a = analytics.data;
  const totalMarks = a?.totalMarks ?? 0;
  const ranked = attempts.data ? [...attempts.data].sort((x, y) => (y.totalScore ?? -1) - (x.totalScore ?? -1)) : [];

  const columns: Column<CompanyAttempt>[] = [
    {
      key: "rank",
      header: "#",
      className: "w-10",
      cell: (row) => <span className="font-mono text-xs text-muted-foreground">{ranked.indexOf(row) + 1}</span>,
    },
    {
      key: "candidate",
      header: "Candidate",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.candidate.user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{row.candidate.user.email}</p>
        </div>
      ),
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: "score",
      header: "Score",
      cell: (row) => (
        <div className="w-28 space-y-1">
          <span className="text-sm font-medium tabular-nums">
            {row.totalScore ?? 0}
            <span className="text-muted-foreground"> / {totalMarks}</span>
          </span>
          <Progress value={totalMarks ? ((row.totalScore ?? 0) / totalMarks) * 100 : 0} className="h-1.5" />
        </div>
      ),
    },
    {
      key: "result",
      header: "Result",
      cell: (row) =>
        row.isPassed === null ? (
          <span className="text-xs text-muted-foreground">{row.status === "SUBMITTED" ? "Awaiting grading" : "—"}</span>
        ) : (
          <StatusBadge status={row.isPassed ? "PASSED" : "NOT_PASSED"} label={row.isPassed ? "Passed" : "Not passed"} />
        ),
    },
    {
      key: "submitted",
      header: "Submitted",
      hideOnMobile: true,
      cell: (row) => <span className="text-sm">{formatDateTime(row.submittedAt, "—")}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {a ? (
          <>
            <StatCard label="Attempts" value={a.attempts.total} icon={Users} hint={`${a.attempts.evaluated} fully graded`} />
            <StatCard label="Average score" value={`${a.attempts.averageScore}`} icon={BarChart3} accent="info" hint={`out of ${a.totalMarks}`} />
            <StatCard label="Passed" value={a.attempts.passCount} icon={Award} accent="success" hint={`Pass mark ${a.passingScore}`} />
            <StatCard label="Pass rate" value={`${a.attempts.passRate}%`} icon={Percent} accent="warning" hint="Of graded attempts" />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        )}
      </div>

      {a && attempts.data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <SimpleBarChart
            title="Invitation funnel"
            description="Where invited candidates are right now"
            valueLabel="Candidates"
            data={FUNNEL.map((f) => ({ label: f.label, value: a.invitations[f.status] ?? 0, highlight: f.status === "ACCEPTED" }))}
          />
          <SimpleBarChart
            title="Score distribution"
            description="Finished attempts by % of total marks (green = at or above the pass band)"
            valueLabel="Attempts"
            data={scoreBins(attempts.data, a)}
          />
        </div>
      ) : null}

      <div className="space-y-3">
        <h2 className="font-semibold">Leaderboard</h2>
        {attempts.isPending ? (
          <TableSkeleton rows={5} />
        ) : attempts.isError ? (
          <ErrorState error={attempts.error} onRetry={() => attempts.refetch()} />
        ) : (
          <DataTable
            caption="Attempts ranked by score"
            columns={columns}
            rows={ranked}
            getRowKey={(r) => r.id}
            empty={
              <EmptyState icon={Users} title="No attempts yet" description="Results appear here as soon as candidates start the assessment." />
            }
          />
        )}
      </div>
    </div>
  );
}
