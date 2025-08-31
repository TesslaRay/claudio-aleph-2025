// config
import { apiConfig } from "@/config/api.config";

export class ClaudioApiService {
  private readonly apiUrl = apiConfig.apiUrl;

  constructor() {
    this.apiUrl = apiConfig.apiUrl;
  }

  async chatWithClaudio(message: string, userAddress: string, caseId?: string) {
    const body: any = {
      message,
      userAddress,
    };

    if (caseId) {
      body.caseId = caseId;
    }

    const response = await fetch(
      `${this.apiUrl}${apiConfig.endpoints.claudio.chat}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to chat with Claudio: ${response.status}, ${response.statusText}`
      );
    }

    return response.json();
  }

  async getLastActiveCaseConversation(userAddress: string) {
    const response = await fetch(
      `${this.apiUrl}${apiConfig.endpoints.conversation.lastActiveCase}?userAddress=${userAddress}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get last active case conversation: ${response.status}, ${response.statusText}`
      );
    }

    return response.json();
  }
}

export const claudioService = new ClaudioApiService();
