import { supabaseAdmin } from "@/lib/clients/supabaseAdmin";

/**
 * Delete a file from Supabase Storage given its public URL
 * @param url - Public URL of the file to delete
 * @param bucket - Optional storage bucket name (default: "images-store")
 * @returns {Promise<{ error?: string }>} - Optional error if deletion fails
 */
export async function deleteFile(url?: string, bucket = "images-store"): Promise<{ error?: string }> {
  try {
    if (!url) return {}; // Nothing to delete

    const urlObj = new URL(url);
    const filePath = urlObj.pathname.replace(/^\/storage\/v1\/object\/public\//, "");

    const { error } = await supabaseAdmin.storage.from(bucket).remove([filePath]);
    if (error) {
      console.error("❌ Failed to delete file:", error.message);
      return { error: error.message };
    }

    console.log("✅ File deleted:", filePath);
    return {};
  } catch (err: any) {
    console.error("❌ Unexpected error deleting file:", err.message);
    return { error: err.message };
  }
}
