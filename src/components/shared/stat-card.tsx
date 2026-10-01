import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent?: "primary" | "success" | "warning" | "info" | "danger";
  className?: string;
}

const ACCENTS: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/12 text-emerald-600 dark:text-emerald-300",
  warning: "bg-warning/15 text-amber-600 dark:text-amber-300",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  danger: "bg-destructive/10 text-destructive",
};

export function StatCard({ label, value, icon: Icon, hint, accent = "primary", className }: StatCardProps) {
  return (
    <Card className={cn("gap-3 px-5 py-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", ACCENTS[accent])}>
          <Icon className="size-4.5" aria-hidden />
        </span>
      </div>
      <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="gap-3 px-5 py-5">
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-9 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-32" />
    </Card>
  );
}
