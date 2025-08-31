// prompt builder service
import { promptBuilderService } from "../prompt-builder/index.js";

// llm service
import { llmServiceManager } from "../llm/llm.service.js";
import { MODELS, PROVIDERS } from "../llm/lllm.constants.js";

// claudio pdf service
import { claudioPdfService } from "../pdf/index.js";

export class AgentLegalContractService {
  private static instance: AgentLegalContractService;

  constructor() {}

  public static getInstance(): AgentLegalContractService {
    if (!AgentLegalContractService.instance) {
      AgentLegalContractService.instance = new AgentLegalContractService();
    }

    return AgentLegalContractService.instance;
  }

  public async generateContract(
    caseId: string,
    userAddress: string,
    ucs: string[]
  ): Promise<{
    success: boolean;
    contractGenerated: boolean;
  }> {
    const ucsComplete = `=== Información recopilada ===\n${ucs
      .map((uc) => `- ${uc}`)
      .join("\n")}`;

    const systemPrompt =
      await promptBuilderService.buildContractDrafterPrompt();

    const PROVIDER = PROVIDERS.GEMINI;
    const MODEL = MODELS.GEMINI_2_5_PRO;

    const llmResponse = await llmServiceManager.generateText(
      {
        prompt: ucsComplete,
        systemPrompt: systemPrompt,
        model: MODEL,
        metadata: {
          tags: {
            proccesus: "contract-drafter",
          },
        },
      },
      PROVIDER
    );

    // Generate filename with timestamp for cloud storage
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const cloudFilename = `contract-for-${caseId}-${timestamp}.pdf`;

    try {
      // Generate PDF contract using Claudio service with cover page
      const pdfResult = await claudioPdfService.generatePdfContract({
        userAddress: userAddress,
        caseId: caseId,
        language: "es",
        content: llmResponse.content,
        filename: cloudFilename,
        uploadToCloud: true,
      });

      return {
        success: true,
        contractGenerated: true,
      };
    } catch (error) {
      console.error("Error in generateContract:", error);
      return {
        success: false,
        contractGenerated: false,
      };
    }
  }

  private extractWalletAddresses(
    content: string,
    ucs: string[]
  ): {
    employer?: string;
    coworker?: string;
  } {
    const addresses: { employer?: string; coworker?: string } = {};

    // Regex pattern for Ethereum addresses
    const addressPattern = /0x[a-fA-F0-9]{40}/g;

    // Combine all text to search
    const searchText = content + "\n" + ucs.join("\n");

    // Find all addresses
    const foundAddresses = searchText.match(addressPattern) || [];

    // Look for context clues to identify roles
    const lowerText = searchText.toLowerCase();

    for (const address of foundAddresses) {
      const addressIndex = lowerText.indexOf(address.toLowerCase());

      // Get surrounding text (100 chars before and after)
      const contextStart = Math.max(0, addressIndex - 100);
      const contextEnd = Math.min(
        lowerText.length,
        addressIndex + address.length + 100
      );
      const context = lowerText.substring(contextStart, contextEnd);

      // Check for employer/company indicators
      if (
        context.includes("empleador") ||
        context.includes("empresa") ||
        context.includes("compañía") ||
        context.includes("contractor") ||
        context.includes("company")
      ) {
        addresses.employer = address;
      }
      // Check for employee/coworker indicators
      else if (
        context.includes("colaborador") ||
        context.includes("empleado") ||
        context.includes("trabajador") ||
        context.includes("coworker") ||
        context.includes("employee")
      ) {
        addresses.coworker = address;
      }
    }

    // If we couldn't determine roles but have addresses, assign them in order
    if (
      !addresses.employer &&
      !addresses.coworker &&
      foundAddresses.length >= 2
    ) {
      addresses.employer = foundAddresses[0];
      addresses.coworker = foundAddresses[1];
    }

    console.log("Extracted addresses:", addresses);
    return addresses;
  }
}

// Export singleton instance
export const agentLegalContractService =
  AgentLegalContractService.getInstance();
