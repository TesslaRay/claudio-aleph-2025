export interface IntakeClaudioResponse {
  message: string;
  ucs: string[];
  score: number;
  metadata: {
    employer_address?: string;
    coworker_address?: string;
    [key: string]: any;
  };
}

export class JsonExtractorService {
  private static instance: JsonExtractorService;

  private constructor() {}

  /**
   * Get singleton instance of JsonExtractorService
   */
  public static getInstance(): JsonExtractorService {
    if (!JsonExtractorService.instance) {
      JsonExtractorService.instance = new JsonExtractorService();
    }

    return JsonExtractorService.instance;
  }

  public extractIntakeClaudioJson(text: string): IntakeClaudioResponse {
    const defaultResponse: IntakeClaudioResponse = {
      message: "",
      ucs: [],
      score: 0,
      metadata: {},
    };

    if (!text || typeof text !== "string") {
      return defaultResponse;
    }

    try {
      let jsonStr = text.trim();

      const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonBlockMatch) {
        jsonStr = jsonBlockMatch[1];
      } else {
        // Buscar cualquier estructura JSON en el texto
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
      }

      const parsed = JSON.parse(jsonStr);

      const result: IntakeClaudioResponse = {
        message: this.validateString(parsed.message, ""),
        ucs: this.validateUcsArray(parsed.ucs),
        score: this.validateScore(parsed.score),
        metadata: this.validateMetadata(parsed.metadata),
      };

      return result;
    } catch (error) {
      try {
        return this.fallbackExtraction(text);
      } catch {
        return defaultResponse;
      }
    }
  }

  /**
   * Validate that the value is a valid string
   */
  private validateString(value: any, defaultValue: string = ""): string {
    if (typeof value === "string") {
      return value;
    }
    if (value != null && typeof value.toString === "function") {
      return value.toString();
    }
    return defaultValue;
  }

  /**
   * Validate and normalize the ucs array
   */
  private validateUcsArray(value: any): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .filter((item) => item != null)
      .map((item) => this.validateString(item, ""))
      .filter((item) => item.length > 0);
  }

  /**
   * Validate and normalize the score (0.0 - 1.0)
   */
  private validateScore(value: any): number {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return 0;
    }

    // Ensure that it is between 0 and 1
    return Math.max(0, Math.min(1, num));
  }

  /**
   * Validate and normalize the metadata object
   */
  private validateMetadata(value: any): { employer_address?: string; coworker_address?: string; [key: string]: any } {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    const result: { employer_address?: string; coworker_address?: string; [key: string]: any } = {};
    
    // Validate specific known fields
    if (value.employer_address && typeof value.employer_address === 'string') {
      result.employer_address = value.employer_address;
    }
    
    if (value.coworker_address && typeof value.coworker_address === 'string') {
      result.coworker_address = value.coworker_address;
    }

    // Include any other metadata fields
    for (const [key, val] of Object.entries(value)) {
      if (key !== 'employer_address' && key !== 'coworker_address') {
        result[key] = val;
      }
    }

    return result;
  }

  /**
   * Alternative extraction when the normal parsing fails
   */
  private fallbackExtraction(text: string): IntakeClaudioResponse {
    const result: IntakeClaudioResponse = {
      message: "",
      ucs: [],
      score: 0,
      metadata: {},
    };

    // Try to extract the message
    const messageMatch = text.match(/"message"\s*:\s*"([^"]*)"/);
    if (messageMatch) {
      result.message = messageMatch[1];
    }

    // Try to extract the ucs array
    const ucsMatch = text.match(/"ucs"\s*:\s*\[([\s\S]*?)\]/);
    if (ucsMatch) {
      try {
        // Extract strings from the array
        const ucsContent = ucsMatch[1];
        const stringMatches = ucsContent.match(/"([^"]*)"/g);
        if (stringMatches) {
          result.ucs = stringMatches.map((s) => s.replace(/"/g, ""));
        }
      } catch {}
    }

    // Try to extract the score
    const scoreMatch = text.match(/"score"\s*:\s*([\d.]+)/);
    if (scoreMatch) {
      result.score = this.validateScore(scoreMatch[1]);
    }

    // Try to extract metadata
    const metadataMatch = text.match(/"metadata"\s*:\s*\{([^}]*)\}/);
    if (metadataMatch) {
      try {
        const metadataStr = `{${metadataMatch[1]}}`;
        const parsedMetadata = JSON.parse(metadataStr);
        result.metadata = this.validateMetadata(parsedMetadata);
      } catch {
        // If metadata parsing fails, try to extract known fields manually
        const employerMatch = text.match(/"employer_address"\s*:\s*"([^"]*)"/);
        const coworkerMatch = text.match(/"coworker_address"\s*:\s*"([^"]*)"/);
        
        if (employerMatch) {
          result.metadata.employer_address = employerMatch[1];
        }
        if (coworkerMatch) {
          result.metadata.coworker_address = coworkerMatch[1];
        }
      }
    }

    return result;
  }
}

// Export singleton instance
export const jsonExtractorService = JsonExtractorService.getInstance();
