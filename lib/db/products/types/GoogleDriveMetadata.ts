// lib/db/products/types/GoogleDriveMetadata.ts
export interface GoogleDriveMetadata {
  id: string;
  name: string;
  mimeType: string;
  size: string;             // original API value as string
  iconLink?: string;
  createdTime: string;
  modifiedTime: string;
  md5Checksum?: string;
  hasMd5Checksum: boolean;  // computed
  extSize: string;           // formatted size with prettySize
  createdTimeFormatted?: string;  // computed
  modifiedTimeFormatted?: string; // computed
}
