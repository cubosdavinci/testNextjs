// lib/db/products/helpers/buildProductFiles.ts
import type {
    ProductFileClientInput,
    ProductFileCreateInput,
} from "@/lib/supabase/types";

import { providerRegistry } from "@/lib/db/storage/providers/providerRegistry";

export async function buildProductFiles(
    files: ProductFileClientInput[]
): Promise<ProductFileCreateInput[]> {
    const results: ProductFileCreateInput[] = [];

    for (const file of files) {
        const provider = providerRegistry[file.provider];

        if (!provider) {
            throw new Error(
                `Unsupported provider: ${file.provider}`
            );
        }

        const metadata = await provider.getFileMetadata(
            file.file_id,
            file.linked_account_id
        );

        if (!metadata) {
            throw new Error(
                `Missing metadata for file ${file.file_name}`
            );
        }

        results.push({
            file_id: file.file_id,
            linked_account_id: file.linked_account_id,
            provider: file.provider,

            file_name: metadata.name,
            file_type: metadata.mimeType,
            file_size: metadata.size ? Number(metadata.size) : 0,
            file_checksum: metadata.md5Checksum ?? "not available",
            provider_metadata: metadata,
            provider_user_name:
                metadata?.owners?.[0]?.displayName || null,
        });
    }

    return results;
}