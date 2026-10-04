import { cn } from "@/lib/utils";
import { humanize } from "@/lib/format";

type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "primary";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground ring-border",
  info: "bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-300",
  success: "bg-success/12 text-emerald-700 ring-success/25 dark:text-emerald-300",
  warning: "bg-warning/15 text-amber-700 ring-warning/30 dark:text-amber-300",
  danger: "bg-destructive/10 text-red-700 ring-destructive/20 dark:text-red-300",
  primary: "bg-primary/10 text-primary ring-primary/20",
};

/** Every backend status enum mapped to a consistent colour language across the app. */
const STATUS_TONES: Record<string, Tone> = {
  // assessment
  DRAFT: "neutral",
  PUBLISHED: "success",
  ARCHIVED: "warning",
  // invitation
  PENDING: "warning",
  ACCEPTED: "info",
  DECLINED: "danger",
  EXPIRED: "danger",
  // attempt
  NOT_STARTED: "neutral",
  IN_PROGRESS: "info",
  SUBMITTED: "primary",
  EVALUATED: "success",
  // submission
  AUTO_GRADED: "success",
  MANUALLY_GRADED: "success",
  // payment / subscription
  PAID: "success",
  FAILED: "danger",
  CANCELLED: "neutral",
  ACTIVE: "success",
  INACTIVE: "neutral",
  // roles & misc
  ADMIN: "danger",
  COMPANY: "primary",
  CANDIDATE: "info",
  MCQ: "info",
  CODING: "primary",
  WRITTEN: "warning",
  PASSED: "success",
  NOT_PASSED: "danger",
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  tone?: Tone;
  className?: string;
}

export function StatusBadge({ status, label, tone, className }: StatusBadgeProps) {
  const resolved = tone ?? STATUS_TONES[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex h-5.5 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        TONE_CLASSES[resolved],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current opacity-70" />
      {label ?? humanize(status)}
    </span>
  );
}
