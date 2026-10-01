"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUrlState } from "@/hooks/use-url-state";
import { cn } from "@/lib/utils";

const ALL = "__all__";

interface FilterSelectProps {
  paramKey: string;
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  allLabel?: string;
  /** Value used when the param is absent (e.g. a default sort). */
  defaultValue?: string;
  className?: string;
}

/** Dropdown filter bound to a URL query param. "All" removes the param. */
export function FilterSelect({ paramKey, label, options, allLabel, defaultValue, className }: FilterSelectProps) {
  const { get, setParams } = useUrlState();
  const current = get(paramKey) || defaultValue || ALL;

  return (
    <Select
      value={current}
      onValueChange={(value) => setParams({ [paramKey]: value === ALL || value === defaultValue ? null : value })}
    >
      <SelectTrigger aria-label={label} className={cn("h-9 w-full data-[size=default]:h-9 sm:w-44", className)}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {allLabel ? <SelectItem value={ALL}>{allLabel}</SelectItem> : null}
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
