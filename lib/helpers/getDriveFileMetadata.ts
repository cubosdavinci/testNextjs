// lib/utils/getDriveFileMetadata.ts
import { GoogleDriveMetadata } from "@/lib/db/products/types/GoogleDriveMetadata" 
import { GoogleApiError } from "@/types/error";
import { prettySize } from "./prettySize";

export async function getDriveFileMetadata(fileId: string): Promise<GoogleDriveMetadata> {

  const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GOOGLE_API_KEY in environment variables");
  }

  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,iconLink,createdTime,modifiedTime,md5Checksum&key=${apiKey}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new GoogleApiError(
      `Failed to fetch file metadata with status ${res.status}: ${res.statusText}`,
      res.status
    );
  }

  const data = await res.json() as GoogleDriveMetadata;

  // Compute helper fields
  const formattedSize = prettySize(Number(data.size));
  const createdTimeFormatted = data.createdTime ? new Date(data.createdTime).toLocaleString() : undefined;
  const modifiedTimeFormatted = data.modifiedTime ? new Date(data.modifiedTime).toLocaleString() : undefined;

  return {
    ...data,
    hasMd5Checksum: !!data.md5Checksum,
    extSize: formattedSize,
    createdTimeFormatted,
    modifiedTimeFormatted,
  };
}
