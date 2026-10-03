import { API_BASE_URL } from "@/lib/config";
import type { ApiResponse, AuthResult } from "@/types/api";
import type { TokenPair } from "@/lib/auth/cookies";

/**
 * Low-level call to the Express API. Used by route handlers and middleware, which need the
 * raw status + envelope to forward or act on (set cookies, etc.). Never throws.
 */
export async function callBackend<T>(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<{ status: number; body: ApiResponse<T> }> {
  const { token, headers, ...rest } = init;
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        Accept: "application/json",
        ...(typeof rest.body === "string" ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      cache: "no-store",
    });
    const body = (await res.json().catch(() => ({
      success: false,
      message: `Unexpected response from server (${res.status})`,
    }))) as ApiResponse<T>;
    return { status: res.status, body };
  } catch {
    return {
      status: 503,
      body: { success: false, message: "Cannot reach the assessment API. Please try again shortly." },
    };
  }
}

export async function refreshTokens(refreshToken: string, headers: Record<string, string> = {}): Promise<TokenPair | null> {
  const { body } = await callBackend<Omit<AuthResult, "user">>("/auth/refresh-token", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    headers,
  });
  return body.success ? body.data : null;
}
