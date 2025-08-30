// types
import { ClaudioState } from "@/types/claudio.types";

// zustand
import { create } from "zustand";

export const useClaudioStore = create<ClaudioState>((set) => ({
  messages: [],
  ucs: [],

  addMessage: (message) =>
    set((state) => {
      // Don't allow adding messages if case is closed

      return {
        hasChatted: true,
        messages: [...state.messages, message],
      };
    }),

  setUcs: (facts) => set({ ucs: facts }),
}));
