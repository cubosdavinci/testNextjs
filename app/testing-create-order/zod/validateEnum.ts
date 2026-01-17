import { z } from "zod"

/**
 * Generic enum validator with field-specific errors
 * @param field - field name (for error messages)
 * @param values - allowed enum values (readonly tuple)
 */
export const validateEnum = <
  const T extends readonly [string, ...string[]]
>(
  field: string,
  values: T
) =>
z.enum(values, {
    message: `${field} must be one of: ${values.join(", ")}`,
  })
