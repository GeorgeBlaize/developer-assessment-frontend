import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Next 15 streams <title>/<meta> into the body for dynamic pages; render them in <head> up front
  // for crawlers, link unfurlers and audit tools (Lighthouse) so SEO metadata is always visible.
  htmlLimitedBots: /Chrome-Lighthouse|Googlebot|bingbot|DuckDuckBot|Slurp|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp/i,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  experimental: {
    // Tree-shake large icon/chart barrels so each route only ships what it imports.
    optimizePackageImports: ["lucide-react", "recharts", "date-fns"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
