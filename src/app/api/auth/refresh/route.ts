import { NextResponse, type NextRequest } from "next/server";
import { refreshTokens } from "@/lib/api/backend";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import { REFRESH_COOKIE } from "@/lib/auth/constants";

/** Rotates the token pair. The browser client calls this once (single-flight) on SESSION_EXPIRED. */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const tokens = refreshToken ? await refreshTokens(refreshToken) : null;

  if (!tokens) {
    const response = NextResponse.json(
      { success: false, message: "Your session has ended. Please log in again.", errors: [] },
      { status: 401 },
    );
    clearAuthCookies(response);
    return response;
  }

  const response = NextResponse.json({ success: true, message: "Session refreshed", data: null });
  setAuthCookies(response, tokens);
  return response;
}
