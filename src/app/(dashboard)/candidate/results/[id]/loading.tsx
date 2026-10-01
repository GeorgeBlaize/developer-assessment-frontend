import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResultLoading() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading result">
      <Skeleton className="h-7 w-28" />
      <Card className="flex-row items-center gap-6 p-6">
        <Skeleton className="size-36 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </Card>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="gap-3 p-5">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-16 w-full" />
        </Card>
      ))}
    </div>
  );
}
