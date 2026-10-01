"use client";

import { useSearchParams } from "next/navigation";
import { Receipt } from "lucide-react";
import { DataTable, TableSkeleton, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { usePayments } from "@/hooks/queries/use-company";
import { formatDateTime, formatMoney } from "@/lib/format";
import { paymentListParams } from "@/lib/list-params";
import type { Payment } from "@/types/api";

const columns: Column<Payment>[] = [
  {
    key: "plan",
    header: "Plan",
    cell: (p) => (
      <div>
        <p className="font-medium">{p.plan.name}</p>
        <p className="font-mono text-[11px] text-muted-foreground">{p.tranId.slice(0, 18)}…</p>
      </div>
    ),
  },
  { key: "amount", header: "Amount", cell: (p) => <span className="font-medium tabular-nums">{formatMoney(p.amount, p.currency)}</span> },
  { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
  { key: "date", header: "Date", hideOnMobile: true, cell: (p) => <span className="text-sm">{formatDateTime(p.createdAt)}</span> },
  {
    key: "validated",
    header: "Confirmed",
    hideOnMobile: true,
    cell: (p) => <span className="text-sm text-muted-foreground">{formatDateTime(p.validatedAt, "—")}</span>,
  },
];

export function PaymentHistory() {
  const searchParams = useSearchParams();
  const params = paymentListParams(searchParams);
  const { data, isPending, isError, error, refetch, isPlaceholderData, isFetching } = usePayments(params);

  if (isPending) return <TableSkeleton rows={4} />;
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />;

  return (
    <div className="space-y-4">
      <DataTable
        caption="Payment history"
        columns={columns}
        rows={data.data}
        getRowKey={(p) => p.id}
        isFetching={isPlaceholderData && isFetching}
        empty={<EmptyState icon={Receipt} title="No payments yet" description="Upgrades and renewals will appear here." />}
      />
      {data.meta ? <PaginationBar meta={data.meta} noun="payments" /> : null}
    </div>
  );
}
