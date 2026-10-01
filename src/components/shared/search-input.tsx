"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useUrlState } from "@/hooks/use-url-state";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  paramKey?: string;
  className?: string;
}

/** Debounced search box bound to a URL query param (default `?search=`). */
export function SearchInput({ placeholder = "Search…", paramKey = "search", className }: SearchInputProps) {
  const { get, setParams } = useUrlState();
  const urlValue = get(paramKey);
  const [value, setValue] = useState(urlValue);
  const debounced = useDebounce(value, 400);
  const lastPushed = useRef(urlValue);

  // Push debounced input to the URL.
  useEffect(() => {
    if (debounced.trim() === lastPushed.current) return;
    lastPushed.current = debounced.trim();
    setParams({ [paramKey]: debounced.trim() || null });
  }, [debounced, paramKey, setParams]);

  // Reflect external URL changes (back/forward, "clear filters").
  useEffect(() => {
    if (urlValue !== lastPushed.current) {
      lastPushed.current = urlValue;
      setValue(urlValue);
    }
  }, [urlValue]);

  return (
    <div className={cn("relative w-full sm:max-w-xs", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 pr-8 pl-8 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute top-1/2 right-2 grid size-5 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
