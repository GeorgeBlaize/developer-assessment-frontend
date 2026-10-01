import { NextResponse } from "next/server";
import type { ApiResponse, AuthResult } from "@/types/api";
import { setAuthCookies } from "./cookies";

/**
 * Turns a backend auth envelope (which carries raw tokens) into a browser response that only
 * exposes the user — the tokens are moved into httpOnly cookies.
 */
export function toSessionResponse(status: number, body: ApiResponse<AuthResult>) {
  if (!body.success) {
    return NextResponse.json(body, { status });
  }
  const { user, accessToken, refreshToken } = body.data;
  const response = NextResponse.json({ success: true, message: body.message, data: { user } }, { status });
  setAuthCookies(response, { accessToken, refreshToken });
  return response;
}

export function invalidBody(message = "Invalid request body") {
  return NextResponse.json({ success: false, message, errors: [] }, { status: 400 });
}
