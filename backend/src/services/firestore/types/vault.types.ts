/**
 * Represents a file stored in the user's vault.
 */
export interface VaultFile {
  id?: string;
  userAddress: string;
  name: string;
  type: string;
  url: string;
  size: number; // Size in MB
  timestamp: number;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
  // AI processing fields
  aiProcessed?: boolean;
  extractedContent?: string;
  documentType?: string;
  aiConfidence?: number;
  metadata?: any;
}
