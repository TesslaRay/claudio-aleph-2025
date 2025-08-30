// types
import { Message } from "@/types/claudio.types";

// zustand
import { create } from "zustand";

interface ClaudioState {
  // Chat state
  messages: Message[];

  // Actions
  addMessage: (message: Message) => void;
}

export const useClaudioStore = create<ClaudioState>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => {
      // Don't allow adding messages if case is closed

      return {
        hasChatted: true,
        messages: [...state.messages, message],
      };
    }),
}));
