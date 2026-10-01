import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/shared/data-table";

export default function ResultsLoading() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading results">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <TableSkeleton rows={5} />
    </div>
  );
}
