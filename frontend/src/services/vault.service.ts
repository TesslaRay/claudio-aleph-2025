// types
import { VaultResponse } from "@/types/vault.types";

// config
import { apiConfig } from "@/config/api.config";

/**
 * Service for handling vault-related API calls
 */
export class VaultService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = apiConfig.apiUrl;
  }

  /**
   * Fetches vault files for a specific user address
   * @param userAddress - The user's address
   * @returns Promise<VaultResponse> - The vault data
   */
  async getUserVaultFiles(userAddress: string): Promise<VaultResponse> {
    const response = await fetch(
      `${this.baseUrl}${apiConfig.endpoints.vault.getUserVaultFiles}?userAddress=${userAddress}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const vaultService = new VaultService();
