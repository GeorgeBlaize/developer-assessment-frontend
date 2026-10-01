import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ExamWorkspace } from "@/components/candidate/exam/exam-workspace";
import { orNotFound } from "@/lib/api/not-found";
import { serverFetch } from "@/lib/api/server";
import type { AttemptDetail } from "@/types/api";

export const metadata: Metadata = { title: "Assessment in progress", robots: { index: false } };

/**
 * Server Component: loads the attempt (questions arrive sanitised, without correct answers)
 * and only renders the interactive workspace while the attempt is still running.
 */
export default async function AttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: attempt } = await orNotFound(serverFetch<AttemptDetail>(`/attempts/${id}`));
  if (attempt.status !== "IN_PROGRESS") redirect(`/candidate/results/${id}`);

  // If the deadline already passed, the workspace's timer submits immediately on mount and the
  // API finalises the attempt as EXPIRED.
  return <ExamWorkspace initial={attempt} />;
}
