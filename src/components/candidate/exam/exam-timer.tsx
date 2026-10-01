"use client";

import { useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { useCountdown } from "@/hooks/use-countdown";
import { cn } from "@/lib/utils";

interface ExamTimerProps {
  expiresAt: string | null;
  onExpire: () => void;
  onWarning?: (minutesLeft: number) => void;
}

/** Server-anchored countdown. Fires warnings at 5 and 1 minute(s) and `onExpire` once at zero. */
export function ExamTimer({ expiresAt, onExpire, onWarning }: ExamTimerProps) {
  const { secondsLeft, label, isExpired } = useCountdown(expiresAt);
  const fired = useRef<Set<string>>(new Set());

  useEffect(() => {
    const once = (key: string, fn: () => void) => {
      if (fired.current.has(key)) return;
      fired.current.add(key);
      fn();
    };
    if (isExpired) once("expired", onExpire);
    else if (secondsLeft <= 60) once("1m", () => onWarning?.(1));
    else if (secondsLeft <= 300) once("5m", () => onWarning?.(5));
  }, [isExpired, secondsLeft, onExpire, onWarning]);

  const critical = secondsLeft <= 60;
  const low = secondsLeft <= 300;

  return (
    <div
      role="timer"
      aria-live={critical ? "assertive" : "off"}
      aria-label={`Time remaining ${label}`}
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-sm font-semibold tabular-nums ring-1 transition-colors",
        critical
          ? "animate-pulse bg-destructive/10 text-destructive ring-destructive/30"
          : low
            ? "bg-warning/15 text-amber-700 ring-warning/30 dark:text-amber-300"
            : "bg-primary/10 text-primary ring-primary/20",
      )}
    >
      <Clock className="size-4" aria-hidden />
      {label}
    </div>
  );
}
