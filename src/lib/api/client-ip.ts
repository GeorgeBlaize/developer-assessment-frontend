/**
 * Every API call is made server-to-server from Next.js, so the backend would otherwise see the
 * frontend's egress IP for all visitors (one shared rate-limit bucket, useless audit-log IPs).
 * When BFF_SHARED_SECRET is configured on both apps, forward the visitor's IP with the secret;
 * the API trusts `x-client-ip` only when the secret matches.
 */
export function clientIpHeaders(incoming: Headers): Record<string, string> {
  const secret = process.env.BFF_SHARED_SECRET?.trim();
  if (!secret) return {};
  const ip = incoming.get("x-real-ip")?.trim() || incoming.get("x-forwarded-for")?.split(",")[0]?.trim();
  return ip ? { "x-client-ip": ip, "x-bff-secret": secret } : {};
}
