import { Clock, Code2 } from "lucide-react";

/**
 * Product illustration for the hero: a faithful, static rendering of the candidate exam
 * workspace (same layout and question types the real /attempt page uses).
 */
export function ExamPreview() {
  return (
    <div aria-hidden className="relative rounded-2xl border bg-card/90 p-2 shadow-2xl shadow-primary/10 backdrop-blur">
      <div className="flex items-center justify-between rounded-t-xl border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
          <span className="ml-3 text-xs font-medium text-muted-foreground">Backend Engineer Screening</span>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
          <Clock className="size-3" /> 24:51
        </span>
      </div>
      <div className="grid gap-3 p-3 sm:grid-cols-[150px_1fr]">
        <div className="hidden space-y-1.5 sm:block">
          {["Block-scoped vars", "Reverse a string", "Database indexing"].map((t, i) => (
            <div
              key={t}
              className={`rounded-lg px-2.5 py-2 text-xs ${i === 1 ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground"}`}
            >
              <span className="mr-1.5 font-mono">{i + 1}.</span>
              {t}
            </div>
          ))}
        </div>
        <div className="space-y-3 rounded-xl border bg-background p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Code2 className="size-3.5" /> Coding · 20 marks
          </div>
          <p className="text-sm font-medium">Write a function that reverses a string</p>
          <pre className="overflow-hidden rounded-lg bg-zinc-950 p-3 font-mono text-[11px] leading-relaxed text-zinc-300">
            <span className="text-violet-400">function</span> <span className="text-sky-300">reverseString</span>(str) {"{"}
            {"\n"}  <span className="text-violet-400">return</span> str.<span className="text-sky-300">split</span>(
            <span className="text-emerald-300">&quot;&quot;</span>).<span className="text-sky-300">reverse</span>().
            <span className="text-sky-300">join</span>(<span className="text-emerald-300">&quot;&quot;</span>);
            {"\n"}
            {"}"}
          </pre>
          <div className="flex justify-end gap-2">
            <span className="rounded-md border px-2.5 py-1 text-xs">Previous</span>
            <span className="rounded-md bg-primary px-2.5 py-1 text-xs text-primary-foreground">Save & next</span>
          </div>
        </div>
      </div>
    </div>
  );
}
