// hono
import { Context } from "hono";

// controller
export const claudioController = {
  // chat with claudio
  chatWithClaudio: (c: Context) => {
    return c.json({
      message: "Hello, how can I help you today?",
    });
  },
};
