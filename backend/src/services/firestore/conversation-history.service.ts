// firestore
import { Firestore } from "@google-cloud/firestore";

// types
import { Case, ConversationEntry } from "./types/claudio.types";

export class ConversationHistoryService {
  private firestore: Firestore;
  private conversationCollectionName: string;
  private casesCollectionName: string;

  constructor() {
    this.firestore = new Firestore();
    this.conversationCollectionName = "claudio-conversation-history";
    this.casesCollectionName = "claudio-cases";
  }

  async createCase(caseId: string, userAddress: string, title: string) {
    const now = Date.now();
    const caseData: Omit<Case, "caseId"> = {
      userAddress,
      title,
      agent: "claudio",
      status: "active",
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
    };

    await this.firestore
      .collection(this.casesCollectionName)
      .doc(caseId)
      .set(caseData);
  }

  async getConversationHistory(caseId: string): Promise<ConversationEntry[]> {
    const snapshot = await this.firestore
      .collection(this.conversationCollectionName)
      .where("caseId", "==", caseId)
      .orderBy("timestamp", "asc")
      .get();

    return snapshot.docs.map((doc) => doc.data() as ConversationEntry);
  }

  async addConversation(
    caseId: string,
    userAddress: string,
    userMessage: string,
    agentMessage: string,
    ucs: string[],
    score: number
  ) {
    const entry: ConversationEntry = {
      caseId,
      userAddress,
      userMessage,
      agentMessage,
      ucs,
      score,
      timestamp: Date.now(),
    };

    await this.firestore.collection(this.conversationCollectionName).add(entry);
  }
}

export const conversationHistoryService = new ConversationHistoryService();
