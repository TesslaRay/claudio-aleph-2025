// path
import path from "path";

// fs
import fs from "fs/promises";

// os
import os from "os";

// pdf service
import {
  pdfService,
  PDFGenerationOptions,
  PDFGenerationResult,
} from "./index.js";

// storage service
import { googleCloudStorageService } from "../storage/google-cloud-storage.service.js";

// vault service
import { vaultService } from "../firestore/vault.service.js";

// types
import { ClaudioContractOptions } from "./types/claudio.pdf.types.js";

/**
 * Language-specific content for cover pages
 */
interface CoverPageTranslations {
  contract: {
    title: string;
    subtitle: string;
    documentType: string;
    author: string;
    subject: string;
    keywords: string[];
  };
}

/**
 * Claudio PDF Service - Specialized wrapper for generating legal documents
 * Provides functionality to generate professional legal documents PDFs with cover pages
 */
export class ClaudioPDFService {
  private logoPath: string;
  private translations: Record<string, CoverPageTranslations>;

  constructor() {
    this.logoPath = path.join(
      process.cwd(),
      "src",
      "assets",
      "logo",
      "logo-black.png"
    );

    // Initialize translations
    this.translations = {
      en: {
        contract: {
          title: "Legal Service Contract",
          subtitle: "Connecting LATAM onchain with Legal AI",
          documentType: "Service Contract",
          author: "Claudio - Legal Onchain Agent",
          subject: "Legal Service Contract",
          keywords: [
            "AI",
            "legal",
            "crypto",
            "web3",
            "onchain",
            "blockchain",
            "automation",
          ],
        },
      },
      es: {
        contract: {
          title: "Propuesta de Contrato de Prestación de Servicios",
          subtitle: "Conectando LATAM onchain con IA Legal",
          documentType: "Propuesta de Contrato",
          author: "Claudio - Legal Onchain Agent",
          subject: "Contrato de Prestación de Servicios",
          keywords: [
            "IA",
            "legal",
            "crypto",
            "web3",
            "onchain",
            "blockchain",
            "automatización",
          ],
        },
      },
    };

    // Validate logo file exists on service initialization
    this.validateLogoFile();
  }

  /**
   * Get translations for a specific language and document type
   * @param language - Language code (en/es)
   * @param documentType - Type of document (proposal/investigato/respondeo)
   * @returns Translation object
   */
  private getTranslations(
    language: string,
    documentType: keyof CoverPageTranslations
  ) {
    const lang = language.toLowerCase() === "es" ? "es" : "en";
    return this.translations[lang][documentType];
  }

  /**
   * Get contact information based on language
   * @param language - Language code (en/es)
   * @returns Contact information object
   */
  private getContactInfo(language: string) {
    const isSpanish = language.toLowerCase() === "es";

    return {
      firmName: "Claudio | Legal Onchain Agent",
      address: isSpanish
        ? "Conectando LATAM onchain con IA Legal"
        : "Connecting LATAM onchain with Legal AI",
      email: "",
      website: "",
    };
  }

  /**
   * Get UI text translations based on language
   * @param language - Language code (en/es)
   * @returns UI text translations object
   */
  private getUITranslations(language: string) {
    const isSpanish = language.toLowerCase() === "es";

    return {
      preparedFor: isSpanish ? "Preparado para:" : "Prepared for:",
      reference: isSpanish ? "Referencia:" : "Reference:",
      telephone: isSpanish ? "Tel:" : "Tel:",
      footer: isSpanish
        ? "Claudio para Aleph Hackathon 2025"
        : "Claudio for Aleph Hackathon 2025",
    };
  }

  /**
   * Validate that the logo file exists
   */
  private async validateLogoFile(): Promise<void> {
    try {
      await fs.access(this.logoPath);
    } catch (error) {
      console.warn(
        `Logo file not found during initialization: ${this.logoPath}`
      );
      console.warn("Service will use placeholder logo when generating PDFs");
    }
  }

  /**
   * Generate a legal proposal PDF with cover page and professional formatting
   * @param options - Proposal generation options
   * @returns Promise with PDF generation result including cloud storage URL
   */
  async generatePdfContract(
    options: ClaudioContractOptions
  ): Promise<PDFGenerationResult & { cloudStorageUrl?: string }> {
    let tempFilePath: string | undefined;

    try {
      console.log("Generating legal proposal PDF for Tomas...");

      // Load logo data
      const logoData = await this.loadLogoData();

      // Get translations based on language
      const translations = this.getTranslations(options.language, "contract");
      const contactInfo = this.getContactInfo(options.language);
      const uiTranslations = this.getUITranslations(options.language);

      // Build advanced PDF options with professional cover page
      const pdfOptions: PDFGenerationOptions = {
        content: options.content,
        title: options.title || translations.title,
        author: options.author || translations.author,
        subject: options.subject || translations.subject,
        keywords: options.keywords || translations.keywords,
        pageSize: "A4",
        orientation: "portrait",
        fontSize: 11,
        lineHeight: 1.4,
        margins: 50,
        coverPage: {
          title: options.title || translations.title,
          author: options.author || translations.author,
          subtitle: options.coverPage?.subtitle || translations.subtitle,
          documentType:
            options.coverPage?.documentType || translations.documentType,
          clientName: options.caseId,
          logo: {
            data: logoData,
            name: "claudio_logo-black",
            width: 50,
            height: 50,
            format: "png",
          },
          showDate: true,
          customDate:
            options.customDate || this.getCurrentDate(options.language),
          contactInfo: options.coverPage?.contactInfo || contactInfo,
          confidentialityNotice: options.coverPage?.confidentialityNotice,
          translations: uiTranslations,
        },
      };

      // Generate PDF using the base service
      const result = await pdfService.generatePDF(pdfOptions);

      // Handle file storage based on uploadToCloud setting
      let cloudStorageUrl: string | undefined;
      let localFilePath: string | undefined;

      if (options.uploadToCloud !== false) {
        // Upload to cloud storage
        try {
          const tempDir = os.tmpdir();
          const filename = options.filename || `proposal-${Date.now()}.pdf`;
          tempFilePath = path.join(tempDir, filename);

          await this.saveToLocalFile(result.pdfBytes, tempFilePath);
          console.log(`PDF proposal saved temporarily as: ${tempFilePath}`);

          // Upload to Google Cloud Storage
          cloudStorageUrl = await googleCloudStorageService.uploadFile(
            Buffer.from(result.pdfBytes),
            filename,
            "application/pdf"
          );

          console.log(
            `PDF contract uploaded to cloud storage: ${cloudStorageUrl}`
          );

          // Save to Firestore vault if caseId is provided
          if (options.caseId && cloudStorageUrl) {
            await this.saveDocumentToVault(
              options.userAddress,
              options.caseId,
              filename,
              cloudStorageUrl,
              result.size,
              "contract"
            );
            console.log(`Contract saved to vault for case: ${options.caseId}`);
          }

          // Delete temporary file after successful upload
          await this.deleteLocalFile(tempFilePath);
          console.log(`Temporary file deleted: ${tempFilePath}`);
          tempFilePath = undefined; // Clear the path since file is deleted
        } catch (uploadError) {
          console.error("Error uploading PDF to cloud storage:", uploadError);
        }
      } else {
        // Save locally for testing/debugging
        try {
          const testOutputDir = path.join(process.cwd(), "test-outputs");
          const filename = options.filename || `proposal-${Date.now()}.pdf`;
          localFilePath = path.join(testOutputDir, filename);

          await this.saveToLocalFile(result.pdfBytes, localFilePath);
          console.log(
            `PDF proposal saved locally for testing: ${localFilePath}`
          );
        } catch (localSaveError) {
          console.error("Error saving PDF locally:", localSaveError);
        }
      }

      console.log(
        `PDF proposal generated successfully: ${result.size} bytes, ${result.pageCount} pages`
      );

      return {
        ...result,
        cloudStorageUrl,
      };
    } catch (error) {
      console.error("Error generating PDF proposal:", error);
      throw new Error(
        `Failed to generate PDF proposal: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      if (tempFilePath) {
        try {
          await this.deleteLocalFile(tempFilePath);
          console.log(`Cleaned up temporary file: ${tempFilePath}`);
        } catch (cleanupError) {
          console.error("Error cleaning up temporary file:", cleanupError);
        }
      }
    }
  }

  /**
   * Save document to Firestore vault
   * @param userAddress - User address
   * @param caseId - Case ID
   * @param filename - Name of the file
   * @param url - Cloud storage URL
   * @param size - File size in bytes
   * @param documentType - Type of document (proposal, investigato, respondeo)
   */
  private async saveDocumentToVault(
    userAddress: string,
    caseId: string,
    filename: string,
    url: string,
    size: number,
    documentType: "contract"
  ): Promise<void> {
    try {
      const documentConfig = {
        contract: {
          description: "Legal service contract generated by Claudio",
          tags: ["proposal", "document"],
        },
      };

      const config = documentConfig[documentType];

      const vaultFile = {
        userAddress,
        caseId,
        name: filename,
        type: "application/pdf",
        url,
        size: Math.round((size / (1024 * 1024)) * 100) / 100,
        timestamp: Date.now(),
        description: config.description,
        tags: config.tags,
        isPublic: false,
      };

      await vaultService.addVaultFile(vaultFile);
    } catch (error) {
      console.error(`Error saving ${documentType} to vault:`, error);
      throw new Error(
        `Failed to save ${documentType} to vault: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Load logo data from file
   * @returns Buffer with logo data or placeholder
   */
  private async loadLogoData(): Promise<Buffer> {
    try {
      console.log(`Attempting to load logo from: ${this.logoPath}`);

      // Check if file exists first
      try {
        await fs.access(this.logoPath);
        console.log("Logo file exists and is accessible");
      } catch (accessError) {
        console.error(
          `Logo file not accessible: ${this.logoPath}`,
          accessError
        );
        throw new Error(`Logo file not accessible: ${this.logoPath}`);
      }

      const logoData = await fs.readFile(this.logoPath);
      console.log(`Logo loaded successfully: ${logoData.length} bytes`);
      return logoData;
    } catch (error) {
      console.warn("Could not read logo file, using placeholder:", error);
      console.log(`Current working directory: ${process.cwd()}`);
      console.log(`Logo path: ${this.logoPath}`);

      // Create a simple placeholder image if logo is not found
      const placeholderData = new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
        0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0xcf, 0x00,
        0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb0, 0x00, 0x00, 0x00,
        0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
      ]);
      return Buffer.from(placeholderData);
    }
  }

  /**
   * Save PDF bytes to local file
   * @param pdfBytes - PDF data as Uint8Array
   * @param filepath - Full file path to save as
   */
  private async saveToLocalFile(
    pdfBytes: Uint8Array,
    filepath: string
  ): Promise<void> {
    try {
      await fs.writeFile(filepath, pdfBytes);
    } catch (error) {
      console.error("Error saving PDF to local file:", error);
      throw new Error(
        `Failed to save PDF to local file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete local file
   * @param filepath - Full file path to delete
   */
  private async deleteLocalFile(filepath: string): Promise<void> {
    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.error("Error deleting local file:", error);
      throw new Error(
        `Failed to delete local file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get current date in specified language format
   * @param language - Language code (en/es)
   * @returns Formatted date string
   */
  private getCurrentDate(language: string = "en"): string {
    const now = new Date();
    const isSpanish = language.toLowerCase() === "es";

    const months = isSpanish
      ? [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre",
        ]
      : [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  }
}

// Create and export a default instance
export const claudioPdfService = new ClaudioPDFService();
