import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { AuditLogTable } from "@/components/admin/audit-log-table";
import { PageHeader } from "@/components/shared/page-header";
import { prefetch } from "@/lib/api/prefetch";
import { queryKeys } from "@/lib/api/query-keys";
import { serverFetch } from "@/lib/api/server";
import { auditLogParams } from "@/lib/list-params";
import type { AuditLog } from "@/types/api";

export const metadata: Metadata = { title: "Audit logs" };

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = auditLogParams(await searchParams);
  const state = await prefetch([
    {
      queryKey: queryKeys.admin.auditLogs(params),
      queryFn: () => serverFetch<AuditLog[]>("/admin/audit-logs", { query: params }),
    },
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit logs"
        description="A tamper-evident record of sign-ins, publishing, invitations, grading, payments and account changes."
      />
      <HydrationBoundary state={state}>
        <AuditLogTable />
      </HydrationBoundary>
    </div>
  );
}
