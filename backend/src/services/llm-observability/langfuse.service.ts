import { Langfuse } from "langfuse";

// Types for observability
export interface LLMObservabilityData {
  provider: string;
  model: string;
  prompt: string;
  systemPrompt?: string;
  response: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  temperature?: number;
  maxTokens?: number;
  finishReason?: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface TraceContext {
  traceId?: string;
  spanId?: string;
  userId?: string;
  sessionId?: string;
  caseId?: string;
  tags?: Record<string, string>;
}

// Gemini pricing (as of 2024)
const GEMINI_PRICING = {
  "gemini-1.5-flash": {
    input: 0.075, // $0.075 per 1M input tokens
    output: 0.3, // $0.30 per 1M output tokens
  },
  "gemini-1.5-pro": {
    input: 3.5, // $3.50 per 1M input tokens
    output: 10.5, // $10.50 per 1M output tokens
  },
  "gemini-2.0-flash-exp": {
    input: 0.075, // $0.075 per 1M input tokens
    output: 0.3, // $0.30 per 1M output tokens
  },
};

export class LangfuseService {
  private client!: Langfuse;
  private isEnabled: boolean;

  constructor() {
    const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
    const secretKey = process.env.LANGFUSE_SECRET_KEY;
    const host = "https://us.cloud.langfuse.com";

    this.isEnabled = !!(publicKey && secretKey);

    if (this.isEnabled) {
      this.client = new Langfuse({
        publicKey,
        secretKey,
        baseUrl: host,
      });
    }
  }

  /**
   * Calculate cost for Gemini models
   */
  private calculateGeminiCost(
    model: string,
    usage: { promptTokens: number; completionTokens: number }
  ): number {
    const pricing = GEMINI_PRICING[model as keyof typeof GEMINI_PRICING];
    if (!pricing) {
      return 0;
    }

    const inputCost = (usage.promptTokens / 1_000_000) * pricing.input;
    const outputCost = (usage.completionTokens / 1_000_000) * pricing.output;
    const totalCost = inputCost + outputCost;

    return totalCost;
  }

  /**
   * Get or create a trace for a caseId
   * @param name - Name of the trace
   * @param context - Optional trace context
   */
  getOrCreateTrace(name: string, context?: TraceContext) {
    if (!this.isEnabled) {
      return null;
    }

    // Always create a new trace for each conversation
    // This ensures each conversation gets its own trace, even if it's the same caseId
    const newTrace = this.createNewTrace(name, context);

    if (newTrace) {
      console.log(`    Created new trace for conversation: ${name}`);
    }

    return newTrace;
  }

  /**
   * Create a new trace (private method)
   * @param name - Name of the trace
   * @param context - Optional trace context
   */
  private createNewTrace(name: string, context?: TraceContext) {
    // Prepare tags ONLY from context.tags (no caseId as tag)
    const tags = context?.tags ? Object.values(context.tags) : undefined;

    // Generate a unique traceId for each conversation if not provided
    const traceId = context?.traceId || crypto.randomUUID();

    return this.client.trace({
      id: traceId,
      name,
      userId: context?.userId,
      sessionId: context?.sessionId,
      tags,
      metadata: context?.caseId ? { caseId: context.caseId } : undefined,
    });
  }

  /**
   * Create a new trace for a conversation or session (legacy method)
   * @param name - Name of the trace
   * @param context - Optional trace context
   */
  createTrace(name: string, context?: TraceContext) {
    // For backward compatibility, use the new method
    return this.getOrCreateTrace(name, context);
  }

  /**
   * Close a trace for a specific caseId
   * @param caseId - The case identifier
   */
  closeTrace(caseId: string) {
    if (!this.isEnabled) {
      return;
    }

    // Since we're now creating new traces for each conversation,
    // we don't need to maintain active traces by caseId
    // This method is kept for backward compatibility but doesn't need to do anything
    console.log(
      `Trace closing is now handled automatically for caseId: ${caseId}`
    );
  }

  /**
   * Track an LLM generation with proper input/output and timing
   * @param trace - The trace instance
   * @param data - The LLM observability data
   */
  async trackLLMGeneration(
    trace: any,
    data: LLMObservabilityData
  ): Promise<void> {
    if (!this.isEnabled || !trace) {
      return;
    }

    try {
      // Calculate cost for Gemini models
      let cost = 0;
      if (data.provider === "gemini") {
        cost = this.calculateGeminiCost(data.model, {
          promptTokens: data.usage.promptTokens,
          completionTokens: data.usage.completionTokens,
        });
      }

      // Extract timing information from metadata
      const startTime = data.metadata?.startTime;
      const endTime = data.metadata?.endTime;
      const latencyMs = data.metadata?.latencyMs;

      // Create a span to capture the full LLM operation with input/output
      const span = trace.span({
        name: `${data.provider} - ${data.model}`,
        input: {
          prompt: data.systemPrompt
            ? `${data.systemPrompt}\n\n${data.prompt}`
            : data.prompt,
          model: data.model,
          temperature: data.temperature,
          maxTokens: data.maxTokens,
          provider: data.provider,
        },
        output: {
          response: data.response,
          finishReason: data.finishReason,
          success: data.success,
          error: data.error,
        },
        metadata: {
          provider: data.provider,
          success: data.success,
          error: data.error,
          usage: data.usage,
          cost: cost,
          latencyMs: latencyMs,
          caseId: data.metadata?.caseId,
          ...data.metadata,
        },
      });

      // Add generation tracking for cost analysis and token usage with explicit timestamps
      span.generation({
        name: `${data.provider} - ${data.model}`,
        model: data.model,
        modelParameters: {
          temperature: data.temperature || null,
          maxTokens: data.maxTokens || null,
        },
        prompt: data.systemPrompt
          ? `${data.systemPrompt}\n\n${data.prompt}`
          : data.prompt,
        completion: data.response,
        usage: data.usage,
        startTime: startTime,
        endTime: endTime,
        metadata: {
          provider: data.provider,
          finishReason: data.finishReason,
          success: data.success,
          error: data.error,
          cost: cost,
          latencyMs: latencyMs,
          caseId: data.metadata?.caseId,
          ...data.metadata,
        },
      });
    } catch (error) {
      console.error("❌ Error tracking LLM generation with Langfuse:", error);
    }
  }

  /**
   * Track a span within a trace
   * @param trace - The trace instance
   * @param name - Name of the span
   * @param data - Span data
   */
  async trackSpan(
    trace: any,
    name: string,
    data: {
      input?: any;
      output?: any;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    if (!this.isEnabled || !trace) {
      return;
    }

    try {
      trace.span({
        name,
        input: data.input,
        output: data.output,
        metadata: data.metadata,
      });
    } catch (error) {
      console.error("Error tracking span with Langfuse:", error);
    }
  }

  /**
   * Track an event
   * @param trace - The trace instance
   * @param name - Name of the event
   * @param data - Event data
   */
  async trackEvent(
    trace: any,
    name: string,
    data: {
      input?: any;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    if (!this.isEnabled || !trace) {
      return;
    }

    try {
      trace.event({
        name,
        input: data.input,
        metadata: data.metadata,
      });
    } catch (error) {
      console.error("Error tracking event with Langfuse:", error);
    }
  }

  /**
   * Check if Langfuse is enabled
   */
  isObservabilityEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Shutdown the Langfuse client
   */
  async shutdown(): Promise<void> {
    if (this.isEnabled) {
      // Since we're creating new traces for each conversation,
      // we don't need to close active traces
      console.log("Shutting down Langfuse client");
      await this.client.shutdown();
    }
  }
}

// Export singleton instance
// Lazy loading singleton instance
let _langfuseService: LangfuseService | null = null;

export function getLangfuseService(): LangfuseService {
  if (!_langfuseService) {
    _langfuseService = new LangfuseService();
  }
  return _langfuseService;
}

// Export the lazy-loaded instance for backward compatibility
export const langfuseService = {
  createTrace: (name: string, context?: TraceContext) => {
    return getLangfuseService().createTrace(name, context);
  },
  getOrCreateTrace: (name: string, context?: TraceContext) => {
    return getLangfuseService().getOrCreateTrace(name, context);
  },
  closeTrace: (caseId: string) => {
    return getLangfuseService().closeTrace(caseId);
  },
  trackLLMGeneration: async (trace: any, data: LLMObservabilityData) => {
    return getLangfuseService().trackLLMGeneration(trace, data);
  },
  trackSpan: async (trace: any, name: string, data: any) => {
    return getLangfuseService().trackSpan(trace, name, data);
  },
  trackEvent: async (trace: any, name: string, data: any) => {
    return getLangfuseService().trackEvent(trace, name, data);
  },
  isObservabilityEnabled: () => {
    return getLangfuseService().isObservabilityEnabled();
  },
  shutdown: async () => {
    return getLangfuseService().shutdown();
  },
};
