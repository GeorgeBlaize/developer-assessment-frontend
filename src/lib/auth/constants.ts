import type { Role } from "@/types/api";

export const ACCESS_COOKIE = "ca_access";
export const REFRESH_COOKIE = "ca_refresh";

/** Refresh-token lifetime on the backend (JWT_REFRESH_EXPIRES_IN=30d). */
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/admin",
  COMPANY: "/company",
  CANDIDATE: "/candidate",
};

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin",
  COMPANY: "Company",
  CANDIDATE: "Candidate",
};

/** Route prefix -> the only role allowed inside it. */
export const PROTECTED_PREFIXES: ReadonlyArray<{ prefix: string; role: Role }> = [
  { prefix: "/admin", role: "ADMIN" },
  { prefix: "/company", role: "COMPANY" },
  { prefix: "/payment", role: "COMPANY" },
  { prefix: "/candidate", role: "CANDIDATE" },
  { prefix: "/attempt", role: "CANDIDATE" },
];

export const AUTH_PAGES = ["/login", "/register"];

export function requiredRoleFor(pathname: string): Role | null {
  const match = PROTECTED_PREFIXES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return match?.role ?? null;
}

/** Only allow same-origin relative redirects after login (prevents open redirects). */
export function safeNextPath(next: string | null | undefined, role: Role): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return ROLE_HOME[role];
  const required = requiredRoleFor(next.split("?")[0]);
  return required === null || required === role ? next : ROLE_HOME[role];
}
