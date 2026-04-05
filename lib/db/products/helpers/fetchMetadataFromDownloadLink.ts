// lib/db/products/helpers/fetchMetadataFromdownloadLink.ts
import { consoleLog } from "@/lib/utils";
import { getDriveFileMetadata } from "@/lib/helpers/getDriveFileMetadata";
import { GoogleDriveMetadata } from "@/lib/db/products/types/GoogleDriveMetadata";
import { validateGoogleDriveLink } from "@/lib/validate/products/validateGoogleDriveLink";

export async function fetchMetadataFromDownloadLink(
  downloadLink: string
): Promise<GoogleDriveMetadata> {
  consoleLog("🔔 🔆 Helper fetchMetadataFromdownloadLink Starts (lib/db/products/helpers/fetchMetadataFromDownlink.ts)");

if (!downloadLink) {
  consoleLog("🔥 ❌ Validation error: No download link.");
  throw new Error("File metadata couldn't be fetched. No download link.");
}

  // Extract fileId from Google Drive URL
  const match = downloadLink.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const fileId = match ? match[1] : null;

if (!fileId) {
  consoleLog("🔥 ❌ Validation error: File ID could not be extracted from the download link.");
  throw new Error("File metadata couldn't be fetched. Invalid download link.");
}

  // Fetch metadata using your existing helper
  const fileMetadata = await getDriveFileMetadata(fileId);
  return fileMetadata;
}
