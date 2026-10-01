import { Skeleton } from "@/components/ui/skeleton";

export default function AttemptLoading() {
  return (
    <div className="min-h-dvh" aria-busy aria-label="Loading assessment">
      <div className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
        <div className="flex gap-2 lg:flex-col">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-12 lg:w-full" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
