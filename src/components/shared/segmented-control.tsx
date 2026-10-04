"use client";

import { cn } from "@/lib/utils";

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<{ value: T; label: string; count?: number }>;
  className?: string;
}

/**
 * A filter switcher styled like tabs. Unlike ARIA tabs it doesn't claim to control tab panels
 * (the list below it simply re-filters), so it's a group of toggle buttons with aria-pressed.
 */
export function SegmentedControl<T extends string>({ label, value, onChange, options, className }: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={label} className={cn("inline-flex w-full rounded-lg bg-muted p-[3px] sm:w-auto", className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:flex-none",
              active ? "bg-background text-foreground shadow-sm dark:bg-input/40" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
            {opt.count !== undefined ? <span className="text-xs text-muted-foreground tabular-nums">{opt.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
