import { IStorageProvider } from "../IStorageProvider";

export interface IGoogleDriveProvider extends IStorageProvider {
    getFileMetadata(fileId: string, linkedAccountId: string): Promise<unknown>;
}