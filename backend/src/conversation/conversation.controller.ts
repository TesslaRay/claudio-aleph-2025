// hono
import { Context } from "hono";

// services
import { conversationHistoryService } from "../services/firestore/conversation-history.service.js";

// validators
import { validateCaseId } from "./validators/conversation.validator.js";

// controller
export const conversationController = {
  getConversationHistoryAndLastUcsState: async (c: Context) => {
    const caseId = c.req.query("caseId");

    const validationResult = validateCaseId(c, caseId);

    if (!validationResult.isValid) {
      return validationResult.response;
    }

    // Check if case is completed
    const isCompleted = await conversationHistoryService.isCaseCompleted(
      validationResult.caseId
    );

    const conversationHistoryComplete =
      await conversationHistoryService.getConversationHistory(
        validationResult.caseId
      );

    if (
      !conversationHistoryComplete ||
      conversationHistoryComplete.length === 0
    ) {
      return c.json({
        status: "success",
        message: "No conversation history found for this caseId.",
        caseId: validationResult.caseId,
        conversation: [],
        ucs: [],
        isCompleted: false,
      });
    }

    const lastUcs =
      conversationHistoryComplete?.[conversationHistoryComplete.length - 1]
        ?.ucs || [];

    const conversationHistory = conversationHistoryComplete.map((item) => {
      return {
        message: item?.userMessage,
        response: item?.agentMessage,
        timestamp: item?.timestamp,
        ucs: item?.ucs,
        score: item?.score,
      };
    });

    return c.json({
      status: "success",
      message:
        "Conversation history and last extracted facts retrieved successfully",
      caseId: validationResult.caseId,
      conversation: conversationHistory,
      ucs: lastUcs,
      isCompleted,
    });
  },

  /**
   * Gets the conversation history for the last active case of a user.
   * @param c - Hono context
   * @returns JSON response with the conversation and caseId
   */
  getLastActiveCaseConversationByUserId: async (c: Context) => {
    try {
      const userAddress = c.req.query("userAddress");

      if (!userAddress) {
        return c.json(
          {
            status: "error",
            message: "userAddress query parameter is required",
          },
          400
        );
      }

      const userAddressToLower = userAddress.toLowerCase();

      const result =
        await conversationHistoryService.getLastActiveCaseConversation(
          userAddressToLower
        );

      if (!result) {
        // No cases found for this user, return 200 with empty data

        return c.json({
          status: "success",
          message: "No cases found for this user.",
          caseId: null,
          conversation: [],
          ucs: [],
          timestamp: new Date().toISOString(),
        });
      }

      let ucs: string[] = [];
      let lastScore: number = 0;

      if (result.conversation && result.conversation.length > 0) {
        const lastEntry = result.conversation[result.conversation.length - 1];
        if (lastEntry.ucs && Array.isArray(lastEntry.ucs)) {
          ucs = lastEntry.ucs;
        }

        if (lastEntry.score) {
          lastScore = lastEntry.score;
        }
      }

      return c.json({
        status: "success",
        message: "Last active case conversation retrieved successfully",
        caseId: result.caseId,
        conversation: result.conversation,
        ucs,
        score: lastScore,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error getting last active case conversation:", error);

      return c.json(
        {
          status: "error",
          message: "Failed to get last active case conversation",
          timestamp: new Date().toISOString(),
        },
        500
      );
    }
  },
};
