import type { Metadata } from "next";
import Link from "next/link";
import { HydrationBoundary } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssessmentsBrowser } from "@/components/company/assessments-browser";
import { PageHeader } from "@/components/shared/page-header";
import { prefetch } from "@/lib/api/prefetch";
import { queryKeys } from "@/lib/api/query-keys";
import { serverFetch } from "@/lib/api/server";
import { assessmentListParams } from "@/lib/list-params";
import type { AssessmentListItem } from "@/types/api";

export const metadata: Metadata = { title: "Assessments" };

export default async function AssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = assessmentListParams(await searchParams);
  const state = await prefetch([
    {
      queryKey: queryKeys.assessments.list(params),
      queryFn: () => serverFetch<AssessmentListItem[]>("/assessments", { query: params }),
    },
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessments"
        description="Draft, publish and archive your technical screens."
        actions={
          <Button asChild size="lg">
            <Link href="/company/assessments/new">
              <Plus /> New assessment
            </Link>
          </Button>
        }
      />
      <HydrationBoundary state={state}>
        <AssessmentsBrowser />
      </HydrationBoundary>
    </div>
  );
}
