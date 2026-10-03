import { Skeleton } from "@/components/ui/skeleton";

/** Shown while a public page streams in (e.g. pricing when its ISR cache is being refreshed). */
export default function PublicLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-16 sm:px-6 md:py-24" aria-busy aria-label="Loading">
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <Skeleton className="mx-auto h-4 w-24" />
        <Skeleton className="mx-auto h-12 w-full" />
        <Skeleton className="mx-auto h-5 w-3/4" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
