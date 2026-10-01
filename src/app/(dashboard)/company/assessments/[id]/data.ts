import "server-only";
import { cache } from "react";
import { serverFetch } from "@/lib/api/server";
import type { AssessmentDetail } from "@/types/api";

/** Deduped per request: the layout, metadata and tab pages can all call it for free. */
export const getCompanyAssessment = cache((id: string) => serverFetch<AssessmentDetail>(`/assessments/${id}`));
