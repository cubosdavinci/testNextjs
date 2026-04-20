

import type { Database } from "@/types/supabase";

export type DbStorageProvider = Database["public"]["Enums"]["storage_provider"];

export const STORAGE_PROVIDER = {
    GoogleDrive: "google_drive",
    OneDrive: "onedrive",
    Dropbox: "dropbox",
    Box: "box",
    S3: "s3",    
} as const satisfies Record<string, DbStorageProvider>;

export type StorageProvider =
    typeof STORAGE_PROVIDER[keyof typeof STORAGE_PROVIDER];