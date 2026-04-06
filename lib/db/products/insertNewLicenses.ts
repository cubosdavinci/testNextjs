// lib/db/products/insertNewProductFile.ts
import { supabaseAdmin } from "@/lib/supabase/clients/supabaseAdmin";
import { consoleLog } from "@/lib/utils";
import { CreateProductLicenseVars } from "./types/CreateProductLicenseVars";
import { License } from "../licenses/types/License";
import { file } from "zod";

 
export async function insertNewLicenses(vars: CreateProductLicenseVars) {
  consoleLog("🔔 🔆 DB Handler Starts (lib/db/products/insertNewLicenses.ts)");
  consoleLog("🔔 🔍 vars(CreateProductLicenseVars) ", vars);
  
  const {fileId, licenses} = vars;

  try {
    // Ensure all necessary fields are present
    if (!fileId || !licenses || licenses.length === 0) {
      throw new Error("Missing fileId or licenses");
    }

    consoleLog("🔔 RPC Call: next_auth.tbl_product_licenses_ins_newlicenses");

    // Call the stored procedure with the necessary parameters
    const { data, error } = await supabaseAdmin.rpc(
      "tbl_product_licenses_ins_newlicenses_batch", 
      {
        p_file_id: fileId,
        p_licenses: licenses,
      }
    );

    if (error) {
      consoleLog("🔥 ❌ RPC Error", error);
      throw new Error("Insertion of product licenses failed");
    }

    if (!data || data.length === 0) {
      consoleLog("🔥 ❌ RPC Data Error", data);
      throw new Error("Data corrupted: no ID returned");
    }

    consoleLog("🔔 🔍 RPC returned data", data);
    consoleLog("🔔 🔆 DB Handler Ends (lib/db/products/insertNewLicenses.ts)");
    return data

    /*return {
      data: {
        id: data[0], // assuming `data` contains the new product file ID
      },
    };*/
  } catch (err: any) {
    consoleLog("🔥 ❌ Server Error at (lib/db/products/insertNewLicenses.ts)");
    consoleLog("🔥 ❌ Catched Error", err);
    return { error: {message: err.message || "Unexpected server error"} }
  }
}
