// hono
import { Hono } from "hono";

// controllers
import { casesController } from "./cases.controller.js";

const casesRoutes = new Hono();

// Create a new case
casesRoutes.post("/", casesController.createCase);

// Get all cases for a specific user
casesRoutes.get("/", casesController.getUserCases);

// Get complete case information with conversation history
// casesRoutes.get("/:caseId", casesController.getCaseWithConversation);

// Delete a case and all its conversation history
casesRoutes.delete(
  "/:caseId",
  casesController.deleteCaseAndConversationHistory
);

export { casesRoutes };
