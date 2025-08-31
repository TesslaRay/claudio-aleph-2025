import { Context } from "hono";

/**
 * Validates the caseId query parameter for conversation endpoints
 * @param caseId - The caseId to validate (can be undefined)
 * @returns Array of validation errors
 */
export const validateCaseIdQueryParameter = (
  caseId: string | undefined
): string[] => {
  const errors: string[] = [];

  if (!caseId) {
    errors.push("caseId query parameter is required");
    return errors;
  }

  // Validate caseId format - can be any string for now
  if (typeof caseId !== "string" || caseId.trim().length === 0) {
    errors.push("caseId must be a non-empty string");
  }

  return errors;
};

/**
 * Validates caseId and returns error response if validation fails
 * @param c - Hono context
 * @param caseId - The caseId to validate
 * @returns Object with isValid flag and validated caseId or error response
 */
export const validateCaseId = (
  c: Context,
  caseId: string | undefined
):
  | { isValid: true; caseId: string }
  | { isValid: false; response: Response } => {
  const validationErrors = validateCaseIdQueryParameter(caseId);

  if (validationErrors.length > 0) {
    return {
      isValid: false,
      response: c.json(
        {
          status: "error",
          message:
            validationErrors.length === 1
              ? validationErrors[0]
              : "Multiple validation errors occurred",
          errors: validationErrors,
          caseId,
        },
        400
      ),
    };
  }

  // At this point, caseId is guaranteed to be defined and valid
  return {
    isValid: true,
    caseId: caseId as string,
  };
};
