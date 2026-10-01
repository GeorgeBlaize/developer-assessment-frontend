"use client";

import { useSearchParams } from "next/navigation";
import { Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { useMyInvitations } from "@/hooks/queries/use-candidate";
import { useUrlState } from "@/hooks/use-url-state";
import type { MyInvitation } from "@/types/api";
import { InvitationCard } from "./invitation-card";

const FILTERS = {
  action: {
    label: "Needs action",
    match: (i: MyInvitation) => i.status === "PENDING" || (i.status === "ACCEPTED" && (!i.attempt || i.attempt.status === "IN_PROGRESS")),
  },
  completed: { label: "Completed", match: (i: MyInvitation) => Boolean(i.attempt && i.attempt.status !== "IN_PROGRESS") },
  all: { label: "All", match: () => true },
} as const;
type FilterKey = keyof typeof FILTERS;

export function InvitationGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2" aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="gap-4 p-5">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="ml-auto h-9 w-40" />
        </Card>
      ))}
    </div>
  );
}

export function InvitationsList() {
  const searchParams = useSearchParams();
  const { setParams } = useUrlState();
  const raw = searchParams.get("view");
  const view: FilterKey = raw === "completed" || raw === "all" ? raw : "action";
  const { data, isPending, isError, error, refetch } = useMyInvitations();

  const counts = data
    ? (Object.keys(FILTERS) as FilterKey[]).reduce(
        (acc, key) => ({ ...acc, [key]: data.filter(FILTERS[key].match).length }),
        {} as Record<FilterKey, number>,
      )
    : null;
  const visible = data?.filter(FILTERS[view].match) ?? [];

  return (
    <div className="space-y-5">
      <Tabs value={view} onValueChange={(v) => setParams({ view: v === "action" ? null : v })}>
        <TabsList>
          {(Object.keys(FILTERS) as FilterKey[]).map((key) => (
            <TabsTrigger key={key} value={key}>
              {FILTERS[key].label}
              {counts ? <span className="ml-1 text-xs text-muted-foreground tabular-nums">{counts[key]}</span> : null}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isPending ? (
        <InvitationGridSkeleton />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={view === "action" ? "You're all caught up" : "Nothing here yet"}
          description={
            view === "action"
              ? "New invitations from companies will appear here. Share your registered email with recruiters."
              : "Completed assessments will show up here."
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((inv) => (
            <InvitationCard key={inv.id} invitation={inv} />
          ))}
        </div>
      )}
    </div>
  );
}
