// lib/db/products/createProductValidation.ts
import { consoleLog } from "@/lib/utils";
// zod validators
import { z } from "zod";
import { titleSchema } from "@/lib/zod/titleSchema";
import { validateGoogleDriveLink } from "@/lib/validate/products/validateGoogleDriveLink";
import { uuidSchema } from "@/lib/zod/uuidSchema";
// inputs type
import { CreateProductFileVars } from "./types/CreateProductFileVars";

/**
 * Zod schema for CreateProductFileVars
 */
export const CreateProductFileVarsSchema = z.object({
  productId: uuidSchema,
  downloadLink: validateGoogleDriveLink,
  software: titleSchema(1,50) || undefined,
  fileMetadata: z.any(),
});

/**
 * Server-side validation createProductFileValidation
 */
export function createProductFileValidation(vars: CreateProductFileVars) {
  consoleLog("🔔 🔆 Validator createProductFileValidation Starts (lib/db/products/createProductFileValidation.ts)");
  
  const validatedVars: CreateProductFileVars = CreateProductFileVarsSchema.parse(vars);
  return validatedVars;
}
