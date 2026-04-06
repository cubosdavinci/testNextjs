// lib/supabase/products/DeleteProductLicense.ts
import { supabaseClient } from "@/lib/supabase/clients/supabaseAdmin";
import { consoleLog } from "@/lib/utils";

interface DeleteProductLicenseVars {
  licenseId: string;
  clientId: string;
}

/**
 * Deletes a product license only if it belongs to the specified client.
 * Safe server-side check ensures the creator_id matches the clientId.
 */
export async function DeleteProductLicense({ licenseId, clientId }: DeleteProductLicenseVars) {
  consoleLog("DeleteProductLicense vars:", [ licenseId, clientId ]);

  if (!licenseId) {
    return { error: "licenseId is required" };
  }

  try {
    const { error } = await supabaseClient
      .from("product_licenses")
      .delete()
      .eq("id", licenseId)
      .eq("creator_id", clientId);

    if (error) {
      console.error("❌ Error deleting product license:", error.message);
      return { error: error.message };
    }

    consoleLog("✅ License deleted successfully:", [licenseId]);
    return { success: true };
  } catch (err: any) {
    console.error("❌ Unexpected error in DeleteProductLicense:", err.message);
    return { error: err.message || "Unexpected error deleting license" };
  }
}
