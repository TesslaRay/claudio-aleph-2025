// hono
import { Hono } from "hono";

// controllers
import { conversationController } from "./conversation.controller.js";

const conversationRoutes = new Hono();

// Get conversation history for a specific case
conversationRoutes.get(
  "/get-conversation-history-and-last-extracted-facts",
  conversationController.getConversationHistoryAndLastExtractedFacts
);

// Get last active case conversation for a specific user
conversationRoutes.get(
  "/last-active-case-conversation",
  conversationController.getLastActiveCaseConversationByUserId
);

// Get generated documents for a completed case
conversationRoutes.get(
  "/generated-documents",
  conversationController.getCaseGeneratedDocuments
);

export { conversationRoutes };
