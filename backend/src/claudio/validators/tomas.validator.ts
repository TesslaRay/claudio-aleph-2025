// Types
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates that the request body exists and is an object
 * @param body - The request body to validate
 * @returns Array of validation errors
 */
export const validateRequestBody = (body: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!body) {
    errors.push({
      field: "body",
      message: "Request body is required",
    });
  }

  if (body && typeof body !== "object") {
    errors.push({
      field: "body",
      message: "Request body must be an object",
    });
  }

  return errors;
};

export const validateChatWithTomasRequest = (body: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  // first check if body exists
  const bodyErrors = validateRequestBody(body);
  if (bodyErrors.length > 0) {
    return bodyErrors;
  }

  // caseId is optional - if provided, it must be a string
  if (body.caseId && typeof body.caseId !== "string") {
    errors.push({
      field: "caseId",
      message: "caseId must be a string",
    });
  }

  // userAddress is optional - if provided, it must be a string
  if (body.userAddress && typeof body.userAddress !== "string") {
    errors.push({
      field: "userAddress",
      message: "userAddress is required",
    });
  }

  // message is required
  if (!body.message) {
    errors.push({
      field: "message",
      message: "message is required",
    });
  }

  if (body.message && typeof body.message !== "string") {
    errors.push({
      field: "message",
      message: "message must be a string",
    });
  }

  if (body.message && body.message.trim().length === 0) {
    errors.push({
      field: "message",
      message: "message cannot be empty",
    });
  }

  return errors;
};
