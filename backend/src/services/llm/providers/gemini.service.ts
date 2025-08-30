// google ai sdk
import { GoogleGenerativeAI } from "@google/generative-ai";

// observability (langfuse)
import { langfuseService } from "../../llm-observability/langfuse.service.js";

// types
import {
  LLMService,
  LLMRequest,
  LLMResponse,
  LLMConfig,
} from "../types/llm.types.js";

export class GeminiService implements LLMService {
  private client: GoogleGenerativeAI;
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
    this.client = new GoogleGenerativeAI(config.apiKey);
  }

  async generateText(request: LLMRequest): Promise<LLMResponse> {
    const modelName =
      request.model || this.config.model || "gemini-2.0-flash-exp";

    const MAX_OUTPUT_TOKENS = 10000;

    // Get or create a trace for this LLM generation
    const traceName = request.metadata?.caseId
      ? `${request.metadata.caseId}`
      : "case-unknown";

    const traceId = crypto.randomUUID();

    const tagsObj: Record<string, string> = {};
    if (request.metadata?.caseId) {
      tagsObj.caseId = String(request.metadata.caseId);
    }

    if (request.metadata?.tags?.proccesus) {
      tagsObj.proccesus = String(request.metadata.tags.proccesus);
    }

    const tags = Object.keys(tagsObj).length > 0 ? tagsObj : undefined;

    const trace = langfuseService.getOrCreateTrace(traceName, {
      traceId,
      userId: request.metadata?.userId,
      sessionId: request.metadata?.sessionId,
      caseId: request.metadata?.caseId,
      tags: tags,
    });

    try {
      const model = this.client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: request.temperature || this.config.temperature || 0.7,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
        },
      });

      // Prepare the content with system message, prompt and images
      const parts: any[] = [];

      // Add system prompt if provided
      if (request.systemPrompt) {
        parts.push({ text: request.systemPrompt });
      }

      // Add main prompt
      parts.push({ text: request.prompt });

      // Add images if provided
      if (request.images && request.images.length > 0) {
        for (const image of request.images) {
          parts.push({
            inlineData: {
              data: image.data.toString("base64"),
              mimeType: image.mimeType,
            },
          });
        }
      }

      // Measure timing explicitly
      const start = Date.now();
      const result = await model.generateContent(parts);
      const end = Date.now();
      const duration = end - start;

      const response = await result.response;
      const text = response.text();

      const usage = {
        promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
        completionTokens:
          result.response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: result.response.usageMetadata?.totalTokenCount || 0,
      };

      const llmResponse = {
        content: text,
        usage,
        model: modelName,
        finishReason: result.response.candidates?.[0]?.finishReason || "STOP",
      };

      // Track the LLM generation with Langfuse
      await langfuseService.trackLLMGeneration(trace, {
        provider: "gemini",
        model: modelName,
        prompt: request.prompt,
        systemPrompt: request.systemPrompt,
        response: text,
        usage,
        temperature: request.temperature || this.config.temperature,
        maxTokens: MAX_OUTPUT_TOKENS,
        finishReason: llmResponse.finishReason,
        success: true,
        metadata: {
          requestId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          latencyMs: duration,
          startTime: new Date(start).toISOString(),
          endTime: new Date(end).toISOString(),
          ...request.metadata,
        },
      });

      return llmResponse;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Track the failed LLM generation with Langfuse
      await langfuseService.trackLLMGeneration(trace, {
        provider: "gemini",
        model: modelName,
        prompt: request.prompt,
        systemPrompt: request.systemPrompt,
        response: "",
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
        temperature: request.temperature || this.config.temperature,
        maxTokens: MAX_OUTPUT_TOKENS,
        success: false,
        error: errorMessage,
        metadata: {
          requestId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          ...request.metadata,
        },
      });

      console.error("Error calling Gemini API:", error);
      throw new Error(`Gemini API error: ${errorMessage}`);
    }
  }

  isAvailable(): boolean {
    return !!this.config.apiKey;
  }
}
