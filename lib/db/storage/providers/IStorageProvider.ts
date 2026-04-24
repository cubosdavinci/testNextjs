import type { ProductFileToCacheInput, UploadToStorageOutput } from "@/lib/supabase/types";

export interface IStorageProvider {
    uploadToCache(file: ProductFileToCacheInput): Promise<UploadToStorageOutput>;
}