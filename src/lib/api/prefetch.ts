import "server-only";
import { QueryClient, dehydrate, type QueryKey } from "@tanstack/react-query";

/**
 * Prefetches queries on the server and returns dehydrated state for <HydrationBoundary>.
 * The client component then reads the same keys from cache — no loading flash, no duplicate
 * request — and takes over refetching/pagination from there.
 */
export async function prefetch(queries: Array<{ queryKey: QueryKey; queryFn: () => Promise<unknown> }>) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });
  await Promise.all(queries.map((q) => queryClient.prefetchQuery(q)));
  return dehydrate(queryClient);
}
