"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { queryKeys, type ListParams } from "@/lib/api/query-keys";
import type { ApiSuccess, AuditLog, Plan, PlatformStats, UserListItem } from "@/types/api";
import type { PlanInput } from "@/lib/validations/plan";

export function usePlatformStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: () => api.get<PlatformStats>("admin/stats").then((r) => r.data),
  });
}

export function useAdminUsers(params: ListParams) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: ({ signal }) => api.get<UserListItem[]>("users", { query: params, signal }),
    placeholderData: keepPreviousData,
  });
}

export function useAuditLogs(params: ListParams) {
  return useQuery({
    queryKey: queryKeys.admin.auditLogs(params),
    queryFn: ({ signal }) => api.get<AuditLog[]>("admin/audit-logs", { query: params, signal }),
    placeholderData: keepPreviousData,
  });
}

/**
 * Activate/deactivate with an optimistic update: the switch flips instantly in every cached
 * user list and rolls back if the API rejects it.
 */
export function useSetUserStatus() {
  const queryClient = useQueryClient();
  type Lists = [readonly unknown[], ApiSuccess<UserListItem[]> | undefined][];

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch<UserListItem>(`users/${id}/status`, { isActive }),
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "users"] });
      const previous: Lists = queryClient.getQueriesData<ApiSuccess<UserListItem[]>>({ queryKey: ["admin", "users"] });
      queryClient.setQueriesData<ApiSuccess<UserListItem[]>>({ queryKey: ["admin", "users"] }, (old) =>
        old ? { ...old, data: old.data.map((u) => (u.id === id ? { ...u, isActive } : u)) } : old,
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSuccess: (_res, { isActive }) => {
      // Shown here (not via meta) because the message depends on the variables.
      toast.success(isActive ? "Account activated" : "Account deactivated");
    },
    onSettled: (_res, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.user(id) });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<null>(`users/${id}`),
    meta: { successMessage: "User removed" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}

export function useSavePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id?: string; values: PlanInput }) =>
      id
        ? api.patch<Plan>(`plans/${id}`, {
            price: values.price,
            durationDays: values.durationDays,
            maxActiveAssessments: values.maxActiveAssessments,
            maxInvitesPerAssessment: values.maxInvitesPerAssessment,
            features: values.features,
            isActive: values.isActive,
          })
        : api.post<Plan>("plans", {
            name: values.name,
            price: values.price,
            durationDays: values.durationDays,
            maxActiveAssessments: values.maxActiveAssessments,
            maxInvitesPerAssessment: values.maxInvitesPerAssessment,
            features: values.features,
          }),
    meta: { successMessage: "Plan saved" },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.plans }),
  });
}

export function useSweepExpiredAttempts() {
  return useMutation({
    mutationFn: () => api.post<{ expiredCount: number }>("admin/attempts/sweep-expired"),
    onSuccess: ({ data }) => {
      toast.success(
        data.expiredCount
          ? `Finalised ${data.expiredCount} expired attempt${data.expiredCount === 1 ? "" : "s"}`
          : "No overdue attempts. Everything is up to date.",
      );
    },
  });
}
