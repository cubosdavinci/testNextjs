import type { ProductFileToCacheInput, UploadToStorageOutput } from "@/lib/supabase/types";

export interface IStorageProviderHandler {
    uploadToCache(file: ProductFileToCacheInput): Promise<UploadToStorageOutput>;
}