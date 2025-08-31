interface Message {
  role: "user" | "agent";
  content: string;
  isHistorical?: boolean;
}

interface ClaudioState {
  // Chat state
  messages: Message[];
  ucs: string[];
  caseId: string | null;
  score: number;

  // Actions
  addMessage: (message: Message) => void;
  setUcs: (facts: string[]) => void;
  setMessages: (messages: Message[]) => void;
  clearMessages: () => void;
  setCaseId: (caseId: string | null) => void;
  setScore: (score: number) => void;
}

export type { ClaudioState, Message };
