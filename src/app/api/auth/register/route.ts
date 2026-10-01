import type { NextRequest } from "next/server";
import { callBackend } from "@/lib/api/backend";
import { invalidBody, toSessionResponse } from "@/lib/auth/session-response";
import { registerSchema } from "@/lib/validations/auth";
import type { AuthResult } from "@/types/api";

export async function POST(request: NextRequest) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidBody(parsed.error.issues[0]?.message);

  const { name, email, password, role, companyName, phone } = parsed.data;
  const { status, body } = await callBackend<AuthResult>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      role,
      ...(role === "COMPANY" ? { companyName } : {}),
      ...(role === "CANDIDATE" && phone ? { phone } : {}),
    }),
  });
  return toSessionResponse(status, body);
}
