// lib/db/products/insertNewProductFile.ts
import { supabaseAdmin } from "@/lib/clients/supabaseAdmin";
import { consoleLog } from "@/lib/utils";
import { CreateProductFileVars } from "@/lib/db/products/types/CreateProductFileVars";

/**
 * Insert a new product file into the database using the given file metadata.
 * 
 * This function inserts a new record into the `next_auth.product_files` table by calling the 
 * stored procedure `tbl_product_files_ins_newproductfile`. It uses the product ID and the 
 * associated Google Drive file metadata provided in the `fileMetadata` parameter.
 * 
 * The required fields in the `fileMetadata` include:
 * - mimeType: The MIME type of the file (e.g., 'image/jpeg', 'application/pdf')
 * - id: The Google Drive file ID (used as both the download link and metadata ID)
 * - name: The file name
 * - size: The file size (as a string)
 * - iconLink: (Optional) The file's icon link (if available)
 * - createdTime: (Optional) The time the file was created (if available)
 * - modifiedTime: (Optional) The time the file was last modified (if available)
 * - md5Checksum: (Optional) The file's MD5 checksum (if available)
 * 
 * If any required fields are missing or an error occurs, it throws an error.
 * 
 * The function returns the new product file ID if the insertion is successful:
 * data.id
 * @param vars The variables containing the product ID and Google Drive file metadata
 * @returns {object} An object containing the newly inserted product file ID (`data.id`) or an error message if the insertion fails.
 */
 
export async function insertNewProductFile(vars: CreateProductFileVars) {
  consoleLog("🔔 🔆 DB Handler Starts (lib/db/products/insertNewProductFile.ts)");
  consoleLog("🔔 🔍 vars(CreateProductFileVars) ", vars);

  const { productId, downloadLink, software, fileMetadata } = vars;

  try {
    // Ensure all necessary fields are present
    if (!productId || !fileMetadata) {
      throw new Error("Missing productId or fileMetadata");
    }

    consoleLog("🔔 RPC Call: next_auth.tbl_product_files_ins_newproductfile");

    // Call the stored procedure with the necessary parameters
    const { data, error } = await supabaseAdmin.rpc(
      "tbl_product_files_ins_newproductfile", 
      {
        p_product_id: productId,
        p_down_link: downloadLink,     
        p_software: software,
        p_googlemeta_id: fileMetadata.id,
        p_googlemeta_name: fileMetadata.name,
        p_googlemeta_mime_type: fileMetadata.mimeType,
        p_googlemeta_size: fileMetadata.size,  // The size as a string, will need to be handled in DB
        p_googlemeta_icon_link: fileMetadata.iconLink ?? null,        
        p_googlemeta_md5: fileMetadata.md5Checksum ?? null,
        p_googlemeta_created_time: fileMetadata.createdTime,
        p_googlemeta_modified_time: fileMetadata.modifiedTime,
        p_googlemeta_ext_size: fileMetadata.extSize
      }
    );

    if (error) {
      consoleLog("🔥 ❌ RPC Error", error);
      throw new Error("Insertion of Product File failed. Try Again Later");
    }

    if (!data || data.length === 0) {
      consoleLog("🔥 ❌ RPC Data Error", data);
      throw new Error("Data corrupted: no ID returned");
    }

    consoleLog("🔔 🔍 RPC returned data", data);
    consoleLog("🔔 🔆 DB Handler Ends (lib/db/products/insertNewProductFile.ts)");
    return data

    /*return {
      data: {
        id: data[0], // assuming `data` contains the new product file ID
      },
    };*/
  } catch (err: any) {
    consoleLog("🔥 ❌ Server Error at (lib/db/products/insertNewProductFile.ts)");
    consoleLog("🔥 ❌ Catched Error", err);
    return { error: err.message || "Unexpected server error" };
  }
}
