interface Message {
  role: "user" | "agent";
  content: string;
}

interface ClaudioState {
  // Chat state
  messages: Message[];
  ucs: string[];

  // Actions
  addMessage: (message: Message) => void;
  setUcs: (facts: string[]) => void;
}

export type { ClaudioState, Message };
