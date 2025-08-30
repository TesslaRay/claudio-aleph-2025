export interface Case {
  caseId: string;
  userAddress: string;
  title: string;
  agent: "claudio";
  status: "active" | "completed" | "archived";
  createdAt: number;
  updatedAt: number;
  lastActivityAt: number;
  completedAt?: number;
}

export interface ConversationEntry {
  caseId: string;
  userAddress: string;
  userMessage: string;
  agentMessage: string;
  ucs: string[];
  score: number;
  timestamp: number;
}
