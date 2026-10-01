"use client";

import { Info, MailPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DataTable, TableSkeleton, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useCompanyDashboard, useInvitations } from "@/hooks/queries/use-company";
import { formatDate } from "@/lib/format";
import { RelativeTime } from "@/components/shared/relative-time";
import type { AssessmentStatus, CompanyInvitation } from "@/types/api";
import { InviteDialog } from "./invite-dialog";

const columns: Column<CompanyInvitation>[] = [
  {
    key: "candidate",
    header: "Candidate",
    cell: (inv) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{inv.candidate.user.name}</p>
        <p className="truncate text-xs text-muted-foreground">{inv.email}</p>
      </div>
    ),
  },
  { key: "status", header: "Invitation", cell: (inv) => <StatusBadge status={inv.status} /> },
  {
    key: "attempt",
    header: "Attempt",
    cell: (inv) =>
      inv.attempt ? <StatusBadge status={inv.attempt.status} /> : <span className="text-xs text-muted-foreground">Not started</span>,
  },
  {
    key: "score",
    header: "Score",
    hideOnMobile: true,
    cell: (inv) =>
      inv.attempt?.totalScore !== null && inv.attempt?.totalScore !== undefined ? (
        <span className="font-medium tabular-nums">{inv.attempt.totalScore}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  { key: "invited", header: "Invited", hideOnMobile: true, cell: (inv) => <RelativeTime value={inv.invitedAt} className="text-sm" /> },
  { key: "expires", header: "Expires", hideOnMobile: true, cell: (inv) => <span className="text-sm">{formatDate(inv.expiresAt)}</span> },
];

export function CandidatesPanel({ assessmentId, status }: { assessmentId: string; status: AssessmentStatus }) {
  const { data: invitations, isPending, isError, error, refetch } = useInvitations(assessmentId);
  const { data: dashboard } = useCompanyDashboard();
  const limit = dashboard?.plan?.maxInvitesPerAssessment;
  const remaining = limit !== undefined && invitations ? Math.max(limit - invitations.length, 0) : null;
  const canInvite = status === "PUBLISHED";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Invited candidates</h2>
          <p className="text-sm text-muted-foreground">
            {invitations ? `${invitations.length} invited` : "Loading…"}
            {limit !== undefined ? ` · plan limit ${limit} per assessment` : ""}
          </p>
        </div>
        <InviteDialog assessmentId={assessmentId} remaining={remaining} disabled={!canInvite || remaining === 0} />
      </div>

      {!canInvite ? (
        <Alert>
          <Info />
          <AlertDescription>Publish this assessment to start inviting candidates.</AlertDescription>
        </Alert>
      ) : null}

      {isPending ? (
        <TableSkeleton rows={5} />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <DataTable
          caption="Invited candidates"
          columns={columns}
          rows={invitations}
          getRowKey={(i) => i.id}
          empty={
            <EmptyState
              icon={MailPlus}
              title="Nobody invited yet"
              description={canInvite ? "Invite registered candidates by email. Try candidate@demo.dev." : "Invitations open once published."}
            />
          }
        />
      )}
    </div>
  );
}
