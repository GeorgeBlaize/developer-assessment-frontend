import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

/**
 * All absolute dates are rendered in one fixed time zone so the server (UTC on Vercel) and the
 * browser produce identical text — no hydration mismatches — and users in Bangladesh (the
 * platform's market: BDT pricing, SSLCommerz) see their local time.
 */
export const APP_TIME_ZONE = process.env.NEXT_PUBLIC_TIME_ZONE ?? "Asia/Dhaka";

// Only numeric parts come from Intl (time-zone conversion); words are ours. Node and browsers ship
// different ICU locale data ("Sep" vs "Sept", "PM" vs "pm"), which would break hydration.
const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23",
});
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function zonedParts(date: Date) {
  const parts = Object.fromEntries(partsFormatter.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
  };
}

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = typeof value === "string" ? parseISO(value) : value;
  return isValid(date) ? date : null;
}

export function formatDate(value: string | Date | null | undefined, fallback = "—") {
  const date = toDate(value);
  if (!date) return fallback;
  const { day, month, year } = zonedParts(date);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export function formatDateTime(value: string | Date | null | undefined, fallback = "—") {
  const date = toDate(value);
  if (!date) return fallback;
  const { day, month, year, hour, minute } = zonedParts(date);
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${day} ${MONTHS[month - 1]} ${year}, ${h12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
}

/** YYYY-MM-DD in the app time zone (for grouping events by day). */
export function dayKey(value: string | Date) {
  const date = toDate(value);
  if (!date) return "";
  const { year, month, day } = zonedParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Time-dependent ("5 minutes ago"). Safe in Server Components; in Client Components use
 * <RelativeTime>, which avoids server/client clock drift during hydration.
 */
export function formatRelative(value: string | Date | null | undefined, fallback = "—") {
  const date = toDate(value);
  return date ? formatDistanceToNowStrict(date, { addSuffix: true }) : fallback;
}

export function formatMoney(amount: string | number, currency = "BDT") {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(value)) return "—";
  const symbol = currency === "BDT" ? "৳" : `${currency} `;
  return `${symbol}${formatNumber(Math.round(value))}`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function percent(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

/** Converts an ISO string to the value format expected by <input type="datetime-local">. */
export function toDateTimeLocal(value: string | null | undefined) {
  const date = toDate(value);
  return date ? format(date, "yyyy-MM-dd'T'HH:mm") : "";
}

export function humanize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
