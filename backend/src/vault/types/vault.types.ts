export interface UploadFileResponse {
  success: boolean;
  fileUrl: string;
  fileName: string;
  caseId: string;
  timestamp: string;
  size: number;
  processedWithAI?: boolean;
  aiProcessing?: {
    extractedContent?: string;
    suggestedName?: string;
    documentType?: string;
    confidence?: number;
    error?: string;
  };
}