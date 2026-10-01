"use client";

import { useSearchParams } from "next/navigation";
import { FilterX, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DataTable, TableSkeleton, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAuditLogs } from "@/hooks/queries/use-admin";
import { useUrlState } from "@/hooks/use-url-state";
import { ROLE_LABEL } from "@/lib/auth/constants";
import { humanize } from "@/lib/format";
import { RelativeTime } from "@/components/shared/relative-time";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES, auditLogParams } from "@/lib/list-params";
import type { AuditLog } from "@/types/api";

const ENTITY_OPTIONS = AUDIT_ENTITY_TYPES.map((t) => ({ value: t, label: t }));
const ACTION_OPTIONS = AUDIT_ACTIONS.map((a) => ({ value: a, label: humanize(a) }));
const ORDER_OPTIONS = [
  { value: "desc", label: "Newest first" },
  { value: "asc", label: "Oldest first" },
];

function actionTone(action: string) {
  if (action.includes("FAIL") || action.includes("DELETE") || action.includes("CANCEL")) return "danger" as const;
  if (action.includes("SUCCESS") || action.includes("PUBLISH") || action.includes("GRADE")) return "success" as const;
  if (action.startsWith("LOGIN") || action === "REGISTER") return "info" as const;
  return "primary" as const;
}

export function AuditLogTable() {
  const searchParams = useSearchParams();
  const params = auditLogParams(searchParams);
  const { setParams } = useUrlState();
  const { data, isPending, isError, error, refetch, isPlaceholderData, isFetching } = useAuditLogs(params);
  const hasFilters = Boolean(params.entityType || params.action);

  const columns: Column<AuditLog>[] = [
    {
      key: "action",
      header: "Action",
      cell: (log) => <StatusBadge status={log.action} label={humanize(log.action)} tone={actionTone(log.action)} />,
    },
    {
      key: "actor",
      header: "Actor",
      cell: (log) =>
        log.actor ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{log.actor.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {ROLE_LABEL[log.actor.role]} · {log.actor.email}
            </p>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">System / payment gateway</span>
        ),
    },
    {
      key: "entity",
      header: "Entity",
      hideOnMobile: true,
      cell: (log) => (
        <div>
          <p className="text-sm">{log.entityType}</p>
          {log.entityId ? <p className="font-mono text-[11px] text-muted-foreground">{log.entityId.slice(0, 8)}…</p> : null}
        </div>
      ),
    },
    {
      key: "ip",
      header: "IP",
      hideOnMobile: true,
      cell: (log) => <span className="font-mono text-xs text-muted-foreground">{log.ipAddress ?? "—"}</span>,
    },
    {
      key: "when",
      header: "When",
      cell: (log) => (
        <RelativeTime value={log.createdAt} className="text-sm whitespace-nowrap" />
      ),
    },
    {
      key: "details",
      header: <span className="sr-only">Details</span>,
      className: "text-right",
      cell: (log) =>
        log.metadata ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                Details
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Metadata</p>
              <pre className="max-h-60 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </PopoverContent>
          </Popover>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <FilterSelect paramKey="entityType" label="Entity" allLabel="All entities" options={ENTITY_OPTIONS} />
        <FilterSelect paramKey="action" label="Action" allLabel="All actions" options={ACTION_OPTIONS} className="sm:w-56" />
        <FilterSelect paramKey="order" label="Order" options={ORDER_OPTIONS} defaultValue="desc" />
        {hasFilters ? (
          <Button variant="ghost" onClick={() => setParams({ entityType: null, action: null })}>
            <FilterX /> Clear
          </Button>
        ) : null}
      </div>

      {isPending ? (
        <TableSkeleton rows={10} columns={5} />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <>
          <DataTable
            caption="Audit log"
            columns={columns}
            rows={data.data}
            getRowKey={(l) => l.id}
            isFetching={isPlaceholderData && isFetching}
            empty={
              <EmptyState
                icon={ScrollText}
                title="No matching events"
                description="Nothing has been logged for this combination of filters yet."
              />
            }
          />
          {data.meta ? <PaginationBar meta={data.meta} noun="events" /> : null}
        </>
      )}
    </div>
  );
}
