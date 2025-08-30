// observability (langfuse)
import { langfuseService } from "../../llm-observability/langfuse.service.js";

// types
import {
  LLMService,
  LLMRequest,
  LLMResponse,
  LLMConfig,
} from "../types/llm.types.js";

export class CerebrasService implements LLMService {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async generateText(request: LLMRequest): Promise<LLMResponse> {
    const modelName =
      request.model ||
      this.config.model ||
      "cerebras/cerebras-llama-3.1-70b-instruct";

    const MAX_OUTPUT_TOKENS =
      request.maxTokens || this.config.maxTokens || 10000;

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
      // Prepare messages array for OpenRouter format
      const messages: Array<{ role: string; content: string }> = [];

      if (request.systemPrompt) {
        messages.push({
          role: "system",
          content: request.systemPrompt,
        });
      }

      messages.push({
        role: "user",
        content: request.prompt,
      });

      // Measure timing explicitly
      const start = Date.now();

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            "HTTP-Referer": "https://iustomas.ai",
            "X-Title": "Tomas",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelName,
            provider: {
              only: ["Cerebras"],
            },
            messages: messages,
            temperature: request.temperature || this.config.temperature || 0.7,
            max_tokens: MAX_OUTPUT_TOKENS,
            usage: {
              include: true,
            },
          }),
        }
      );

      const end = Date.now();
      const duration = end - start;

      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`;

        // Track the failed LLM generation with Langfuse
        await langfuseService.trackLLMGeneration(trace, {
          provider: "cerebras",
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
            latencyMs: duration,
            startTime: new Date(start).toISOString(),
            endTime: new Date(end).toISOString(),
            ...request.metadata,
          },
        });

        throw new Error(errorMessage);
      }

      const completion = await response.json() as {
        choices: Array<{
          message?: { content?: string };
          finish_reason?: string;
        }>;
        usage?: {
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
        };
      };

      const text = completion.choices[0]?.message?.content || "";
      const finishReason = completion.choices[0]?.finish_reason || "stop";

      const usage = {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      };

      const llmResponse = {
        content: text,
        usage,
        model: modelName,
        finishReason,
      };

      // Track the LLM generation with Langfuse
      await langfuseService.trackLLMGeneration(trace, {
        provider: "cerebras",
        model: modelName,
        prompt: request.prompt,
        systemPrompt: request.systemPrompt,
        response: text,
        usage,
        temperature: request.temperature || this.config.temperature,
        maxTokens: MAX_OUTPUT_TOKENS,
        finishReason: finishReason,
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
      // If error tracking was already done above (for HTTP errors), just re-throw
      if (
        error instanceof Error &&
        error.message.includes("OpenRouter API error")
      ) {
        throw error;
      }

      // For other errors, track and throw
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Track the failed LLM generation with Langfuse
      await langfuseService.trackLLMGeneration(trace, {
        provider: "cerebras",
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

      throw new Error(`Cerebras API error: ${errorMessage}`);
    }
  }

  async *generateTextStream(
    request: LLMRequest
  ): AsyncGenerator<string, void, unknown> {
    const modelName =
      request.model ||
      this.config.model ||
      "cerebras/cerebras-llama-3.1-70b-instruct";

    const MAX_OUTPUT_TOKENS =
      request.maxTokens || this.config.maxTokens || 10000;

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

    let fullResponse = "";
    const start = Date.now();

    try {
      // Prepare messages array for OpenRouter format
      const messages: Array<{ role: string; content: string }> = [];

      if (request.systemPrompt) {
        messages.push({
          role: "system",
          content: request.systemPrompt,
        });
      }

      messages.push({
        role: "user",
        content: request.prompt,
      });

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            "HTTP-Referer": "https://iustomas.ai",
            "X-Title": "Tomas",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelName,
            provider: {
              only: ["Cerebras"],
            },
            messages: messages,
            temperature: request.temperature || this.config.temperature || 0.7,
            max_tokens: MAX_OUTPUT_TOKENS,
            stream: true, // Enable streaming
            usage: {
              include: true,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`;

        // Track the failed LLM generation with Langfuse
        await langfuseService.trackLLMGeneration(trace, {
          provider: "cerebras",
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
            latencyMs: Date.now() - start,
            startTime: new Date(start).toISOString(),
            endTime: new Date().toISOString(),
            ...request.metadata,
          },
        });

        throw new Error(errorMessage);
      }

      // Parse SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let usage = {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      };

      if (!reader) {
        throw new Error("No response body reader available");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6);
            if (jsonStr === "[DONE]") {
              continue;
            }

            try {
              const data = JSON.parse(jsonStr);
              const content = data.choices?.[0]?.delta?.content;

              if (content) {
                fullResponse += content;
                yield content;
              }

              // Update usage if provided
              if (data.usage) {
                usage = {
                  promptTokens: data.usage.prompt_tokens || 0,
                  completionTokens: data.usage.completion_tokens || 0,
                  totalTokens: data.usage.total_tokens || 0,
                };
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
              continue;
            }
          }
        }
      }

      const end = Date.now();
      const duration = end - start;

      // Track the successful LLM generation with Langfuse
      await langfuseService.trackLLMGeneration(trace, {
        provider: "cerebras",
        model: modelName,
        prompt: request.prompt,
        systemPrompt: request.systemPrompt,
        response: fullResponse,
        usage,
        temperature: request.temperature || this.config.temperature,
        maxTokens: MAX_OUTPUT_TOKENS,
        finishReason: "stop",
        success: true,
        metadata: {
          requestId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          latencyMs: duration,
          startTime: new Date(start).toISOString(),
          endTime: new Date(end).toISOString(),
          streaming: true,
          ...request.metadata,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (
        !(
          error instanceof Error &&
          error.message?.includes("OpenRouter API error")
        )
      ) {
        // Track the failed LLM generation with Langfuse
        await langfuseService.trackLLMGeneration(trace, {
          provider: "cerebras",
          model: modelName,
          prompt: request.prompt,
          systemPrompt: request.systemPrompt,
          response: fullResponse,
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
            latencyMs: Date.now() - start,
            streaming: true,
            ...request.metadata,
          },
        });
      }

      throw new Error(`Cerebras API error: ${errorMessage}`);
    }
  }

  isAvailable(): boolean {
    return !!this.config.apiKey;
  }
}
