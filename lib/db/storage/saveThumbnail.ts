// lib/db/storage/saveThumbnail.ts
import { UploadFile } from "@/lib/db/storage/updateFile";
import { consoleLog } from "@/lib/utils";
import { validateSupabaseStorageLink } from "@/lib/validate/products/validateSupabaseStorageLink";

export const DEFAULT_THUMBNAIL_URL =
  "https://gzjluxccvxvjfywbwonv.supabase.co/storage/v1/object/public/images-store/gotit-new-product.jpg";

export async function saveThumbnail(file: File, fileName: string): Promise<string> {
  consoleLog("🔔 🔆 DB Handler Starts (lib/db/products/helpers/saveThumbnail.ts)");

  if (!file) return DEFAULT_THUMBNAIL_URL;

  // Upload file
  const { url } = await UploadFile(file, fileName);


  if (!url || url.trim() === "") {
    throw new Error("❌ Upload succeeded but returned URL is empty.");
  }

  consoleLog("🔔 🔆 DB Handler Ends (lib/db/products/helpers/saveThumbnail.ts)");
  return validateSupabaseStorageLink.parse(url.trim());
}
