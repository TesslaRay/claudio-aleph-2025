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
    origin: ["http://localhost:3001"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use("*", prettyJSON());

// Routes
app.route("/health", healthRoutes);
app.route("/claudio", claudioRoutes);

export default app;
