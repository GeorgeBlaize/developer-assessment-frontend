import { Skeleton } from "@/components/ui/skeleton";
import { AssessmentGridSkeleton } from "@/components/company/assessments-browser";

export default function AssessmentsLoading() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading assessments">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:justify-between">
        <Skeleton className="h-9 w-full sm:w-80" />
        <Skeleton className="h-9 w-full sm:w-96" />
      </div>
      <AssessmentGridSkeleton />
    </div>
  );
}
