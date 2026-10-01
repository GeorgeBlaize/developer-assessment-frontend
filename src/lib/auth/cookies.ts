import type { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, REFRESH_MAX_AGE } from "./constants";
import { secondsUntilExpiry } from "./token";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function setAuthCookies(response: NextResponse, tokens: TokenPair) {
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    ...baseCookie,
    maxAge: secondsUntilExpiry(tokens.accessToken),
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, { ...baseCookie, maxAge: REFRESH_MAX_AGE });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", { ...baseCookie, maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { ...baseCookie, maxAge: 0 });
}

/** Makes freshly rotated tokens visible to server components rendered in this same request. */
export function forwardTokensToRequest(request: NextRequest, tokens: TokenPair) {
  request.cookies.set(ACCESS_COOKIE, tokens.accessToken);
  request.cookies.set(REFRESH_COOKIE, tokens.refreshToken);
}
