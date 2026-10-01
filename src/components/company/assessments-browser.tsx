"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { SearchInput } from "@/components/shared/search-input";
import { useAssessments } from "@/hooks/queries/use-company";
import { useUrlState } from "@/hooks/use-url-state";
import { ASSESSMENT_SORTS, assessmentListParams } from "@/lib/list-params";
import { cn } from "@/lib/utils";
import { AssessmentCard } from "./assessment-card";

const STATUS_TABS = [
  { value: "ALL", label: "All" },
  { value: "DRAFT", label: "Drafts" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

export function AssessmentGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="gap-4 p-5">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-full" />
        </Card>
      ))}
    </div>
  );
}

export function AssessmentsBrowser() {
  const searchParams = useSearchParams();
  const params = assessmentListParams(searchParams);
  const { setParams } = useUrlState();
  const { data, isPending, isError, error, refetch, isPlaceholderData, isFetching } = useAssessments(params);
  const filtered = Boolean(params.search || params.status);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={params.status ?? "ALL"} onValueChange={(v) => setParams({ status: v === "ALL" ? null : v })}>
          <TabsList className="w-full sm:w-auto">
            {STATUS_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="flex-1 sm:flex-none">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex flex-col gap-2 sm:flex-row">
          <SearchInput placeholder="Search by title…" />
          <FilterSelect paramKey="sort" label="Sort" options={ASSESSMENT_SORTS} defaultValue="createdAt.desc" />
        </div>
      </div>

      {isPending ? (
        <AssessmentGridSkeleton />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data.data.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={filtered ? "No assessments match" : "No assessments yet"}
          description={
            filtered
              ? "Try another search term or status."
              : "Create your first assessment with coding, multiple-choice and written questions."
          }
          action={
            filtered ? (
              <Button variant="outline" onClick={() => setParams({ search: null, status: null })}>
                Clear filters
              </Button>
            ) : (
              <Button asChild>
                <Link href="/company/assessments/new">
                  <Plus /> New assessment
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <>
          <div
            className={cn("grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3", isPlaceholderData && isFetching && "opacity-60")}
            aria-busy={isFetching || undefined}
          >
            {data.data.map((a) => (
              <AssessmentCard key={a.id} assessment={a} />
            ))}
          </div>
          {data.meta ? <PaginationBar meta={data.meta} noun="assessments" /> : null}
        </>
      )}
    </div>
  );
}
