// Export PDF service and types
export * from "./pdf.service.js";
export * from "./types/pdf.types.js";
export * from "./claudio.pdf.service.js";

// Create and export a default instance
import { PDFServiceImpl } from "./pdf.service.js";
import { ClaudioPDFService } from "./claudio.pdf.service.js";

/**
 * Default PDF service instance
 */
export const pdfService = new PDFServiceImpl();

/**
 * Default Claudio PDF service instance for legal proposals
 */
export { ClaudioPDFService };
