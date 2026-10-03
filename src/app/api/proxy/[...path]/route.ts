import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/config";
import { ACCESS_COOKIE } from "@/lib/auth/constants";
import { readAccessToken } from "@/lib/auth/token";
import { clientIpHeaders } from "@/lib/api/client-ip";

/**
 * Backend-for-frontend proxy: the browser calls /api/proxy/<backend path>, we attach the
 * Bearer token from the httpOnly cookie and stream the backend's response back.
 *
 * If the access token is missing/expired we answer 401 + code SESSION_EXPIRED *without*
 * calling the API, so the client can tell "refresh and retry" apart from business 401s
 * such as "Old password is incorrect".
 */
type Context = { params: Promise<{ path: string[] }> };

// These return or consume raw tokens — only our /api/auth/* handlers may call them.
const BLOCKED_PATHS = new Set(["auth/login", "auth/register", "auth/google", "auth/refresh-token", "auth/logout"]);

async function forward(request: NextRequest, { params }: Context) {
  const { path } = await params;
  if (BLOCKED_PATHS.has(path.join("/"))) {
    return NextResponse.json({ success: false, message: "Not found", errors: [] }, { status: 404 });
  }

  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!(await readAccessToken(token))) {
    return NextResponse.json(
      { success: false, message: "Your session has expired.", errors: [], code: "SESSION_EXPIRED" },
      { status: 401 },
    );
  }

  const target = `${API_BASE_URL}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const hasBody = !["GET", "HEAD"].includes(request.method);

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...clientIpHeaders(request.headers),
        ...(hasBody ? { "Content-Type": request.headers.get("content-type") ?? "application/json" } : {}),
      },
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
    });

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Cannot reach the assessment API. Please try again shortly.", errors: [] },
      { status: 503 },
    );
  }
}

export { forward as GET, forward as POST, forward as PATCH, forward as PUT, forward as DELETE };
