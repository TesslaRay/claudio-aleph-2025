// config
import { apiConfig } from "@/config/api.config";

export class ClaudioApiService {
  private readonly apiUrl = apiConfig.apiUrl;

  constructor() {
    this.apiUrl = apiConfig.apiUrl;
  }

  async chatWithClaudio(message: string) {
    const response = await fetch(
      `${this.apiUrl}${apiConfig.endpoints.claudio.chat}`,
      {
        method: "POST",
        body: JSON.stringify({ message }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to chat with Claudio: ${response.status}, ${response.statusText}`
      );
    }

    return response.json();
  }
}

export const claudioService = new ClaudioApiService();
