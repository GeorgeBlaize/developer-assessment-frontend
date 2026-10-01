/**
 * Backend base URL. Only read on the server (route handlers, server components,
 * middleware) — the browser always talks to our own `/api/*` routes instead.
 */
export const API_BASE_URL = (
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://developer-assessment-backend.vercel.app/api/v1"
).replace(/\/$/, "");

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export const APP_NAME = "CodeAssess";
