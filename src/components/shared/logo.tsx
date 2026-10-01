import Link from "next/link";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/config";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-violet-500 font-mono text-sm font-bold text-primary-foreground shadow-sm shadow-primary/30",
        className,
      )}
    >
      {"</>"}
    </span>
  );
}

export function Logo({ href = "/", className, compact }: { href?: string; className?: string; compact?: boolean }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <LogoMark />
      <span className={cn("text-lg", compact && "sr-only")}>{APP_NAME}</span>
    </Link>
  );
}
