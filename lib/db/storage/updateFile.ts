// yogi3/lib/db/storage/updateFile.ts
import { supabaseAdmin } from "@/lib/supabase/clients/supabaseAdmin";
import { deleteFile } from "./deleteFile";
import { consoleLog } from "@/lib/utils";

/**
 * Upload a file to Supabase Storage, optionally deleting a previous file
 * @param file - File to upload
 * @param fileName - Optional custom file name to use for upload
 * @param oldUrl - Optional previous file URL to delete
 * @param bucket - Optional storage bucket name (default: "images-store")
 * @returns {Promise<{ url?: string; error?: string }>} - New public URL of uploaded file
 */
export async function UploadFile(
  file: File,
  fileName?: string, // fileName is now optional
  oldUrl?: string,
  bucket = "images-store"
): Promise<{ url?: string; error?: string }> {
  consoleLog("🔔 🔆 DB Handler Starts  (lib/db/storage/updateFile.ts)");
  consoleLog("🔔 fileName", fileName);
  consoleLog("🔔 oldUrl", oldUrl);
  consoleLog("🔔 bucket", bucket);

  try {
    if (!file) return { error: "No file provided" };

    // Delete previous file if provided
    if (oldUrl) {
      await deleteFile(oldUrl, bucket);
    }

    const timestamp = Date.now();

    // If a custom fileName is provided, use it; otherwise, fall back to timestamp and file.name
    const finalFileName = fileName ? fileName : `${timestamp}-${file.name}`;

    const filePath = `uploads/${finalFileName}`;

    // Upload the file to Supabase
    const { data: storageData, error:storageError } = await supabaseAdmin.storage.from(bucket).upload(filePath, file);
    consoleLog("storageData Response: ", storageData);  
    consoleLog("storageError Response: ", storageError);  

    if (storageError) {
      consoleLog("🔔 ❌ File upload failed:", storageError.message)
      
      return { error: storageError.message };
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
    const newUrl = publicUrlData.publicUrl;
    
    consoleLog("🔔 ✅ File upladed to: ", newUrl)
    consoleLog("🔔 🔆 DB Handler Ends  (lib/db/storage/updateFile.ts)");
    
    return { url: newUrl };

  } catch (err: any) {
    consoleLog("🔥 ❌ Catched Error (lib/db/storage/updateFile.ts):", err.message)
    consoleLog("🔥🔥🔥 Rethrowing Error");
    throw err;
  }
}
