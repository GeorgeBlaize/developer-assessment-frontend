import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError, getErrorMessage } from "@/lib/api/errors";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      /** Toast shown on success. */
      successMessage?: string;
      /** Set when the component renders its own error UI (e.g. inline form errors). */
      skipErrorToast?: boolean;
    };
  }
}

function shouldRetry(failureCount: number, error: unknown) {
  // Client errors (validation, 403, 404...) won't fix themselves; only retry network/5xx.
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 2;
}

export function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Initial-load failures are rendered inline by the component; only toast when a
        // background refetch fails while stale data is still on screen.
        if (query.state.data !== undefined) toast.error(getErrorMessage(error));
      },
    }),
    mutationCache: new MutationCache({
      onSuccess: (_data, _vars, _ctx, mutation) => {
        if (mutation.meta?.successMessage) toast.success(mutation.meta.successMessage);
      },
      onError: (error, _vars, _ctx, mutation) => {
        if (!mutation.meta?.skipErrorToast) toast.error(getErrorMessage(error));
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
      },
      mutations: { retry: false },
    },
  });
}
