// lib/supabase/products/UpdateProduct.ts
import { supabaseClient } from "@/lib/supabase/clients/supabaseAdmin";
import { consoleLog } from "@/lib/utils";
import { UploadFile } from "../storage/updateFile";


interface UpdateProductVars {
  productId: string;
  title?: string;
  categoryId?: number | null;
  description?: string | null;
  thumbnailFile?: File | null; // new file
  previousThumbnailUrl?: string | null; // previous URL to delete if replaced
}

export async function UpdateProduct(vars: UpdateProductVars & { creatorId: string }) {
  const { productId, title, categoryId, description, thumbnailFile, previousThumbnailUrl, creatorId } = vars;

  consoleLog("UpdateProduct vars:", [vars]);

  if (!productId) {
    return { error: "productId is required" };
  }

  try {
    // 1️⃣ Handle thumbnail using UploadFile helper
    let uploadedThumbnailUrl = previousThumbnailUrl ?? null;
    if (thumbnailFile) {
      const { url, error } = await UploadFile(thumbnailFile, previousThumbnailUrl ?? undefined, "images-store");
      if (error) return { error: `Thumbnail upload failed: ${error}` };
      uploadedThumbnailUrl = url ?? null;
    }

    // 2️⃣ Update product in DB
    const { data: updatedProduct, error: updateError } = await supabaseClient
      .from("products")
      .update({
        name: title,
        category_id: categoryId ?? null,
        description: description ?? null,
        thumbnail_url: uploadedThumbnailUrl,
      })
      .eq("id", productId)
      .eq("creator_id", creatorId)
      .select()
      .single();

    if (updateError || !updatedProduct) {
      console.error("❌ Failed to update product:", updateError?.message);
      return { error: updateError?.message || "Failed to update product" };
    }

    consoleLog("✅ Product updated successfully:", [productId]);

    return {
      data: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        thumbnailUrl: updatedProduct.thumbnail_url,
      },
    };
  } catch (err: any) {
    console.error("❌ Unexpected error in UpdateProduct:", err.message);
    return { error: err.message || "Unexpected error updating product" };
  }
}
