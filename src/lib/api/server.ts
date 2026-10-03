import "server-only";
import { cookies, headers as requestHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { API_BASE_URL } from "@/lib/config";
import { ACCESS_COOKIE } from "@/lib/auth/constants";
import { readAccessToken, type AccessTokenPayload } from "@/lib/auth/token";
import type { ApiResponse, ApiSuccess, Me } from "@/types/api";
import { ApiError } from "./errors";
import { clientIpHeaders } from "./client-ip";

type QueryValue = string | number | boolean | undefined | null;

interface ServerFetchOptions {
  query?: Record<string, QueryValue>;
  /** Public, cacheable data (e.g. plans). Skips the auth cookie so the result can be shared. */
  public?: boolean;
  revalidate?: number | false;
  tags?: string[];
}

export function toQueryString(query?: Record<string, QueryValue>) {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Data fetching for Server Components. Authenticated reads are `no-store` (per-user data);
 * public reads use Next's data cache with ISR-style revalidation and tags.
 * A 401 means the session died server-side (deactivated/deleted) -> clear cookies & go to login.
 */
export async function serverFetch<T>(path: string, options: ServerFetchOptions = {}): Promise<ApiSuccess<T>> {
  const headers: Record<string, string> = { Accept: "application/json" };

  if (!options.public) {
    const token = (await cookies()).get(ACCESS_COOKIE)?.value;
    if (token) headers.Authorization = `Bearer ${token}`;
    Object.assign(headers, clientIpHeaders(await requestHeaders()));
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}${toQueryString(options.query)}`, {
      headers,
      ...(options.public
        ? { next: { revalidate: options.revalidate ?? 300, tags: options.tags } }
        : { cache: "no-store" as const }),
    });
  } catch {
    throw new ApiError("Cannot reach the assessment API. Please try again shortly.", 503);
  }

  const body = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (res.status === 401 && !options.public) {
    redirect("/api/auth/logout?reason=session");
  }
  if (!body || !body.success) {
    throw new ApiError(body?.message ?? `Request failed (${res.status})`, res.status, body?.success === false ? body.errors : []);
  }
  return body;
}

/** Session claims from the cookie (cheap, no network). Deduped per request. */
export const getSession = cache(async (): Promise<AccessTokenPayload | null> => {
  return readAccessToken((await cookies()).get(ACCESS_COOKIE)?.value);
});

/** Full profile of the signed-in user. Deduped per request so layouts and pages can share it. */
export const getMe = cache(async (): Promise<Me> => {
  const { data } = await serverFetch<Me>("/users/me");
  return data;
});
