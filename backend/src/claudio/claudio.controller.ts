// hono
import { Context } from "hono";

// llm service
import { llmServiceManager } from "../services/llm/llm.service";
import { MODELS, PROVIDERS } from "../services/llm/lllm.constants";

// types
import { ChatWithTomasRequest } from "./types/claudio.types";

// validators
import { validateChatWithTomasRequest } from "./validators/tomas.validator";

// firestore services
import { ConversationEntry } from "../services/firestore/types/claudio.types";
import { conversationHistoryService } from "../services/firestore/conversation-history.service";

// prompt builder service
import { promptBuilderService } from "../services/prompt-builder";
import { jsonExtractorService } from "../services/json-extractor";

// agent contract service
import { agentLegalContractService } from "../services/agent-contract";
import { vaultService } from "../services/firestore/vault.service";

// controller
export const claudioController = {
  // chat with claudio
  chatWithClaudio: async (c: Context) => {
    let body: ChatWithTomasRequest | undefined;

    body = await c.req.json();

    // Validate request
    const validationErrors = validateChatWithTomasRequest(body);

    if (validationErrors.length > 0) {
      return c.json(
        {
          success: false,
          error: "Validation failed",
          details: validationErrors,
        },
        400
      );
    }

    // At this point, body is guaranteed to be defined and valid
    const validatedBody = body as ChatWithTomasRequest;
    const userAddress = validatedBody.userAddress?.toLowerCase();

    if (!userAddress) {
      return c.json({
        success: true,
        message:
          "Hola, no me has proporcionado tu address, por lo que no puedo ayudarte. Por favor, conecta tu wallet para poder continuar.",
        ucs: ["El cliente no proporciono su address"],
      });
    }

    // Handle caseId - create if not provided, validate if provided
    let finalCaseId = validatedBody.caseId;
    let conversationHistory: ConversationEntry[] = [];

    if (!finalCaseId) {
      // Create new caseId
      finalCaseId = `case-${userAddress}-${Date.now()}`;

      // Create the case document in Firestore
      await conversationHistoryService.createCase(
        finalCaseId,
        userAddress as string,
        `Case for ${userAddress}`
      );

      console.log(`    Created new caseId: ${finalCaseId}`);
    } else {
      conversationHistory =
        await conversationHistoryService.getConversationHistory(finalCaseId);

      if (conversationHistory.length === 0) {
        return c.json(
          {
            success: false,
            error: "Invalid caseId - case not found",
          },
          404
        );
      }
    }

    // Build message with previous conversation, last ucs state and current user message
    const lastUcs =
      conversationHistory.length > 0
        ? conversationHistory[conversationHistory.length - 1].ucs
        : [];

    const messageWithPreviousConversation =
      conversationHistory.length > 0
        ? `=== PREVIOUS CONVERSATION ===\n${conversationHistory
            .map(
              (turn) =>
                `User: ${turn.userMessage}\nClaudio: ${
                  turn.agentMessage || "[No response]"
                }`
            )
            .join("\n---\n")}\n\n=== LAST UCS STATE ===\n${lastUcs
            .map((uc) => `- ${uc}`)
            .join("\n")}\n\n=== CURRENT MESSAGE ===\nUser: ${
            validatedBody.message
          }`
        : `User: ${validatedBody.message}`;

    const PROVIDER = PROVIDERS.GEMINI;
    const MODEL = MODELS.GEMINI_2_5_FLASH;

    const systemPrompt = await promptBuilderService.buildIntakeClaudioPrompt();

    const llmResponse = await llmServiceManager.generateText(
      {
        prompt: messageWithPreviousConversation,
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

    const claudioIntakeJson = jsonExtractorService.extractIntakeClaudioJson(
      llmResponse.content
    );

    // Save conversation to Firestore
    await conversationHistoryService.addConversation(
      finalCaseId,
      userAddress as string,
      validatedBody.message,
      claudioIntakeJson.message,
      claudioIntakeJson.ucs,
      claudioIntakeJson.score,
      claudioIntakeJson.metadata
    );

    return c.json({
      success: true,
      message: claudioIntakeJson.message,
      ucs: claudioIntakeJson.ucs,
      score: claudioIntakeJson.score,
    });
  },

  generateContractForCase: async (c: Context) => {
    const body = await c.req.json();
    const { caseId } = body;

    const checkIfContractAlreadyExists =
      await vaultService.checkIfContractAlreadyExists(caseId);

    if (checkIfContractAlreadyExists) {
      return c.json(
        {
          success: false,
          error: "Contract already exists",
        },
        400
      );
    }

    const conversationHistory =
      await conversationHistoryService.getConversationHistory(caseId);

    if (conversationHistory.length === 0) {
      return c.json(
        {
          success: false,
          error: "Invalid caseId - case not found",
        },
        404
      );
    }

    const lastUcs = conversationHistory[conversationHistory.length - 1].ucs;
    const userAddress =
      conversationHistory[conversationHistory.length - 1].userAddress;

    const contract = await agentLegalContractService.generateContract(
      caseId,
      userAddress,
      lastUcs
    );

    return c.json({
      success: true,
    });
  },

  getContractByCaseId: async (c: Context) => {
    try {
      const caseId = c.req.param("caseId");

      if (!caseId) {
        return c.json(
          {
            success: false,
            error: "Case ID is required",
          },
          400
        );
      }

      // Get contract from vault
      const contract = await vaultService.getContractByCaseId(caseId);

      if (!contract) {
        return c.json(
          {
            success: false,
            error: "Contract not found for this case",
          },
          404
        );
      }

      // Get conversation history to get additional case info
      const conversationHistory =
        await conversationHistoryService.getConversationHistory(caseId);

      return c.json({
        success: true,
        contract: {
          id: contract.id,
          name: contract.name,
          url: contract.url,
          size: contract.size,
          timestamp: contract.timestamp,
          description: contract.description,
        },
        case: {
          caseId,
          userAddress: contract.userAddress,
          conversationHistory:
            conversationHistory.length > 0 ? conversationHistory : [],
        },
      });
    } catch (error) {
      console.error("Error getting contract by case ID:", error);

      return c.json(
        {
          success: false,
          error: "Failed to get contract",
        },
        500
      );
    }
  },
};
