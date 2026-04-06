import { supabaseAdmin } from "@/lib/supabase/clients/supabaseAdmin";
import { consoleLog } from "@/lib/utils";
import { CreateProductVars } from "@/lib/db/products/types/CreateProductVars";

export async function createNewProduct(vars: CreateProductVars) {
  consoleLog("🔔🔆 DB Handler Starts (lib/db/products/createNewProduct)");
  consoleLog("🔔 vars: CreateProductVars ", vars);

  const {
    creatorId,
    title,
    slug,
    categoryId,
    description,
    licenses,
    fileMetadata,
    downLink,
    thumbnailUrl,
  } = vars;

  try {
    
    // 2️⃣ Call transactional RPC to create product, files, and licenses
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc(
      "create_new_product_tsx",
      {
        p_creator_id: creatorId,
        p_category_id: categoryId,
        p_title: title,
        p_description: description ?? null,
        p_thumbnail_url: thumbnailUrl,

        // product_files
        p_file_type: fileMetadata?.mimeType,        // type e.g., '3d', 'image', 'video'
        p_down_link: downLink,
        p_tmp_down_link: null,
        p_tmp_down_link_exp_at: null,
        p_software: null,

        // Google Drive metadata
        p_googlemeta_id: fileMetadata?.id,
        p_googlemeta_name: fileMetadata?.name,
        p_googlemeta_mime_type: fileMetadata?.mimeType,
        p_googlemeta_size: Number(fileMetadata?.size) || null,
        p_googlemeta_icon_link: fileMetadata?.iconLink ?? null,
        p_googlemeta_created_time: fileMetadata?.createdTime
          ? new Date(fileMetadata?.createdTime)
          : null,
        p_googlemeta_modified_time: fileMetadata?.modifiedTime
          ? new Date(fileMetadata.modifiedTime)
          : null,
        p_googlemeta_md5: fileMetadata?.md5Checksum ?? null,

        // licenses
        p_licenses: JSON.stringify(
          licenses?.map((lic) => ({
            license_type: lic.typeId,
            price_cents: Math.round(lic.price * 100),
            currency: "USD",
            is_main: lic.isMain,
          }))
        ),
      }
    );

    consoleLog("rpcData: ", rpcData)
    consoleLog("rpcError: ", rpcError)

    if (rpcError) {
      consoleLog("💥 DB Exception - RPC Error");
      consoleLog("❌ ", rpcError);
      throw new Error(rpcError?.message || "Transaction failed");
    }

  
    if (!rpcData || !rpcData[0]?.product_id) {
      console.error("❌ RPC succeeded but no product_id returned", rpcData);
      throw new Error("Product creation failed");
    }

    const productId = rpcData[0].product_id;

    return {
      data: {
        id: productId,
        thumbnailUrl,
      },
    };
  } catch (err: any) {
    consoleLog("💥 Exception - createProduct", err);
    return { error: err.message || "Unexpected server error" };
  }
}
