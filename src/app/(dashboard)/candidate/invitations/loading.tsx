import { Skeleton } from "@/components/ui/skeleton";
import { InvitationGridSkeleton } from "@/components/candidate/invitations-list";

export default function InvitationsLoading() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading invitations">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-[30rem] max-w-full" />
      </div>
      <Skeleton className="h-9 w-72" />
      <InvitationGridSkeleton />
    </div>
  );
}
