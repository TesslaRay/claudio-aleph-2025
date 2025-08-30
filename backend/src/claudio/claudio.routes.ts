// hono
import { Hono } from "hono";

// controllers
import { claudioController } from "./claudio.controller.js";

const claudioRoutes = new Hono();

// Basic health check
claudioRoutes.post("/chat", claudioController.chatWithClaudio);

export { claudioRoutes };
