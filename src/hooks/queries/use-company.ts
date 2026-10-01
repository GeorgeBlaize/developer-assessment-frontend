"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { queryKeys, type ListParams } from "@/lib/api/query-keys";
import { toAssessmentPayload, toProblemPayload, type AssessmentDetailsInput, type ProblemInput } from "@/lib/validations/assessment";
import type {
  ApiSuccess,
  Assessment,
  AssessmentAnalytics,
  AssessmentDetail,
  AssessmentListItem,
  CompanyAttempt,
  CompanyDashboard,
  CompanyInvitation,
  CompanySubmission,
  InviteResult,
  Payment,
  Problem,
  SubmissionStatus,
  SubscribeResult,
} from "@/types/api";

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export function useCompanyDashboard() {
  return useQuery({
    queryKey: queryKeys.company.dashboard,
    queryFn: () => api.get<CompanyDashboard>("companies/me/dashboard").then((r) => r.data),
  });
}

export function useAssessments(params: ListParams) {
  return useQuery({
    queryKey: queryKeys.assessments.list(params),
    queryFn: ({ signal }) => api.get<AssessmentListItem[]>("assessments", { query: params, signal }),
    placeholderData: keepPreviousData,
  });
}

export function useAssessment(id: string) {
  return useQuery({
    queryKey: queryKeys.assessments.detail(id),
    queryFn: () => api.get<AssessmentDetail>(`assessments/${id}`).then((r) => r.data),
  });
}

export function useProblems(assessmentId: string) {
  return useQuery({
    queryKey: queryKeys.assessments.problems(assessmentId),
    queryFn: () =>
      api
        .get<Problem[]>(`assessments/${assessmentId}/problems`)
        .then((r) => r.data.filter((p) => !p.deletedAt).sort((a, b) => a.order - b.order)),
  });
}

export function useInvitations(assessmentId: string) {
  return useQuery({
    queryKey: queryKeys.assessments.invitations(assessmentId),
    queryFn: () => api.get<CompanyInvitation[]>(`assessments/${assessmentId}/invitations`).then((r) => r.data),
  });
}

export function useAssessmentAttempts(assessmentId: string) {
  return useQuery({
    queryKey: queryKeys.assessments.attempts(assessmentId),
    queryFn: () => api.get<CompanyAttempt[]>(`assessments/${assessmentId}/attempts`).then((r) => r.data),
  });
}

export function useAssessmentAnalytics(assessmentId: string) {
  return useQuery({
    queryKey: queryKeys.assessments.analytics(assessmentId),
    queryFn: () => api.get<AssessmentAnalytics>(`assessments/${assessmentId}/analytics`).then((r) => r.data),
  });
}

export function useSubmissions(assessmentId: string, status?: SubmissionStatus) {
  return useQuery({
    queryKey: queryKeys.assessments.submissions(assessmentId, status),
    queryFn: () =>
      api.get<CompanySubmission[]>(`assessments/${assessmentId}/submissions`, { query: { status } }).then((r) => r.data),
    placeholderData: keepPreviousData,
  });
}

export function usePayments(params: ListParams) {
  return useQuery({
    queryKey: queryKeys.company.payments(params),
    queryFn: () => api.get<Payment[]>("payments", { query: params }),
    placeholderData: keepPreviousData,
  });
}

// ---------------------------------------------------------------------------
// Assessment lifecycle
// ---------------------------------------------------------------------------

function useInvalidateAssessment() {
  const queryClient = useQueryClient();
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ["assessments", "list"] });
    queryClient.invalidateQueries({ queryKey: queryKeys.company.dashboard });
    if (id) queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(id) });
  };
}

export function useUpdateAssessment(id: string) {
  const invalidate = useInvalidateAssessment();
  return useMutation({
    mutationFn: (values: AssessmentDetailsInput) => api.patch<Assessment>(`assessments/${id}`, toAssessmentPayload(values)),
    meta: { successMessage: "Assessment details saved" },
    onSuccess: () => invalidate(id),
  });
}

export function useAssessmentAction(id: string) {
  const invalidate = useInvalidateAssessment();
  return useMutation({
    mutationFn: (action: "publish" | "archive" | "delete"): Promise<ApiSuccess<Assessment | null>> =>
      action === "delete" ? api.delete<null>(`assessments/${id}`) : api.patch<Assessment>(`assessments/${id}/${action}`),
    onSuccess: (_res, action) => {
      invalidate(action === "delete" ? undefined : id);
    },
  });
}

/**
 * Wizard submit: create the assessment, add each question in order, then optionally publish.
 * Runs sequentially because question order is derived server-side from insertion order.
 */
export function useCreateAssessmentWithProblems() {
  const invalidate = useInvalidateAssessment();
  return useMutation({
    mutationFn: async ({
      details,
      problems,
      publish,
      onProgress,
    }: {
      details: AssessmentDetailsInput;
      problems: ProblemInput[];
      publish: boolean;
      onProgress?: (step: string) => void;
    }) => {
      onProgress?.("Creating assessment…");
      const { data: assessment } = await api.post<Assessment>("assessments", toAssessmentPayload(details));
      for (const [i, problem] of problems.entries()) {
        onProgress?.(`Adding question ${i + 1} of ${problems.length}…`);
        await api.post<Problem>(`assessments/${assessment.id}/problems`, { ...toProblemPayload(problem), order: i });
      }
      let published = false;
      let publishError: string | null = null;
      if (publish) {
        onProgress?.("Publishing…");
        try {
          await api.patch<Assessment>(`assessments/${assessment.id}/publish`);
          published = true;
        } catch (error) {
          // Keep the created draft; surface why it couldn't be published (e.g. plan limit).
          publishError = error instanceof Error ? error.message : "Publishing failed";
        }
      }
      return { assessment, published, publishError };
    },
    onSuccess: ({ assessment }) => invalidate(assessment.id),
  });
}

// ---------------------------------------------------------------------------
// Problems (draft only)
// ---------------------------------------------------------------------------

export function useSaveProblem(assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ problemId, values, order }: { problemId?: string; values: ProblemInput; order?: number }) =>
      problemId
        ? api.patch<Problem>(`assessments/${assessmentId}/problems/${problemId}`, toProblemPayload(values, { includeType: false }))
        : api.post<Problem>(`assessments/${assessmentId}/problems`, { ...toProblemPayload(values), order }),
    meta: { successMessage: "Question saved" },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(assessmentId) }),
  });
}

export function useDeleteProblem(assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (problemId: string) => api.delete<null>(`assessments/${assessmentId}/problems/${problemId}`),
    meta: { successMessage: "Question removed" },
    // Optimistically drop it from the list.
    onMutate: async (problemId) => {
      const key = queryKeys.assessments.problems(assessmentId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Problem[]>(key);
      queryClient.setQueryData<Problem[]>(key, (old) => old?.filter((p) => p.id !== problemId));
      return { previous };
    },
    onError: (_e, _id, ctx) => queryClient.setQueryData(queryKeys.assessments.problems(assessmentId), ctx?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(assessmentId) }),
  });
}

// ---------------------------------------------------------------------------
// Invitations & grading
// ---------------------------------------------------------------------------

export function useInviteCandidates(assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { emails: string[]; expiresInDays: number }) =>
      api.post<InviteResult>(`assessments/${assessmentId}/invitations`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(assessmentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.company.dashboard });
    },
  });
}

/** Grade with an optimistic update so the queue reflects the new mark immediately. */
export function useGradeSubmission(assessmentId: string) {
  const queryClient = useQueryClient();
  const prefix = ["assessments", "detail", assessmentId, "submissions"];
  return useMutation({
    mutationFn: ({ submissionId, awardedMarks, feedback }: { submissionId: string; awardedMarks: number; feedback?: string }) =>
      api.patch<CompanySubmission>(`assessments/${assessmentId}/submissions/${submissionId}/grade`, {
        awardedMarks,
        ...(feedback ? { feedback } : {}),
      }),
    meta: { successMessage: "Grade saved" },
    onMutate: async ({ submissionId, awardedMarks, feedback }) => {
      await queryClient.cancelQueries({ queryKey: prefix });
      const previous = queryClient.getQueriesData<CompanySubmission[]>({ queryKey: prefix });
      queryClient.setQueriesData<CompanySubmission[]>({ queryKey: prefix }, (old) =>
        old?.map((s) =>
          s.id === submissionId ? { ...s, awardedMarks, feedback: feedback ?? null, status: "MANUALLY_GRADED" } : s,
        ),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => ctx?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data)),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: prefix });
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.attempts(assessmentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.analytics(assessmentId) });
    },
  });
}

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------

export function useSubscribe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => api.post<SubscribeResult>("payments/subscribe", { planId }),
    onSuccess: ({ data }: ApiSuccess<SubscribeResult>) => {
      if (data.freePlan) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.dashboard });
        queryClient.invalidateQueries({ queryKey: ["company", "payments"] });
      }
    },
  });
}
