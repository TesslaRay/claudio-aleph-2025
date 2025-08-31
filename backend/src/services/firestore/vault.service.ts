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
   * @param userAddress - The user's identifier (string)
   * @returns Promise<VaultFile[]> - Array of vault files
   */
  async getUserVaultFiles(userAddress: string): Promise<VaultFile[]> {
    const snapshot = await this.firestore
      .collection(this.collectionName)
      .where("userAddress", "==", userAddress)
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
   * @param userAddress - The user's identifier (string)
   * @returns Promise<void>
   */
  async deleteAllUserVaultFiles(userAddress: string): Promise<void> {
    const snapshot = await this.firestore
      .collection(this.collectionName)
      .where("userAddress", "==", userAddress)
      .get();

    const batch = this.firestore.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }

  /**
   * Gets the total size of all files in a user's vault.
   * @param userAddress - The user's identifier (string)
   * @returns Promise<number> - Total size in MB
   */
  async getUserVaultTotalSize(userAddress: string): Promise<number> {
    const files = await this.getUserVaultFiles(userAddress);

    return files.reduce((total, file) => total + file.size, 0);
  }

  /**
   * Gets the count of files in a user's vault.
   * @param userAddress - The user's identifier (string)
   * @returns Promise<number> - Number of files
   */
  async getUserVaultFileCount(userAddress: string): Promise<number> {
    const snapshot = await this.firestore
      .collection(this.collectionName)
      .where("userAddress", "==", userAddress)
      .count()
      .get();

    return snapshot.data().count;
  }

  /**
   * Checks if a contract already exists for a specific case.
   * @param caseId - The case ID
   * @returns Promise<boolean> - True if contract exists, false otherwise
   */
  async checkIfContractAlreadyExists(caseId: string): Promise<boolean> {
    const snapshot = await this.firestore
      .collection(this.collectionName)
      .where("caseId", "==", caseId)
      .get();

    return snapshot.docs.length > 0;
  }

  /**
   * Gets the contract file for a specific case.
   * @param caseId - The case ID
   * @returns Promise<VaultFile | null> - Contract file or null if not found
   */
  async getContractByCaseId(caseId: string): Promise<VaultFile | null> {
    const snapshot = await this.firestore
      .collection(this.collectionName)
      .where("caseId", "==", caseId)
      .where("tags", "array-contains", "proposal")
      .limit(1)
      .get();

    if (snapshot.docs.length === 0) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as VaultFile;
  }
}

// Export singleton instance
export const vaultService = new VaultService();
