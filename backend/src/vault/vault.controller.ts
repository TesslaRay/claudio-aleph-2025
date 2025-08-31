// hono
import { Context } from "hono";

// services
import { vaultService } from "../services/firestore/vault.service.js";

// validators
import { validateUserAddressInQueryParams } from "./validators/vault.validator.js";

// types

// controller
export const vaultController = {
  /**
   * Retrieves all files for a specific user from their vault.
   * @param c - Hono context
   * @returns JSON response with user's vault files
   */
  getUserVaultFiles: async (c: Context) => {
    const userAddress = c.req.query("userAddress");

    const userAddressToLower = userAddress?.toLowerCase();

    const validationResult = validateUserAddressInQueryParams(
      c,
      userAddressToLower
    );

    if (!validationResult.isValid) {
      return validationResult.response;
    }

    try {
      const vaultFiles = await vaultService.getUserVaultFiles(
        userAddressToLower as string
      );

      const totalSize = await vaultService.getUserVaultTotalSize(
        userAddressToLower as string
      );

      const fileCount = await vaultService.getUserVaultFileCount(
        userAddressToLower as string
      );

      return c.json({
        status: "success",
        message: "User vault files retrieved successfully",
        userAddress: validationResult.userAddress,
        files: vaultFiles,
        stats: {
          totalFiles: fileCount,
          totalSizeMB: totalSize,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error getting user vault files:", error);

      return c.json(
        {
          status: "error",
          message: "Failed to get user vault files",
          timestamp: new Date().toISOString(),
        },
        500
      );
    }
  },

  /**
   * Deletes all files for a specific user from their vault.
   * @param c - Hono context
   * @returns JSON response with success or error message
   */
  deleteAllUserVaultFiles: async (c: Context) => {
    try {
      const userAddress = c.req.query("userAddress");

      // Validate address and handle error response if needed
      const validationResult = validateUserAddressInQueryParams(c, userAddress);

      if (!validationResult.isValid) {
        return validationResult.response;
      }

      await vaultService.deleteAllUserVaultFiles(validationResult.userAddress);

      return c.json({
        status: "success",
        message: "All user vault files deleted successfully",
        userAddress: validationResult.userAddress,
      });
    } catch (error) {
      console.error("Error deleting all user vault files:", error);

      return c.json(
        {
          status: "error",
          message: "Failed to delete all user vault files",
          timestamp: new Date().toISOString(),
        },
        500
      );
    }
  },

  /**
   * Deletes a specific file from the user's vault (Firestore only, not from Google Cloud Storage).
   * @param c - Hono context
   * @returns JSON response with success or error message
   */
  deleteVaultFile: async (c: Context) => {
    try {
      const fileId = c.req.param("fileId");
      const userAddress = c.req.query("userAddress");

      if (!fileId) {
        return c.json(
          {
            status: "error",
            message: "File ID is required",
            timestamp: new Date().toISOString(),
          },
          400
        );
      }

      const validationResult = validateUserAddressInQueryParams(c, userAddress);

      if (!validationResult.isValid) {
        return validationResult.response;
      }

      // Get the file to verify ownership
      const files = await vaultService.getUserVaultFiles(
        validationResult.userAddress
      );
      const fileExists = files.some((file) => file.id === fileId);

      if (!fileExists) {
        return c.json(
          {
            status: "error",
            message: "File not found or access denied",
            timestamp: new Date().toISOString(),
          },
          404
        );
      }

      await vaultService.deleteVaultFile(fileId);

      return c.json({
        status: "success",
        message: "File deleted successfully from vault",
        fileId,
        userAddress: validationResult.userAddress,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error deleting vault file:", error);

      return c.json(
        {
          status: "error",
          message: "Failed to delete vault file",
          timestamp: new Date().toISOString(),
        },
        500
      );
    }
  },
};
