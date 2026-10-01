"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Archive, ArrowLeft, CalendarClock, Clock, Loader2, MoreHorizontal, Rocket, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAssessment, useAssessmentAction } from "@/hooks/queries/use-company";
import { formatDateTime, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AssessmentDetail } from "@/types/api";

const TABS = [
  { segment: "", label: "Overview" },
  { segment: "/candidates", label: "Candidates" },
  { segment: "/results", label: "Results" },
  { segment: "/grading", label: "Grading" },
];

export function AssessmentHeader({ initial }: { initial: AssessmentDetail }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: assessment = initial } = useAssessment(initial.id);
  const action = useAssessmentAction(initial.id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const base = `/company/assessments/${assessment.id}`;
  const liveProblems = assessment.problems.filter((p) => !p.deletedAt).length;

  const run = (kind: "publish" | "archive" | "delete") =>
    action.mutate(kind, {
      onSuccess: () => {
        toast.success(kind === "publish" ? "Published. You can now invite candidates." : kind === "archive" ? "Assessment archived" : "Assessment deleted");
        if (kind === "delete") router.replace("/company/assessments");
        else router.refresh();
      },
    });

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/company/assessments">
          <ArrowLeft /> Assessments
        </Link>
      </Button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={assessment.status} />
            <span className="text-xs text-muted-foreground">Updated {formatDateTime(assessment.updatedAt)}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight break-words sm:text-3xl">{assessment.title}</h1>
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden /> {formatDuration(assessment.durationMinutes)}
            </li>
            <li className="flex items-center gap-1.5">
              <Target className="size-4" aria-hidden /> Pass mark {assessment.passingScore}
              {assessment.totalMarks ? ` / ${assessment.totalMarks}` : ""}
            </li>
            {assessment.endWindow ? (
              <li className="flex items-center gap-1.5">
                <CalendarClock className="size-4" aria-hidden /> Closes {formatDateTime(assessment.endWindow)}
              </li>
            ) : null}
          </ul>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {assessment.status !== "PUBLISHED" ? (
            <ConfirmDialog
              trigger={
                <Button disabled={action.isPending || liveProblems === 0}>
                  {action.isPending ? <Loader2 className="animate-spin" /> : <Rocket />}
                  {assessment.status === "ARCHIVED" ? "Re-publish" : "Publish"}
                </Button>
              }
              title="Publish this assessment?"
              description={`Questions are locked once published, and total marks are fixed from the ${liveProblems} question${liveProblems === 1 ? "" : "s"}. You'll then be able to invite candidates.`}
              confirmLabel="Publish"
              onConfirm={() => run("publish")}
            />
          ) : (
            <Button asChild>
              <Link href={`${base}/candidates`}>Invite candidates</Link>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="More actions">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled={assessment.status === "ARCHIVED"} onSelect={() => run("archive")}>
                <Archive /> Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                disabled={assessment.status === "PUBLISHED"}
                onSelect={() => setConfirmDelete(true)}
              >
                <Trash2 /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ConfirmDialog
            open={confirmDelete}
            onOpenChange={setConfirmDelete}
            title="Delete this assessment?"
            description="It will be removed from your workspace. Published assessments must be archived first."
            confirmLabel="Delete"
            destructive
            pending={action.isPending}
            onConfirm={() => run("delete")}
          />
        </div>
      </div>

      <nav aria-label="Assessment sections" className="-mx-4 overflow-x-auto border-b px-4 sm:mx-0 sm:px-0">
        <ul className="flex min-w-max gap-1">
          {TABS.map((tab) => {
            const href = `${base}${tab.segment}`;
            const active = pathname === href;
            return (
              <li key={tab.label}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-10 items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                    active && "text-foreground after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary",
                  )}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
