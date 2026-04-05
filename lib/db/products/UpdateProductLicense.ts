// lib/supabase/products/UpdateProductLicense.ts
import { supabaseClient } from "@/lib/clients/supabaseAdmin";
import { consoleLog } from "@/lib/utils";

interface UpdateProductLicenseVars {
  licenseId: string;
  creatorId: string; // owner of the product
  priceCents?: number;   // in USD, decimal
  isMain?: boolean;
}

export async function UpdateProductLicense(vars: UpdateProductLicenseVars) {
  const { licenseId, creatorId, priceCents, isMain } = vars;

  console.log("Variables", vars)
  // Build update object
  const updateData: any = {};
  if (priceCents !== undefined) updateData.price_cents = priceCents;
  if (isMain !== undefined) updateData.is_main = isMain === true;

  if (Object.keys(updateData).length === 0) {
    return { error: "No fields to update" };
  }

  // ✅ Single query: only updates if creator_id matches
  const { data, error } = await supabaseClient
    .from("product_licenses")
    .update(updateData)
    .eq("id", licenseId)
    .eq("creator_id", creatorId)
    .select()
    .single();

  if (error) return { error: error.message };
  if (!data) return { error: "License not found or not authorized" };

  return { data };
}
