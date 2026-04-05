// lib/db/products/createProductValidation.ts
import { consoleLog } from "@/lib/utils";
// zod validators
import { z } from "zod";
import { uuidSchema } from "@/lib/zod/uuidSchema";
import { licenseSchema } from "@/lib/zod/licenses/licenseSchema";
// inputs type
import { MembershipEnum } from "@/lib/enum/MembershipEnum";
import { CreateProductLicenseVars } from "./types/CreateProductLicenseVars";
import { RegionEnum } from "../licenses/types/enums/RegionEnum";

/**
 * Zod schema for CreateProductFileVars
 */
export const CreateProductLicensesVarsSchema = (membership: MembershipEnum = MembershipEnum.Free, userRegion: RegionEnum = RegionEnum.UnitedStates) => z.object({
  fileId: uuidSchema,
  licenses: z.array(licenseSchema(membership, userRegion)),
});

/**
 * Validates the input for creating product licenses.
 *
 * @param vars - Object containing `fileId` and `licenses` array.
 * @param membership - Membership type to determine license price rules (default: Free).
 * @returns Validated `CreateProductLicenseVars`.
 * @throws ZodError if validation fails.
 */
export function createProductLicensesValidation(vars: CreateProductLicenseVars, membership: MembershipEnum = MembershipEnum.Free, userRegion: RegionEnum = RegionEnum.UnitedStates) {
  consoleLog("🔔 🔆 Validator createProductLicensesValidation Starts (lib/db/products/createProductLicensesValidation.ts)");
  
  // Pass the actual membership value (e.g., MembershipEnum.Free) instead of the incorrect syntax
  const validatedVars = CreateProductLicensesVarsSchema(membership, userRegion).parse(vars);
  return validatedVars;
}

