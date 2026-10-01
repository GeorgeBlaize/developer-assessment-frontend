import type { ApiResponse, ApiSuccess } from "@/types/api";
import { ApiError } from "./errors";

type QueryValue = string | number | boolean | undefined | null;

interface RequestOptions {
  query?: Record<string, QueryValue>;
  body?: unknown;
  signal?: AbortSignal;
}

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Single-flight session refresh: when several queries hit SESSION_EXPIRED at once, only one
 * refresh request is made (the backend rotates refresh tokens, so parallel refreshes would
 * invalidate each other).
 */
function refreshSession(): Promise<boolean> {
  refreshInFlight ??= fetch("/api/auth/refresh", { method: "POST" })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      setTimeout(() => {
        refreshInFlight = null;
      }, 1000);
    });
  return refreshInFlight;
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(`/api/proxy/${path.replace(/^\//, "")}`, window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<ApiSuccess<T>> {
  const send = () =>
    fetch(buildUrl(path, options.query), {
      method,
      signal: options.signal,
      headers: options.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

  let res = await send();
  let body = (await res.json().catch(() => null)) as (ApiResponse<T> & { code?: string }) | null;

  if (res.status === 401 && body?.code === "SESSION_EXPIRED") {
    if (await refreshSession()) {
      res = await send();
      body = (await res.json().catch(() => null)) as (ApiResponse<T> & { code?: string }) | null;
    } else {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.assign(`/login?reason=session&next=${next}`);
      throw new ApiError("Your session has expired. Please log in again.", 401, [], "SESSION_EXPIRED");
    }
  }

  if (!body) throw new ApiError(`Unexpected response from server (${res.status})`, res.status);
  if (!body.success) throw new ApiError(body.message, res.status, body.errors ?? [], body.code);
  return body;
}

/** Browser API client used by TanStack Query hooks. All calls go through /api/proxy. */
export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "body">) => request<T>("GET", path, options),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, { body }),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

/** Calls our own Next route handlers (auth BFF), which use the same envelope. */
export async function callAppRoute<T>(path: string, body?: unknown): Promise<ApiSuccess<T>> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;
  if (!json) throw new ApiError(`Unexpected response from server (${res.status})`, res.status);
  if (!json.success) throw new ApiError(json.message, res.status, json.errors ?? []);
  return json;
}
