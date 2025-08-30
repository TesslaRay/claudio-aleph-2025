// fs
import { readFileSync } from "fs";

// path
import { join, dirname } from "path";

// url
import { fileURLToPath } from "url";

// Get the base directory for agent files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const agentBasePath = join(__dirname, "../../../agent");

export class PromptBuilderService {
  private static instance: PromptBuilderService;

  constructor() {}

  public static getInstance(): PromptBuilderService {
    if (!PromptBuilderService.instance) {
      PromptBuilderService.instance = new PromptBuilderService();
    }

    return PromptBuilderService.instance;
  }

  public async buildIntakeClaudioPrompt(): Promise<string> {
    let prompt = "";

    const systemPromptPath = join(agentBasePath, "system-prompts/intake.md");

    const systemPrompt = this.readFileSafely(systemPromptPath);
    if (systemPrompt) {
      prompt += systemPrompt + "\n\n";
    }

    const responsesPath = join(agentBasePath, "responses/intake.md");
    const responses = this.readFileSafely(responsesPath);
    if (responses) {
      prompt += responses + "\n\n";
    }

    return prompt;
  }

  private readFileSafely(filePath: string): string | null {
    try {
      return readFileSync(filePath, "utf-8");
    } catch (error) {
      console.warn(`[PromptBuilder] Could not read file ${filePath}:`, error);
      return null;
    }
  }
}

export const promptBuilderService = new PromptBuilderService();
