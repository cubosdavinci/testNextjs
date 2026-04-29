// lib/db/storage/providers/providerRegistry.ts
import { STORAGE_PROVIDER, StorageProvider } from "@/types/db/product-files/StorageProvider";
import { NormalizedFileMetadata } from "./google-drive/GoogleDriveProvider";
type Provider = IStorageProvider<NormalizedFileMetadata> | null;

import { GoogleDriveProvider } from "./google-drive/GoogleDriveProvider";
import { IStorageProvider } from "./IStorageProvider";

export const providerRegistry: Record<StorageProvider, Provider> = {
    [STORAGE_PROVIDER.GoogleDrive]: new GoogleDriveProvider(),
    [STORAGE_PROVIDER.OneDrive]: null,
    [STORAGE_PROVIDER.Dropbox]: null,
    [STORAGE_PROVIDER.Box]: null,
    [STORAGE_PROVIDER.S3]: null,
};