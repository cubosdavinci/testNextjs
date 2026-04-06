// lib/db/products/insertNewProduct.ts
import { supabaseAdmin } from "@/lib/supabase/clients/supabaseAdmin";
import { consoleLog } from "@/lib/utils";
import { CreateProductVars } from "@/lib/db/products/types/CreateProductVars";
//import { ProdType } from "@/types/db/products";
//import { prodTypeToString } from "@/lib/utils/prodTypeToString";

/**
 * Insert a new product into the database using the given product details.
 * 
 * This function is responsible for inserting a new product into the `next_auth.products`
 * table. It uses the stored procedure `tbl_products_ins_newproduct` to insert the product
 * with the provided fields:
 * 
 * - creatorId: ID of the user who created the product
 * - title: Product title
 * - slug: A URL-friendly string identifier for the product
 * - categoryId: ID of the category the product belongs to
 * - description: Product description (optional)
 * - version: Version of the product (optional)
 * - type: Product type (e.g., '3D', 'software')
 * - thumbnailUrl: URL of the product thumbnail image
 * 
 * The function will return the product ID if the insertion is successful.
 * 
 * Error handling is implemented to catch any issues with the RPC call and return
 * an appropriate message.
 * 
 * @param vars The variables object containing the product details
 * @returns An object containing the product ID or an error message if the insertion fails.
 */
export async function insertNewProduct( vars: CreateProductVars) {
  consoleLog("🔔 🔆 DB Handler Starts (lib/db/products/insertNewProduct.ts)");
  const {
    creatorId,
    title,
    slug,
    categoryId,
    description,
    version,
    type,
    thumbnailUrl
  } = vars;

  try {
    consoleLog("🔔 RPC Call: next_auth.tbl_products_ins_newproduct");

    const { data, error } = await supabaseAdmin.rpc("tbl_products_ins_newproduct", {
      p_creator_id: creatorId,
      p_title: title,
      p_slug: slug,
      p_description: description ?? null,
      p_type: type,
      p_category_id: categoryId != null ? Number(categoryId) : 0,
      p_thumbnail_url: thumbnailUrl,
      p_version: version ?? null     
    });

    if (error) {
      consoleLog("🔔 💥 RPC Error", error);
      throw new Error(error.message);
    }


    if (!data) {
      throw new Error("Product creation failed: no ID returned");
    }

    consoleLog("🔔 🔆 DB Handler Ends (lib/db/products/insertNewProduct.ts)");    
    return {
      data: {
        id: data[0],        
      },
    };
  } catch (err: any) {
    consoleLog("🔥 ❌ Server Error at (lib/db/products/insertNewProduct.ts)");
    consoleLog("🔥 ❌ Catched Error", err);
    return { error: err.message || "Unexpected server error" };
  }
}
