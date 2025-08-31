// prompt builder service
import { promptBuilderService } from "../prompt-builder";

// llm service
import { llmServiceManager } from "../llm/llm.service";
import { MODELS, PROVIDERS } from "../llm/lllm.constants";

export class AgentLegalContractService {
  private static instance: AgentLegalContractService;

  constructor() {}

  public static getInstance(): AgentLegalContractService {
    if (!AgentLegalContractService.instance) {
      AgentLegalContractService.instance = new AgentLegalContractService();
    }

    return AgentLegalContractService.instance;
  }

  public async generateContract(ucs: string[]): Promise<void> {
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

    console.log(llmResponse.content);
  }
}

// Export singleton instance
export const agentLegalContractService =
  AgentLegalContractService.getInstance();
