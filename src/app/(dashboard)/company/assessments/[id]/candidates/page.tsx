import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { CandidatesPanel } from "@/components/company/candidates-panel";
import { prefetch } from "@/lib/api/prefetch";
import { queryKeys } from "@/lib/api/query-keys";
import { serverFetch } from "@/lib/api/server";
import type { CompanyInvitation } from "@/types/api";
import { getCompanyAssessment } from "../data";

export const metadata: Metadata = { title: "Candidates" };

export default async function AssessmentCandidatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ data: assessment }, state] = await Promise.all([
    getCompanyAssessment(id),
    prefetch([
      {
        queryKey: queryKeys.assessments.invitations(id),
        queryFn: () => serverFetch<CompanyInvitation[]>(`/assessments/${id}/invitations`).then((r) => r.data),
      },
    ]),
  ]);

  return (
    <HydrationBoundary state={state}>
      <CandidatesPanel assessmentId={id} status={assessment.status} />
    </HydrationBoundary>
  );
}
