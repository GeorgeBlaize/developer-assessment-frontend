import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function GradingLoading() {
  return (
    <div className="space-y-4" aria-busy aria-label="Loading grading queue">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-9 w-52" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="gap-3 p-5">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </Card>
      ))}
    </div>
  );
}
