// lib/db/services/ProductFilesManager.ts
"server-only"
import { supabaseAdmin } from "@/lib/supabase/clients/supabaseAdmin";
import { cacheProviders } from "../storage/providers/cacheProviders";
import { consoleLog } from "@/lib/utils";
import type { FileCacheSyncResult, ProductFileToCacheInput } from "@/lib/supabase/types";

export class ProductFilesManager {
    constructor(
        private supabase = supabaseAdmin(),
        private providers = cacheProviders
    ) { }

    async uploadProductFilesToCache(productId: string) {
        const { data: fetchFiles, error: fetchError } = await this.supabase
            .from("product_files")
            .select("id,file_id,linked_account_id,file_name,file_type,provider")
            .eq("product_id", productId)
            .is("file_cache_id", null);

        const files = fetchFiles as ProductFileToCacheInput[] | null;

        if (fetchError) {
            consoleLog("❌ Failed to fetch not cached product files", fetchError);
            throw fetchError;
        }

        for (const file of files ?? []) {
            try {
                const provider = this.providers[file.provider];

                if (!provider) {
                    consoleLog(
                        `❌ No provider found for file ${file.file_id} (${file.file_name})`,
                        file.provider
                    );
                    continue;
                }

                // 1. Upload file to storage (external I/O)
                const result = await provider.uploadToCache(file);

                // 2. Single atomic DB operation via RPC
                const { data, error } = await this.supabase.rpc(
                    "rpc_create_external_file_cache",
                    {
                        p_product_file_id: file.id,
                        p_provider: file.provider,
                        p_provider_file_id: file.file_id,
                        p_storage_path: result.path,
                        p_storage_url: result.url,
                        p_file_name: file.file_name,
                        p_mime_type: file.file_type,
                        p_size_bytes: file.file_size ?? null,
                    }
                );

                if (error) {
                    consoleLog(
                        `❌ RPC failed (rpc_create_external_file_cache) for file ${file.file_id} (${file.file_name})`,                        error
                    );
                    continue;
                }

            } catch (err) {
                consoleLog(
                    `🔥 Catched error in uploadProductFilesToCache for file ${file.file_id} (${file.file_name})`,
                    err
                );
                continue;
            }
        }
    }

    async syncProductFilesToCache(
        productId: string,
        forceUpload = false
    ): Promise<FileCacheSyncResult[]> {

        const results: FileCacheSyncResult[] = [];

        const { data: fetchFiles, error: fetchError } = await this.supabase
            .from("product_files")
            .select(`
            id,
            file_id,
            linked_account_id,
            file_name,
            file_type,
            file_size,
            provider,
            file_cache_id
        `)
            .eq("product_id", productId);

        if (fetchError) {
            consoleLog("❌ Failed to fetch product files", fetchError);
            throw fetchError;
        }

        for (const file of fetchFiles ?? []) {
            try {
                const alreadyCached = !!file.file_cache_id;

                // ✅ Skip cached unless forced
                if (alreadyCached && !forceUpload) {
                    results.push({
                        productFileId: file.id,
                        provider_file_id: file.file_id,
                        storage_path: "",
                        storage_url: "",
                        externalFileCacheId: file.file_cache_id ?? "",
                        status: "skipped",
                    });

                    continue;
                }

                const provider = this.providers[file.provider];

                if (!provider) {
                    consoleLog(
                        `❌ No provider found for file ${file.file_id} (${file.file_name})`,
                        file.provider
                    );

                    results.push({
                        productFileId: file.id,
                        provider_file_id: file.file_id,
                        storage_path: "",
                        storage_url: "",
                        externalFileCacheId: "",
                        status: "failed",
                        error: `Provider not found: ${file.provider}`,
                    });

                    continue;
                }

                // 1. Upload to storage provider
                const uploadResult = await provider.uploadToCache(file);

                // 2. Atomic DB insert via RPC
                const { data: externalFileCacheId, error: rpcError } =
                    await this.supabase.rpc("rpc_create_external_file_cache", {
                        p_product_file_id: file.id,
                        p_provider: file.provider,
                        p_provider_file_id: file.file_id,
                        p_storage_path: uploadResult.path,
                        p_storage_url: uploadResult.url,
                        p_file_name: file.file_name,
                        p_mime_type: file.file_type,
                        p_size_bytes: file.file_size ?? null,
                    });

                if (rpcError) {
                    consoleLog(
                        `❌ RPC failed for file ${file.file_id} (${file.file_name})`,
                        rpcError
                    );

                    results.push({
                        productFileId: file.id,
                        provider_file_id: file.file_id,
                        storage_path: uploadResult.path,
                        storage_url: uploadResult.url,
                        externalFileCacheId: "",
                        status: "failed",
                        error: "RPC failed",
                    });

                    continue;
                }

                // 3. Success
                results.push({
                    productFileId: file.id,
                    provider_file_id: file.file_id,
                    storage_path: uploadResult.path,
                    storage_url: uploadResult.url,
                    externalFileCacheId,
                    status: "uploaded",
                });

            } catch (err) {
                consoleLog(
                    `🔥 Error syncing file ${file.file_id} (${file.file_name})`,
                    err
                );

                results.push({
                    productFileId: file.id,
                    provider_file_id: file.file_id,
                    storage_path: "",
                    storage_url: "",
                    externalFileCacheId: "",
                    status: "failed",
                    error: err instanceof Error ? err.message : "Unknown error",
                });
            }
        }

        return results;
    }
}