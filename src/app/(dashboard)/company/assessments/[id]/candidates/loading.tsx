import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/shared/data-table";

export default function CandidatesLoading() {
  return (
    <div className="space-y-4" aria-busy aria-label="Loading candidates">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-8 w-40" />
      </div>
      <TableSkeleton rows={5} />
    </div>
  );
}
