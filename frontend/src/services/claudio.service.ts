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

  async getContractByCaseId(caseId: string) {
    const response = await fetch(
      `${this.apiUrl}${apiConfig.endpoints.claudio.getContract}/${caseId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get contract: ${response.status}, ${response.statusText}`
      );
    }

    return response.json();
  }

  async createNewCase(userAddress: string) {
    const response = await fetch(
      `${this.apiUrl}${apiConfig.endpoints.cases.newCase}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddress,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to create new case: ${response.status}, ${response.statusText}`
      );
    }

    return response.json();
  }

  async generateContract(caseId: string) {
    const response = await fetch(
      `${this.apiUrl}${apiConfig.endpoints.claudio.generateContract}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caseId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to generate contract: ${response.status}, ${response.statusText}`
      );
    }

    return response.json();
  }
}

export const claudioService = new ClaudioApiService();
