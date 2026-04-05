// lib/validate/products/version.ts
import { z } from "zod";

// Regex for validating version numbers like 1.0.0, 1.01, 0.1, etc.
const versionRegex = /^\d+(\.\d+)*$/; // Matches versions like 1.0.0, 1.1, 2.3.4

export const validateProductVersion = z.preprocess(
  (val) => (typeof val === "string" ? val.trim() : val), // Trim the string if it's a valid string
  z
    .string()
    .min(1, { message: "Version is required" }) // Make sure it's not empty
    .refine((val) => versionRegex.test(val), {
      message: "Version must consist of digits and dots only (e.g., 1.0.0)",
    })
);