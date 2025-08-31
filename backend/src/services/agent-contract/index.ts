// prompt builder service
import { promptBuilderService } from "../prompt-builder";

// llm service
import { llmServiceManager } from "../llm/llm.service";
import { MODELS, PROVIDERS } from "../llm/lllm.constants";
import { claudioPdfService } from "../pdf";

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
  ): Promise<void> {
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
    const cloudFilename = `proposal-for-${0x69}-${timestamp}.pdf`;

    // Generate PDF proposal using Tomas service with cover page
    const pdfResult = await claudioPdfService.generatePdfContract({
      userAddress: userAddress,
      caseId: caseId,
      language: "es",
      content: llmResponse.content,
      filename: cloudFilename,
      uploadToCloud: true,
    });
  }
}

// Export singleton instance
export const agentLegalContractService =
  AgentLegalContractService.getInstance();
