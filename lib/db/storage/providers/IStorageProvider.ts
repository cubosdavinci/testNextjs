import type { ProductFileToCacheInput, UploadToStorageOutput } from "@/lib/supabase/types";

export interface IStorageProvider<TMetadata = unknown> {
    uploadToCache(file: ProductFileToCacheInput): Promise<UploadToStorageOutput>;

    getFileMetadata(
        fileId: string,
        linkedAccountId: string
    ): Promise<TMetadata>;
}