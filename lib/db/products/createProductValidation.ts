// lib/db/products/createProductValidation.ts
import {CreateProductVars} from "@/lib/db/products/types/CreateProductVars";
import { z } from "zod";
import { titleSchema } from "@/lib/zod/titleSchema";
import { validateGoogleDriveLink } from "@/lib/validate/products/validateGoogleDriveLink";
import { LicenseForProductSchema } from "@/lib/validate/products/LicenseForProductSchema";
//import { GoogleDriveMetadataSchema } from "@/lib/validate/products/googleDriveMetadata";
import { ProdType } from "@/types/db/products";
import { consoleLog } from "@/lib/utils";

/**
 * Zod schema for CreateProductVars
 * Reuses existing validation schemas for title, licenses, and Google Drive metadata
 */
export const CreateProductVarsSchema = z.object({
  creatorId: z.string().uuid({ message: "creatorId must be a valid UUID" }),
  title: titleSchema(),                    // reuses title validation
  type: z.nativeEnum(ProdType),           // enum validation
  slug: z.string().min(1, { message: "Slug is required" }),
  categoryId: z.union([ z.number()]).nullable(),
  description: z.string().optional(),
  downLink: validateGoogleDriveLink,             // validated Google Drive link
  //licenses: z.any().optional(),
  licenses: z.array(LicenseForProductSchema).min(1, { message: "At least one license is required" }),   // optional array of licenses
  //fileMetadata: GoogleDriveMetadataSchema,       // validated Google Drive metadata
  thumbnailUrl: z.string().optional(),  // optional File object
  thumbnailFile: z.any().optional()
});

/**
 * Server-side validation helper
 * Throws a detailed error if validation fails
 */
export function createProductValidation(vars: CreateProductVars) {
  consoleLog("createProductValidation Vars:", vars)
  const validatedVars = CreateProductVarsSchema.parse(vars);

  return validatedVars;


  
  /*
  try {
   
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      consoleLog("createProductValidation Error:", err)
      const message = err.issues.map(i => i.message).join("; ");
      throw new Error(`Validation failed: ${message}`);
    }
  }*/
}
