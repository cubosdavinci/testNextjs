// lib/validate/products/description.ts
import { z } from "zod";

/**
 * Returns a Zod schema for product description with a flexible max length
 * @param max Maximum number of characters
 */
export const validateProductDescription = (max: number) =>
  z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val), // trim strings
    z
      .string()
      .max(max-1, { message: `Description must be at most ${max} characters` })
      .optional()
  );
