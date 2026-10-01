"use client";

import { useEffect, useState } from "react";
import { formatDateTime, formatRelative } from "@/lib/format";

/**
 * "5 minutes ago" that is hydration-safe: the server and first client render show the absolute
 * timestamp (identical everywhere), then it switches to relative text after mount and keeps
 * ticking every 30 seconds.
 */
export function RelativeTime({ value, fallback = "—", className }: { value: string | null | undefined; fallback?: string; className?: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!value) return <span className={className}>{fallback}</span>;

  return (
    <time dateTime={value} title={formatDateTime(value)} className={className}>
      {now === null ? formatDateTime(value) : formatRelative(value)}
    </time>
  );
}
