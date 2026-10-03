import type { NextRequest } from "next/server";
import { callBackend } from "@/lib/api/backend";
import { invalidBody, toSessionResponse } from "@/lib/auth/session-response";
import { loginSchema } from "@/lib/validations/auth";
import type { AuthResult } from "@/types/api";
import { clientIpHeaders } from "@/lib/api/client-ip";

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidBody(parsed.error.issues[0]?.message);

  const { status, body } = await callBackend<AuthResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify(parsed.data),
    headers: clientIpHeaders(request.headers),
  });
  return toSessionResponse(status, body);
}
