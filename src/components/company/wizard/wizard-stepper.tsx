import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function WizardStepper({ steps, current }: { steps: readonly string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {steps.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2 last:flex-none" aria-current={active ? "step" : undefined}>
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full border-2 text-sm font-semibold transition-colors",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary text-primary",
                !done && !active && "border-border text-muted-foreground",
              )}
            >
              {done ? <Check className="size-4" aria-hidden /> : index + 1}
            </span>
            <span className={cn("hidden text-sm font-medium sm:inline", !active && !done && "text-muted-foreground")}>{label}</span>
            {index < steps.length - 1 ? (
              <span aria-hidden className={cn("h-0.5 flex-1 rounded-full", done ? "bg-primary" : "bg-border")} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
