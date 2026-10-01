import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlansLoading() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading plans">
      <div className="space-y-2">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="gap-5 p-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-32" />
            <div className="space-y-2.5">
              {Array.from({ length: 4 }).map((__, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
            <Skeleton className="h-9 w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}
