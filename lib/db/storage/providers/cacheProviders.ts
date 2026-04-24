import { GoogleDriveProvider } from "./google-drive/GoogleDriveProvider";
import { IStorageProvider } from "./IStorageProvider";

export const cacheProviders: Record<string, IStorageProvider> = {
  google_drive: new GoogleDriveProvider(),
};

/*
const provider = providers[file.provider];

if (!provider) {
  throw new Error(`Unsupported provider: ${file.provider}`);
}

const uploadResult = await provider.uploadToCache(file);

*/