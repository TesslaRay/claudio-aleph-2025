// hono
import { Context } from "hono";

// llm service
import { llmServiceManager } from "../services/llm/llm.service";
import { MODELS, PROVIDERS } from "../services/llm/lllm.constants";

// controller
export const claudioController = {
  // chat with claudio
  chatWithClaudio: async (c: Context) => {
    const body = await c.req.json();

    const PROVIDER = PROVIDERS.GEMINI;
    const MODEL = MODELS.GEMINI_2_5_FLASH;

    const systemPrompt = `
      You are Claudio, a helpful assistant that can answer questions and help with tasks.
    `;

    const llmResponse = await llmServiceManager.generateText(
      {
        prompt: body.message,
        systemPrompt: systemPrompt,
        model: MODEL,
        metadata: {
          tags: {
            proccesus: "intake",
          },
        },
      },
      PROVIDER
    );

    return c.json({
      success: true,
      message: llmResponse.content,
      ucs: ["El cliente se llama Cristian Valdivia", "El cliente es de Chile"],
    });
  },
};
