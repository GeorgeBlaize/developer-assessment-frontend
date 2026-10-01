"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Attempt, AttemptDetail, Invitation, MyAttempt, MyInvitation, Submission } from "@/types/api";

export function useMyInvitations() {
  return useQuery({
    queryKey: queryKeys.candidate.invitations,
    queryFn: () => api.get<MyInvitation[]>("invitations/me").then((r) => r.data),
  });
}

export function useMyAttempts() {
  return useQuery({
    queryKey: queryKeys.candidate.attempts,
    queryFn: () => api.get<MyAttempt[]>("attempts").then((r) => r.data),
  });
}

export function useAttempt(id: string, initialData?: AttemptDetail) {
  return useQuery({
    queryKey: queryKeys.candidate.attempt(id),
    queryFn: () => api.get<AttemptDetail>(`attempts/${id}`).then((r) => r.data),
    initialData,
    staleTime: Infinity, // the workspace owns this data while the exam is running
  });
}

/** Accept/decline with an optimistic status flip on the invitation card. */
export function useRespondToInvitation() {
  const queryClient = useQueryClient();
  const key = queryKeys.candidate.invitations;
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "ACCEPT" | "DECLINE" }) =>
      api.patch<Invitation>(`invitations/${id}/respond`, { action }),
    onMutate: async ({ id, action }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MyInvitation[]>(key);
      queryClient.setQueryData<MyInvitation[]>(key, (old) =>
        old?.map((inv) => (inv.id === id ? { ...inv, status: action === "ACCEPT" ? "ACCEPTED" : "DECLINED" } : inv)),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(key, ctx?.previous),
    onSuccess: (_r, { action }) => {
      if (action === "ACCEPT") toast.success("Invitation accepted. Start whenever you're ready.");
      else toast.message("Invitation declined");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useStartAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => api.post<Attempt>(`invitations/${invitationId}/start`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidate.invitations });
      queryClient.invalidateQueries({ queryKey: queryKeys.candidate.attempts });
    },
  });
}

export interface AnswerBody {
  problemId: string;
  answerText?: string;
  selectedOptionId?: string;
}

/** Saves one answer; the cached attempt is patched so the question nav shows it as saved. */
export function useSubmitAnswer(attemptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AnswerBody) => api.post<Submission>(`attempts/${attemptId}/submit`, body),
    meta: { skipErrorToast: true },
    onSuccess: ({ data }) => {
      queryClient.setQueryData<AttemptDetail>(queryKeys.candidate.attempt(attemptId), (old) =>
        old
          ? {
              ...old,
              submissions: [...old.submissions.filter((s) => s.problemId !== data.problemId), data],
            }
          : old,
      );
    },
  });
}

export function useFinishAttempt(attemptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<Attempt>(`attempts/${attemptId}/finish`),
    meta: { skipErrorToast: true },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidate.attempts });
      queryClient.invalidateQueries({ queryKey: queryKeys.candidate.invitations });
    },
  });
}
