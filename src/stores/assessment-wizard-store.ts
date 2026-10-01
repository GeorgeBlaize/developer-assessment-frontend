import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AssessmentDetailsInput, ProblemInput } from "@/lib/validations/assessment";

export const WIZARD_STEPS = ["Details", "Questions", "Review"] as const;

interface WizardState {
  step: number;
  details: AssessmentDetailsInput | null;
  problems: ProblemInput[];
  setStep: (step: number) => void;
  saveDetails: (details: AssessmentDetailsInput) => void;
  addProblem: (problem: ProblemInput) => void;
  updateProblem: (index: number, problem: ProblemInput) => void;
  removeProblem: (index: number) => void;
  moveProblem: (from: number, to: number) => void;
  reset: () => void;
}

const initial = { step: 0, details: null, problems: [] };

/**
 * Multi-step "create assessment" draft. Persisted to localStorage so a refresh or accidental
 * navigation never loses a half-built assessment; cleared once it's created on the server.
 */
export const useAssessmentWizard = create<WizardState>()(
  persist(
    (set) => ({
      ...initial,
      setStep: (step) => set({ step }),
      saveDetails: (details) => set({ details }),
      addProblem: (problem) => set((s) => ({ problems: [...s.problems, problem] })),
      updateProblem: (index, problem) => set((s) => ({ problems: s.problems.map((p, i) => (i === index ? problem : p)) })),
      removeProblem: (index) => set((s) => ({ problems: s.problems.filter((_, i) => i !== index) })),
      moveProblem: (from, to) =>
        set((s) => {
          if (to < 0 || to >= s.problems.length) return s;
          const problems = [...s.problems];
          const [moved] = problems.splice(from, 1);
          problems.splice(to, 0, moved);
          return { problems };
        }),
      reset: () => set(initial),
    }),
    {
      name: "codeassess-assessment-draft",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Rehydrated manually after mount to avoid SSR/client hydration mismatches.
      skipHydration: true,
    },
  ),
);
