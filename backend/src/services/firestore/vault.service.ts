// firestore
import { Firestore } from "@google-cloud/firestore";

// types
import { VaultFile } from "./types/vault.types";

/**
 * Service for handling vault operations in Firestore.
 */
export class VaultService {
  private firestore: Firestore;
  private collectionName: string;

  constructor() {
    this.firestore = new Firestore();
    this.collectionName = "claudio-vault";
  }

  /**
   * Retrieves all files for a specific user from their vault, ordered by timestamp descending (newest first).
   * @param userId - The user's identifier (string)
   * @returns Promise<VaultFile[]> - Array of vault files
   */
  async getUserVaultFiles(userId: string): Promise<VaultFile[]> {
    const snapshot = await this.firestore
      .collection(this.collectionName)
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .get();

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as VaultFile & { id: string })
    );
  }

  /**
   * Adds a file to the user's vault.
   * @param vaultFile - The vault file to add
   * @returns Promise<void>
   */
  async addVaultFile(vaultFile: VaultFile): Promise<void> {
    await this.firestore.collection(this.collectionName).add(vaultFile);
  }

  /**
   * Deletes a specific file from the user's vault.
   * @param fileId - The file ID to delete
   * @returns Promise<void>
   */
  async deleteVaultFile(fileId: string): Promise<void> {
    await this.firestore.collection(this.collectionName).doc(fileId).delete();
  }

  /**
   * Deletes all files for a specific user from their vault.
   * @param userId - The user's identifier (string)
   * @returns Promise<void>
   */
  async deleteAllUserVaultFiles(userId: string): Promise<void> {
    const snapshot = await this.firestore
      .collection(this.collectionName)
      .where("userId", "==", userId)
      .get();

    const batch = this.firestore.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }

  /**
   * Gets the total size of all files in a user's vault.
   * @param userId - The user's identifier (string)
   * @returns Promise<number> - Total size in MB
   */
  async getUserVaultTotalSize(userId: string): Promise<number> {
    const files = await this.getUserVaultFiles(userId);

    return files.reduce((total, file) => total + file.size, 0);
  }

  /**
   * Gets the count of files in a user's vault.
   * @param userId - The user's identifier (string)
   * @returns Promise<number> - Number of files
   */
  async getUserVaultFileCount(userId: string): Promise<number> {
    const snapshot = await this.firestore
      .collection(this.collectionName)
      .where("userId", "==", userId)
      .count()
      .get();

    return snapshot.data().count;
  }
}

// Export singleton instance
export const vaultService = new VaultService();
