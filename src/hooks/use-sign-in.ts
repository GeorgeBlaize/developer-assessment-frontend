"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { callAppRoute } from "@/lib/api/client";
import { safeNextPath } from "@/lib/auth/constants";
import { sessionQueryKey } from "@/hooks/use-session";
import type { SessionUser } from "@/types/api";

type Endpoint = "/api/auth/login" | "/api/auth/register" | "/api/auth/google";

/**
 * Shared post-authentication flow for password, demo, register and Google sign-in:
 * the route handler sets httpOnly cookies, then we reset client caches and navigate
 * to the role's dashboard (or the page the user originally asked for).
 */
export function useSignIn<TInput>(endpoint: Endpoint, options: { next?: string | null; redirectTo?: string } = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TInput) => callAppRoute<{ user: SessionUser }>(endpoint, input),
    meta: { skipErrorToast: true },
    onSuccess: ({ data: { user } }) => {
      queryClient.clear();
      queryClient.setQueryData(sessionQueryKey, { userId: user.id, email: user.email, role: user.role });
      toast.success(`Welcome, ${user.name.split(" ")[0]}!`);
      router.replace(options.redirectTo ?? safeNextPath(options.next, user.role));
      router.refresh();
    },
  });
}
