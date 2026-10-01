import type { Metadata } from "next";
import { Suspense } from "react";
import { GradingQueue } from "@/components/company/grading-queue";
import GradingLoading from "./loading";

export const metadata: Metadata = { title: "Grading" };

export default async function AssessmentGradingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // The queue is fully client-driven (status filter in the URL, optimistic grading).
  return (
    <Suspense fallback={<GradingLoading />}>
      <GradingQueue assessmentId={id} />
    </Suspense>
  );
}
