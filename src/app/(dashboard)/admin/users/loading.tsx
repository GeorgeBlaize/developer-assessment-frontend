import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/shared/data-table";

export default function UsersLoading() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading users">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Skeleton className="h-9 w-full sm:w-72" />
        <Skeleton className="h-9 w-full sm:w-44" />
        <Skeleton className="h-9 w-full sm:w-44" />
      </div>
      <TableSkeleton rows={8} />
    </div>
  );
}
