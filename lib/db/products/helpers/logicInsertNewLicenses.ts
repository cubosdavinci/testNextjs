// lib/db/products/helpers/logicInsertNewProduct.ts
// types
import { CreateProductLicenseVars } from "../types/CreateProductLicenseVars";
// functions
import { consoleLog } from "@/lib/utils";
import { insertNewLicenses } from "../insertNewLicenses";
import { createProductLicensesValidation } from "../createProductLicensesValidation";
import { MembershipEnum } from "@/lib/enum/MembershipEnum";
import { RegionEnum } from "../../licenses/types/enums/RegionEnum";

export async function logicInsertNewLicenses(vars: CreateProductLicenseVars, membership: MembershipEnum = MembershipEnum.Partner , userRegion: RegionEnum = RegionEnum.UnitedStates) {
    consoleLog("🔔 🔆 DB Handler Starts (lib/db/products/helpers/logicinsertNewLicenses.ts)");
    consoleLog("🔔 vars(CreateProductVars) ", vars);

    // ✅ Server-side validation using Zod (lib/db/createProductValidation)
    const validatedVars = createProductLicensesValidation(vars, membership, userRegion)
    
    return await insertNewLicenses(validatedVars);
}
