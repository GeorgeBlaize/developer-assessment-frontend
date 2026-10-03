import type { NextRequest } from "next/server";
import { z } from "zod";
import { callBackend } from "@/lib/api/backend";
import { invalidBody, toSessionResponse } from "@/lib/auth/session-response";
import type { AuthResult } from "@/types/api";
import { clientIpHeaders } from "@/lib/api/client-ip";

const googleSchema = z.object({
  idToken: z.string().min(1),
  role: z.enum(["COMPANY", "CANDIDATE"]).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = googleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidBody("Missing Google credential");

  const { status, body } = await callBackend<AuthResult>("/auth/google", {
    method: "POST",
    body: JSON.stringify(parsed.data),
    headers: clientIpHeaders(request.headers),
  });
  return toSessionResponse(status, body);
}
