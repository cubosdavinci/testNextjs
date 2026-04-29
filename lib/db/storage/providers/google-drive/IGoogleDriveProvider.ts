import { IStorageProvider } from "../IStorageProvider";

export interface IGoogleDriveProvider extends IStorageProvider {
    getFileMetadata(fileId: string, accessToken: string): Promise<unknown>;
}