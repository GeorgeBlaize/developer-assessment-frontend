import { cn } from "@/lib/utils";

/** Circular score indicator (pure SVG, server-renderable). */
export function ScoreRing({ score, total, passed }: { score: number; total: number; passed: boolean | null }) {
  const pct = total > 0 ? Math.min(score / total, 1) : 0;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative size-36 shrink-0" role="img" aria-label={`Score ${score} out of ${total}`}>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="10" className="stroke-muted" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          className={cn(passed === false ? "stroke-destructive" : passed ? "stroke-success" : "stroke-primary")}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-3xl font-semibold tabular-nums">{score}</p>
          <p className="text-xs text-muted-foreground">of {total}</p>
        </div>
      </div>
    </div>
  );
}
