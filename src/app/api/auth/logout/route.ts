import { NextResponse, type NextRequest } from "next/server";
import { callBackend } from "@/lib/api/backend";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { REFRESH_COOKIE } from "@/lib/auth/constants";

async function revoke(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    await callBackend("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken }) });
  }
}

/** Explicit logout from the UI. */
export async function POST(request: NextRequest) {
  await revoke(request);
  const response = NextResponse.json({ success: true, message: "Logged out successfully", data: null });
  clearAuthCookies(response);
  return response;
}

/**
 * Used when the server discovers a dead session (e.g. account deactivated): clears cookies and
 * bounces to the login page. A GET so it can be the target of a server-side redirect().
 */
export async function GET(request: NextRequest) {
  await revoke(request);
  const url = new URL("/login", request.url);
  url.searchParams.set("reason", request.nextUrl.searchParams.get("reason") ?? "session");
  const next = request.nextUrl.searchParams.get("next");
  if (next) url.searchParams.set("next", next);
  const response = NextResponse.redirect(url);
  clearAuthCookies(response);
  return response;
}
