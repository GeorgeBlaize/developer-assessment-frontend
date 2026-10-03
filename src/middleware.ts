import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  AUTH_PAGES,
  REFRESH_COOKIE,
  ROLE_HOME,
  requiredRoleFor,
} from "@/lib/auth/constants";
import { clearAuthCookies, forwardTokensToRequest, setAuthCookies, type TokenPair } from "@/lib/auth/cookies";
import { readAccessToken } from "@/lib/auth/token";
import { refreshTokens } from "@/lib/api/backend";
import { clientIpHeaders } from "@/lib/api/client-ip";

/**
 * Route protection + role-based access, evaluated at the edge before any page renders:
 *  - protected prefixes (/admin, /company, /candidate, /attempt, /payment) need a session
 *    with the matching role; other roles are bounced to their own dashboard
 *  - /login and /register redirect signed-in users to their dashboard
 *  - an expired access token is silently rotated with the refresh token, and the new pair is
 *    forwarded to the server components rendering this same request
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const requiredRole = requiredRoleFor(pathname);
  const isAuthPage = AUTH_PAGES.includes(pathname);

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  let session = await readAccessToken(accessToken);
  let rotated: TokenPair | null = null;
  let refreshFailed = false;

  // Prefetches can fire in parallel; refreshing from each would race the backend's
  // single-use refresh-token rotation. Let them through and refresh on the real navigation.
  const isPrefetch =
    request.headers.get("next-router-prefetch") === "1" || request.headers.get("purpose") === "prefetch";

  if (!session && refreshToken) {
    if (isPrefetch) return new NextResponse(null, { status: 204 });
    rotated = await refreshTokens(refreshToken, clientIpHeaders(request.headers));
    session = rotated ? await readAccessToken(rotated.accessToken) : null;
    refreshFailed = !rotated;
  }

  const finalize = (response: NextResponse) => {
    if (rotated) setAuthCookies(response, rotated);
    else if (refreshFailed) clearAuthCookies(response);
    return response;
  };

  if (isAuthPage) {
    return finalize(
      session ? NextResponse.redirect(new URL(ROLE_HOME[session.role], request.url)) : NextResponse.next(),
    );
  }

  if (requiredRole) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      if (refreshFailed || accessToken) loginUrl.searchParams.set("reason", "session");
      return finalize(NextResponse.redirect(loginUrl));
    }
    if (session.role !== requiredRole) {
      const home = new URL(ROLE_HOME[session.role], request.url);
      home.searchParams.set("denied", pathname);
      return finalize(NextResponse.redirect(home));
    }
  }

  if (rotated) forwardTokensToRequest(request, rotated);
  return finalize(NextResponse.next({ request: { headers: request.headers } }));
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/company/:path*",
    "/candidate/:path*",
    "/attempt/:path*",
    "/payment/:path*",
    "/login",
    "/register",
  ],
};
