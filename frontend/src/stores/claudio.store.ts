// types
import { ClaudioState } from "@/types/claudio.types";

// zustand
import { create } from "zustand";

export const useClaudioStore = create<ClaudioState>((set) => ({
  messages: [],
  ucs: [],
  score: 0,
  caseId: null,

  addMessage: (message) =>
    set((state) => {
      // Don't allow adding messages if case is closed

      return {
        hasChatted: true,
        messages: [...state.messages, message],
      };
    }),

  setUcs: (facts) => set({ ucs: facts }),

  setMessages: (messages) => set({ messages }),

  clearMessages: () => set({ messages: [], ucs: [], caseId: null }),

  setCaseId: (caseId) => set({ caseId }),

  setScore: (score: number) => set({ score }),
}));
