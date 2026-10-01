"use client";

import { useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type ParamValue = string | number | null | undefined;

/**
 * Keeps list state (search, filters, sort, page) in the URL so views are bookmarkable and
 * shareable. Uses the native History API, which Next.js syncs with useSearchParams: the URL
 * updates instantly and TanStack Query fetches the new page client-side, without re-running
 * the server component (which only prefetches on a full load). Any change other than `page`
 * resets to page 1.
 */
export function useUrlState() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = useCallback((key: string) => searchParams.get(key) ?? "", [searchParams]);

  const setParams = useCallback(
    (updates: Record<string, ParamValue>, { push = false }: { push?: boolean } = {}) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "") params.delete(key);
        else params.set(key, String(value));
      }
      if (!("page" in updates)) params.delete("page");
      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (push) window.history.pushState(null, "", url);
      else window.history.replaceState(null, "", url);
    },
    [pathname, searchParams],
  );

  return { get, setParams, searchParams };
}
