import { decodeJwt, jwtVerify, type JWTPayload } from "jose";
import type { Role } from "@/types/api";

export interface AccessTokenPayload {
  userId: string;
  role: Role;
  email: string;
  exp: number;
}

const ROLES: readonly Role[] = ["ADMIN", "COMPANY", "CANDIDATE"];

/** Treat tokens that expire within this window as already expired to avoid races. */
const EXPIRY_LEEWAY_SECONDS = 15;

function isAccessPayload(payload: JWTPayload): payload is JWTPayload & AccessTokenPayload {
  return (
    typeof payload.userId === "string" &&
    typeof payload.email === "string" &&
    typeof payload.exp === "number" &&
    ROLES.includes(payload.role as Role)
  );
}

/**
 * Reads the backend access token. When JWT_ACCESS_SECRET is configured the signature
 * is verified (HS256, same secret as the API); otherwise the claims are only decoded for
 * routing decisions — the API still verifies the signature on every request.
 * Returns null for missing, malformed, forged or (nearly) expired tokens.
 */
export async function readAccessToken(token: string | undefined): Promise<AccessTokenPayload | null> {
  if (!token) return null;
  try {
    const secret = process.env.JWT_ACCESS_SECRET;
    const payload = secret
      ? (await jwtVerify(token, new TextEncoder().encode(secret))).payload
      : decodeJwt(token);

    if (!isAccessPayload(payload)) return null;
    if (payload.exp - EXPIRY_LEEWAY_SECONDS <= Math.floor(Date.now() / 1000)) return null;

    return { userId: payload.userId, role: payload.role, email: payload.email, exp: payload.exp };
  } catch {
    return null;
  }
}

/** Seconds until the token expires (used as the cookie max-age). */
export function secondsUntilExpiry(token: string): number {
  try {
    const { exp } = decodeJwt(token);
    return exp ? Math.max(exp - Math.floor(Date.now() / 1000), 0) : 0;
  } catch {
    return 0;
  }
}
