import { supabaseClient } from "@/lib/clients/supabaseAdmin";
import { consoleLog } from "@/lib/utils";
import { CreateProductVars } from  "@/lib/db/products/types/CreateProductVars";
//import { GoogleDriveMetadata } from "./types/GoogleDriveMetadata";

export async function createProduct(vars: CreateProductVars) {
  consoleLog("⚠️ Start - lib/db/products/createProduct.ts");

  const { creatorId, title, categoryId, description, licenses, fileMetadata, downLink, thumbnailFile } = vars;

  try {
    let thumbnailUrl: string | null = null;

    // 1️⃣ Upload thumbnail first (before the transaction)
    if (thumbnailFile) {
      const filePath = `prod-thumb-${Date.now()}-${thumbnailFile.name}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("images-store")
        .upload(filePath, thumbnailFile);

      if (uploadError) {
        consoleLog("💥 DB Exception - lib/db/products/createProduct.ts"); 
        consoleLog("❌ Thumbnail upload error:", uploadError.message);               
        throw new Error(`Thumbnail upload failed: ${uploadError.message}`);
      }

      const { data: thumbData } = supabaseClient.storage
        .from("images-store")
        .getPublicUrl(filePath);

      thumbnailUrl = thumbData.publicUrl;
    }

    // 2️⃣ Call transactional RPC to create product, files, and licenses
    const { data: rpcData, error: rpcError } = await supabaseClient.rpc(
      "create_new_product_tsx",
      {
        p_creator_id: creatorId,
        p_category_id: categoryId,
        p_title: title,
        p_description: description ?? null,
        p_thumbnail_url: thumbnailUrl,
        p_file_id: fileMetadata.id,
        p_file_name: fileMetadata.name,
        p_mime_type: fileMetadata.mimeType,
        p_size: Number(fileMetadata.size),
        p_md5: fileMetadata.md5Checksum ?? null,
        p_licenses: JSON.stringify(
          licenses.map((lic) => ({
            license_type: lic.typeId,
            price_cents: Math.round(lic.price * 100),
            currency: lic.currency ?? "USD",
            is_main: lic.isMain,
          }))
        ),
      }
    );

    if (rpcError || !rpcData?.[0]?.product_id) {
      consoleLog("💥 DB Exception - lib/db/products/createProduct.ts"); 
      consoleLog("❌ RPC Error (create_new_product_tsx):", rpcError?.message);       
      throw new Error(rpcError?.message || "Transaction failed");
      
    }

    const productId = rpcData[0].product_id;

    consoleLog("💥 Exception - lib/db/products/createProduct.ts", err);    
    return {
      data: {
        id: productId,
        thumbnailUrl,
      },
    };
  } catch (err: any) {
    consoleLog("💥 Exception - lib/db/products/createProduct.ts", err);    
    return { error: err.message || "Unexpected server error" };
  }
}
