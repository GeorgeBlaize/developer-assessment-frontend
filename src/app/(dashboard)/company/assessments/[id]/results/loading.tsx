import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton } from "@/components/shared/stat-card";
import { TableSkeleton } from "@/components/shared/data-table";

export default function ResultsLoading() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading results">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="gap-3 p-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-52 w-full" />
          </Card>
        ))}
      </div>
      <TableSkeleton rows={5} />
    </div>
  );
}
