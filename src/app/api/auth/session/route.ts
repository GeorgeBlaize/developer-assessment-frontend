import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE } from "@/lib/auth/constants";
import { readAccessToken } from "@/lib/auth/token";

/**
 * Lightweight "who am I" for statically rendered public pages (navbar CTA). Reads only the
 * signed cookie — no backend round trip — so marketing pages stay fast and cacheable.
 */
export async function GET(request: NextRequest) {
  const payload = await readAccessToken(request.cookies.get(ACCESS_COOKIE)?.value);
  return NextResponse.json(
    {
      success: true,
      message: "Session status",
      data: payload ? { userId: payload.userId, email: payload.email, role: payload.role } : null,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
