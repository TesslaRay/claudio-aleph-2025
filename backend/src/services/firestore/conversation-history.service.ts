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

  async getUserCases(userAddress: string): Promise<Case[]> {
    const snapshot = await this.firestore
      .collection(this.casesCollectionName)
      .where("userAddress", "==", userAddress)
      .get();

    return snapshot.docs.map((doc) => doc.data() as Case);
  }

  async getCaseWithConversation(
    caseId: string
  ): Promise<Case & { conversation: ConversationEntry[] }> {
    const snapshot = await this.firestore
      .collection(this.casesCollectionName)
      .doc(caseId)
      .get();

    return snapshot.data() as Case & { conversation: ConversationEntry[] };
  }

  /**
   * Deletes all conversation history for a specific case.
   * @param caseId - The case identifier (string)
   * @returns Promise<void>
   */
  async deleteCaseConversationHistory(caseId: string): Promise<void> {
    const snapshot = await this.firestore
      .collection(this.conversationCollectionName)
      .where("caseId", "==", caseId)
      .get();

    const batch = this.firestore.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }

  async deleteCase(caseId: string): Promise<void> {
    // Delete conversation history first
    await this.deleteCaseConversationHistory(caseId);

    // Delete the case
    await this.firestore
      .collection(this.casesCollectionName)
      .doc(caseId)
      .delete();
  }

  /**
   * Checks if a case is completed.
   * @param caseId - The case identifier
   * @returns Promise<boolean> - True if the case is completed
   */
  async isCaseCompleted(caseId: string): Promise<boolean> {
    const caseDoc = await this.firestore
      .collection(this.casesCollectionName)
      .doc(caseId)
      .get();

    if (!caseDoc.exists) {
      return false;
    }

    const caseData = caseDoc.data() as Case;
    return caseData.status === "completed";
  }

  /**
   * Retrieves the conversation history for the last active case of a user.
   * @param userAddress - The user's identifier (string)
   * @returns Promise<{ caseId: string, conversation: ConversationEntry[] } | null>
   */
  async getLastActiveCaseConversation(
    userAddress: string
  ): Promise<{ caseId: string; conversation: ConversationEntry[] } | null> {
    // Get the most recent case for the user
    const casesSnapshot = await this.firestore
      .collection(this.casesCollectionName)
      .where("userAddress", "==", userAddress)
      .orderBy("lastActivityAt", "desc")
      .limit(1)
      .get();

    if (casesSnapshot.empty) {
      return null;
    }

    const caseDoc = casesSnapshot.docs[0];
    const caseId = caseDoc.id;

    // Get the conversation history for that case
    const conversation = await this.getConversationHistory(caseId);

    return { caseId, conversation };
  }
}

export const conversationHistoryService = new ConversationHistoryService();
