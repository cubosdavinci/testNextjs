import { STORAGE_PROVIDER } from "@/types/db/product-files/StorageProvider";
import { GoogleDriveProvider } from "./google-drive/GoogleDriveProvider";

export const providerRegistry = {
    [STORAGE_PROVIDER.GoogleDrive]: new GoogleDriveProvider(),
    [STORAGE_PROVIDER.OneDrive]: null,
    [STORAGE_PROVIDER.Dropbox]: null,
    [STORAGE_PROVIDER.Box]: null,
    [STORAGE_PROVIDER.S3]: null,
};