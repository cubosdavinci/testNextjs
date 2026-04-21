import { GoogleDriveProvider } from "./GoogleDriveProvider";
import { IStorageProviderHandler } from "./IStorageProviderHandler";

export const cacheProviders: Record<string, IStorageProviderHandler> = {
    google_drive: new GoogleDriveProvider(),
};

/*
const provider = providers[file.provider];

if (!provider) {
  throw new Error(`Unsupported provider: ${file.provider}`);
}

const uploadResult = await provider.uploadToCache(file);

*/