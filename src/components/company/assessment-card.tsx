import Link from "next/link";
import { CalendarDays, Clock, FileQuestion, MailPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatDuration } from "@/lib/format";
import type { AssessmentListItem } from "@/types/api";

export function AssessmentCard({ assessment: a }: { assessment: AssessmentListItem }) {
  return (
    <Card className="group relative gap-4 p-5 transition-shadow hover:shadow-md hover:ring-primary/30">
      <div className="flex items-start justify-between gap-3">
        <StatusBadge status={a.status} />
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" aria-hidden /> {formatDate(a.createdAt)}
        </span>
      </div>
      <div className="space-y-1.5">
        <h3 className="leading-snug font-semibold">
          <Link href={`/company/assessments/${a.id}`} className="after:absolute after:inset-0 group-hover:text-primary">
            {a.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{a.description}</p>
      </div>
      <dl className="mt-auto flex flex-wrap gap-x-4 gap-y-1.5 border-t pt-4 text-xs whitespace-nowrap text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <FileQuestion className="size-3.5 text-muted-foreground" aria-hidden />
          <dt className="sr-only">Questions</dt>
          <dd>
            {a._count.problems} question{a._count.problems === 1 ? "" : "s"}
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-muted-foreground" aria-hidden />
          <dt className="sr-only">Duration</dt>
          <dd>{formatDuration(a.durationMinutes)}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <MailPlus className="size-3.5 text-muted-foreground" aria-hidden />
          <dt className="sr-only">Invitations</dt>
          <dd>{a._count.invitations} invited</dd>
        </div>
      </dl>
    </Card>
  );
}
