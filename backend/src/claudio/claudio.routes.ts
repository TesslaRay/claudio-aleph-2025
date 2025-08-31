// hono
import { Hono } from "hono";

// controllers
import { claudioController } from "./claudio.controller.js";

const claudioRoutes = new Hono();

// Basic health check
claudioRoutes.post("/chat", claudioController.chatWithClaudio);

claudioRoutes.post(
  "/generate-contract-for-case",
  claudioController.generateContractForCase
);

claudioRoutes.get(
  "/contract/:caseId", 
  claudioController.getContractByCaseId
);

export { claudioRoutes };
