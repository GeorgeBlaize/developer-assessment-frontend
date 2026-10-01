import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/shared/data-table";

export default function AuditLogsLoading() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading audit logs">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-[28rem] max-w-full" />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Skeleton className="h-9 w-full sm:w-44" />
        <Skeleton className="h-9 w-full sm:w-56" />
        <Skeleton className="h-9 w-full sm:w-44" />
      </div>
      <TableSkeleton rows={10} columns={5} />
    </div>
  );
}
