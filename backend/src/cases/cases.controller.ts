// hono
import { Context } from "hono";

// services
import { conversationHistoryService } from "../services/firestore/conversation-history.service.js";

// validators
import { validateCaseId } from "../conversation/validators/conversation.validator.js";

// controller
export const casesController = {
  /**
   * Creates a new case.
   * @param c - Hono context
   * @returns JSON response with status and message
   */
  createCase: async (c: Context) => {
    try {
      const body = await c.req.json();
      const { caseId, userId, title, description } = body;

      if (!caseId || !userId || !title) {
        return c.json(
          {
            status: "error",
            message: "caseId, userId, and title are required",
          },
          400
        );
      }

      await conversationHistoryService.createCase(caseId, userId, title);

      return c.json({
        status: "success",
        message: "Case created successfully",
        caseId,
        userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error creating case:", error);

      return c.json(
        {
          status: "error",
          message: "Failed to create case",
          timestamp: new Date().toISOString(),
        },
        500
      );
    }
  },

  /**
   * Gets all cases for a specific user.
   * @param c - Hono context
   * @returns JSON response with user's cases
   */
  getUserCases: async (c: Context) => {
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

      const userCases = await conversationHistoryService.getUserCases(
        userAddressToLower
      );

      return c.json({
        status: "success",
        message: "User cases retrieved successfully",
        userAddress,
        cases: userCases,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error getting user cases:", error);

      return c.json(
        {
          status: "error",
          message: "Failed to get user cases",
          timestamp: new Date().toISOString(),
        },
        500
      );
    }
  },

  /**
   * Deletes a case and all its conversation history.
   * @param c - Hono context
   * @returns JSON response with status and message
   */
  deleteCaseAndConversationHistory: async (c: Context) => {
    try {
      const caseId = c.req.param("caseId");

      if (!caseId) {
        return c.json(
          {
            status: "error",
            message: "caseId parameter is required",
          },
          400
        );
      }

      // Validate caseId and handle error response if needed
      const validationResult = validateCaseId(c, caseId);

      if (!validationResult.isValid) {
        return validationResult.response;
      }

      await conversationHistoryService.deleteCase(validationResult.caseId);

      return c.json({
        status: "success",
        message: "Case and conversation history deleted successfully",
        caseId: validationResult.caseId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error deleting case and conversation history:", error);

      return c.json(
        {
          status: "error",
          message: "Failed to delete case and conversation history",
          timestamp: new Date().toISOString(),
        },
        500
      );
    }
  },
};
