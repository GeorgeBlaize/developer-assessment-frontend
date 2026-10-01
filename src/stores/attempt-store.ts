import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AnswerDraft {
  answerText?: string;
  selectedOptionId?: string;
  /** True while the local value differs from what the server has. */
  dirty: boolean;
}

interface AttemptDraftState {
  /** attemptId -> problemId -> draft */
  drafts: Record<string, Record<string, AnswerDraft>>;
  /** attemptId -> index of the question on screen */
  current: Record<string, number>;
  setDraft: (attemptId: string, problemId: string, draft: Omit<AnswerDraft, "dirty">) => void;
  markSaved: (attemptId: string, problemId: string) => void;
  setCurrent: (attemptId: string, index: number) => void;
  clearAttempt: (attemptId: string) => void;
}

/**
 * Exam answers as typed, persisted to localStorage per attempt. A refresh, crash or flaky
 * connection never loses work: unsaved drafts are restored and re-synced to the API.
 */
export const useAttemptDrafts = create<AttemptDraftState>()(
  persist(
    (set) => ({
      drafts: {},
      current: {},
      setDraft: (attemptId, problemId, draft) =>
        set((s) => ({
          drafts: { ...s.drafts, [attemptId]: { ...s.drafts[attemptId], [problemId]: { ...draft, dirty: true } } },
        })),
      markSaved: (attemptId, problemId) =>
        set((s) => {
          const existing = s.drafts[attemptId]?.[problemId];
          if (!existing) return s;
          return { drafts: { ...s.drafts, [attemptId]: { ...s.drafts[attemptId], [problemId]: { ...existing, dirty: false } } } };
        }),
      setCurrent: (attemptId, index) => set((s) => ({ current: { ...s.current, [attemptId]: index } })),
      clearAttempt: (attemptId) =>
        set((s) => {
          const drafts = { ...s.drafts };
          const current = { ...s.current };
          delete drafts[attemptId];
          delete current[attemptId];
          return { drafts, current };
        }),
    }),
    { name: "codeassess-attempt-drafts", storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);
