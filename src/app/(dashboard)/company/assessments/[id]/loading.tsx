import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssessmentTabLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]" aria-busy aria-label="Loading">
      <Card className="gap-4 p-6">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </Card>
      <Card className="gap-3 p-6">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </Card>
    </div>
  );
}
