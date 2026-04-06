// lib/supabase/products/DeleteProduct.ts
import { supabaseClient } from "@/lib/supabase/clients/supabaseAdmin";
import { consoleLog } from "@/lib/utils";

interface DeleteProductVars {
  productId: string;
  creatorId: string; // ✅ matches route.ts
}

/**
 * Deletes a product only if it belongs to the specified creator.
 * Ensures product.creator_id must match creatorId.
 */
export async function DeleteProduct({ productId, creatorId }: DeleteProductVars) {
  consoleLog("DeleteProduct vars:", [productId, creatorId]);

  if (!productId) {
    return { error: "productId is required" };
  }

  try {
    const { error } = await supabaseClient
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("creator_id", creatorId); // ✅ ownership check

    if (error) {
      console.error("❌ Error deleting product:", error.message);
      return { error: error.message };
    }

    consoleLog("✅ Product deleted successfully:", [productId]);
    return { success: true };
  } catch (err: any) {
    console.error("❌ Unexpected error in DeleteProduct:", err.message);
    return { error: err.message || "Unexpected error deleting product" };
  }
}
