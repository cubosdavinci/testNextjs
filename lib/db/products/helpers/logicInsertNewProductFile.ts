// lib/db/products/helpers/logicInsertNewProduct.ts
// types
import { CreateProductFileVars } from "../types/CreateProductFileVars";
// functions
import { consoleLog } from "@/lib/utils";
import { createProductFileValidation } from "../createProductFileValidation";
import { fetchMetadataFromDownloadLink } from "./fetchMetadataFromDownloadLink";
import { insertNewProductFile } from "../insertNewProductFile";

export async function logicInsertNewProductFile(vars: CreateProductFileVars) {
    consoleLog("🔔 🔆 DB Handler Starts (lib/db/products/helpers/logicInsertNewProductFile.ts)");
    consoleLog("🔔 vars(CreateProductVars) ", vars);

    // ✅ Server-side validation using Zod (lib/db/createProductValidation)
    const validatedVars = createProductFileValidation(vars);

    // ✅ Fetch downloadLink metadata from Google Drive 
    validatedVars.fileMetadata = await fetchMetadataFromDownloadLink(validatedVars.downloadLink);
    
    return await insertNewProductFile(validatedVars);
}
