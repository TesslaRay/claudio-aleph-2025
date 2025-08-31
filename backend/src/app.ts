// hono
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";

// dotenv
import dotenv from "dotenv";

// routes
import { healthRoutes } from "./health/health.routes.js";
import { claudioRoutes } from "./claudio/claudio.routes.js";
import { casesRoutes } from "./cases/cases.routes.js";
import { conversationRoutes } from "./conversation/conversation.routes.js";
import { vaultRoutes } from "./vault/vault.routes.js";

// LLM services
import { initializeLLMServices } from "./services/llm/llm.init.js";

// load env
dotenv.config();

// Initialize services
initializeLLMServices();

const app = new Hono();

// middleware - only use logger in non-test environments
if (process.env.NODE_ENV !== "test") {
  app.use("*", logger());
}
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://claudio-aleph-2025.vercel.app",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use("*", prettyJSON());

// Routes
app.route("/health", healthRoutes);
app.route("/claudio", claudioRoutes);
app.route("/cases", casesRoutes);
app.route("/conversation", conversationRoutes);
app.route("/vault", vaultRoutes);

export default app;
