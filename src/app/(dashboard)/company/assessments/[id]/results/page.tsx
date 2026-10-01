import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { ResultsPanel } from "@/components/company/results-panel";
import { prefetch } from "@/lib/api/prefetch";
import { queryKeys } from "@/lib/api/query-keys";
import { serverFetch } from "@/lib/api/server";
import type { AssessmentAnalytics, CompanyAttempt } from "@/types/api";

export const metadata: Metadata = { title: "Results" };

export default async function AssessmentResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Both datasets are fetched in parallel on the server and handed to the client cache.
  const state = await prefetch([
    {
      queryKey: queryKeys.assessments.analytics(id),
      queryFn: () => serverFetch<AssessmentAnalytics>(`/assessments/${id}/analytics`).then((r) => r.data),
    },
    {
      queryKey: queryKeys.assessments.attempts(id),
      queryFn: () => serverFetch<CompanyAttempt[]>(`/assessments/${id}/attempts`).then((r) => r.data),
    },
  ]);

  return (
    <HydrationBoundary state={state}>
      <ResultsPanel assessmentId={id} />
    </HydrationBoundary>
  );
}
