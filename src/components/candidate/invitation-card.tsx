"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, Check, Clock, Loader2, Play, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { useRespondToInvitation, useStartAttempt } from "@/hooks/queries/use-candidate";
import { formatDate, formatDuration, formatRelative } from "@/lib/format";
import type { MyInvitation } from "@/types/api";

export function InvitationCard({ invitation: inv }: { invitation: MyInvitation }) {
  const router = useRouter();
  const respond = useRespondToInvitation();
  const start = useStartAttempt();
  const expired = new Date(inv.expiresAt) < new Date() && inv.status === "PENDING";
  const attempt = inv.attempt;
  const available = inv.assessment.status === "PUBLISHED";

  const begin = () =>
    start.mutate(inv.id, {
      onSuccess: ({ data }) => router.push(`/attempt/${data.id}`),
    });

  let action: React.ReactNode = null;
  if (attempt?.status === "IN_PROGRESS") {
    action = (
      <Button asChild>
        <Link href={`/attempt/${attempt.id}`}>
          <Play /> Resume
        </Link>
      </Button>
    );
  } else if (attempt) {
    action = (
      <Button asChild variant="outline">
        <Link href={`/candidate/results/${attempt.id}`}>
          <Trophy /> View result
        </Link>
      </Button>
    );
  } else if (inv.status === "PENDING" && !expired) {
    action = (
      <div className="flex gap-2">
        <Button variant="outline" disabled={respond.isPending} onClick={() => respond.mutate({ id: inv.id, action: "DECLINE" })}>
          <X /> Decline
        </Button>
        <Button disabled={respond.isPending} onClick={() => respond.mutate({ id: inv.id, action: "ACCEPT" })}>
          {respond.isPending ? <Loader2 className="animate-spin" /> : <Check />} Accept
        </Button>
      </div>
    );
  } else if (inv.status === "ACCEPTED") {
    action = (
      <ConfirmDialog
        trigger={
          <Button disabled={start.isPending || !available}>
            {start.isPending ? <Loader2 className="animate-spin" /> : <Play />} Start assessment
          </Button>
        }
        title={`Start "${inv.assessment.title}"?`}
        description={`The ${formatDuration(inv.assessment.durationMinutes)} timer starts immediately and can't be paused. Answers save as you go, and the attempt is submitted automatically when time runs out.`}
        confirmLabel="Start now"
        pending={start.isPending}
        onConfirm={begin}
      />
    );
  }

  return (
    <Card className="gap-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusBadge status={expired ? "EXPIRED" : inv.status} />
        <span className="text-xs text-muted-foreground">Invited {formatRelative(inv.invitedAt)}</span>
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold">{inv.assessment.title}</h3>
        {!available && !attempt ? <p className="text-sm text-warning-foreground dark:text-warning">This assessment is currently closed.</p> : null}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <Clock className="size-4" aria-hidden /> {formatDuration(inv.assessment.durationMinutes)}
        </li>
        {inv.assessment.totalMarks ? (
          <li className="flex items-center gap-1.5">
            <Trophy className="size-4" aria-hidden /> {inv.assessment.totalMarks} marks
          </li>
        ) : null}
        {inv.status === "PENDING" ? (
          <li className="flex items-center gap-1.5">
            <CalendarClock className="size-4" aria-hidden /> Respond by {formatDate(inv.expiresAt)}
          </li>
        ) : null}
      </ul>
      {action ? <div className="flex justify-end border-t pt-4">{action}</div> : null}
    </Card>
  );
}
