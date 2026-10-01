import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { InvitationsList } from "@/components/candidate/invitations-list";
import { PageHeader } from "@/components/shared/page-header";
import { prefetch } from "@/lib/api/prefetch";
import { queryKeys } from "@/lib/api/query-keys";
import { serverFetch } from "@/lib/api/server";
import type { MyInvitation } from "@/types/api";

export const metadata: Metadata = { title: "Invitations" };

export default async function CandidateInvitationsPage() {
  const state = await prefetch([
    {
      queryKey: queryKeys.candidate.invitations,
      queryFn: () => serverFetch<MyInvitation[]>("/invitations/me").then((r) => r.data),
    },
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invitations"
        description="Accept an invitation, then start the assessment when you're ready. The timer begins the moment you start."
      />
      <HydrationBoundary state={state}>
        <InvitationsList />
      </HydrationBoundary>
    </div>
  );
}
