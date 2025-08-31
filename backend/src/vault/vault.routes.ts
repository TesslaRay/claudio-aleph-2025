// hono
import { Hono } from "hono";

// controllers
import { vaultController } from "./vault.controller.js";

const vaultRoutes = new Hono();

// Get user vault files
vaultRoutes.get("/user-vault-files", vaultController.getUserVaultFiles);

// Delete all user vault files
vaultRoutes.delete("/all", vaultController.deleteAllUserVaultFiles);

// Delete specific vault file
vaultRoutes.delete("/:fileId", vaultController.deleteVaultFile);

export { vaultRoutes };
