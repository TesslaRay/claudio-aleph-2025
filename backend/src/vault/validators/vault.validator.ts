import { Context } from "hono";

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates the userId query parameter for vault endpoints
 * @param userId - The userId to validate (can be undefined)
 * @returns Array of validation errors
 */
export const validateUserAddressFormat = (
  userAddress: string | undefined
): string[] => {
  const errors: string[] = [];

  if (!userAddress) {
    errors.push("userAddress query parameter is required in params");
    return errors;
  }

  // Validate userAddress format - can be any string for now
  if (typeof userAddress !== "string" || userAddress.trim().length === 0) {
    errors.push("userAddress must be a non-empty string");
  }

  return errors;
};

/**
 * Validates userId from query parameters and returns error response if validation fails
 * @param c - Hono context
 * @param userAddress - The userAddress to validate from query params
 * @returns Object with isValid flag and validated userId or error response
 */
export const validateUserAddressInQueryParams = (
  c: Context,
  userAddress: string | undefined
):
  | { isValid: true; userAddress: string }
  | { isValid: false; response: Response } => {
  const validationErrors = validateUserAddressFormat(userAddress);

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
          userAddress,
        },
        400
      ),
    };
  }

  // At this point, userAddress is guaranteed to be defined and valid
  return {
    isValid: true,
    userAddress: userAddress as string,
  };
};
