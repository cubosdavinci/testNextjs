// lib/db/products/createProductValidation.ts
import {CreateProductVars} from "@/lib/db/products/types/CreateProductVars";

import { z } from "zod";
import { validateGenericTitle } from "@/lib/zod/titleSchema";
import { validateGoogleDriveLink } from "@/lib/validate/products/validateGoogleDriveLink";
//import { LicenseSchema } from "@/lib/validate/products/license";
//import { GoogleDriveMetadataSchema } from "@/lib/validate/products/googleDriveMetadata";
import { ProdType } from "@/types/db/products";

export const CreateProductVarsSchema = z.object({
  creatorId: z.string().uuid({ message: "creatorId must be a valid UUID" }),
  title: validateGenericTitle,         // reuse existing schema
  productType: z.nativeEnum(ProdType),
  slug: z.string().min(1, { message: "Slug is required" }),
  categoryId: z.union([z.string(), z.number()]).nullable(),
  description: z.string().optional(),
  downLink: validateGoogleDriveLink,
  //licenses: z.array(LicenseSchema),     // reuse license schema
  //fileMetadata: GoogleDriveMetadataSchema, // reuse GoogleDriveMetadata schema
  thumbnailFile: z.any().optional().nullable(), // optional File
});



export function createProductValidation(vars: CreateProductVars) {
  try {
    return CreateProductVarsSchema.parse(vars);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      // You can pick the first error, or return all
      const message = err.issues.map(i => i.message).join("; ");
      throw new Error(`Validation failed: ${message}`);
    }
    throw err;
  }
}
