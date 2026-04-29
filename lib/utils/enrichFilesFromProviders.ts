"use only-server";

import { providerRegistry } from "@/lib/db/storage/providers/providerRegistry";
import { ProductFileClientInput, ProductFileCreateInput } from "../supabase/types";
import { GoogleAuthService } from "../services/google/GoogleAuthService";
import { consoleLog } from "../utils";

export async function enrichFilesFromProviders(
    files: ProductFileClientInput[]
): Promise<ProductFileCreateInput[]> {

    const authService = new GoogleAuthService();

    // Cache tokens per account (IMPORTANT OPTIMIZATION)
    const tokensCache = new Map<string, string>();

    return await Promise.all(
        files.map(async (file) => {
            const provider = providerRegistry[file.provider];

            if (!provider) {
                throw new Error(`Unsupported provider: ${file.provider}`);
            }

            // -----------------------------
            // 🔐 Resolve & cache token
            // -----------------------------
            let accessToken = tokensCache.get(file.linked_account_id);
            consoleLog("Linked Account Id: ", file.linked_account_id)

            if (!accessToken) {
                accessToken = await authService.getValidAccessToken(
                    file.linked_account_id
                );

                tokensCache.set(file.linked_account_id, accessToken);
            }

            // -----------------------------
            // 📦 Fetch metadata
            // -----------------------------
            const metadata = await provider.getFileMetadata(
                file.file_id,
                accessToken // 👈 now passing token instead of accountId
            );

            // -----------------------------
            // 🧾 Build DB object
            // -----------------------------
            return {
                provider: file.provider,
                file_id: metadata.id,
                provider_metadata: metadata,
                file_name: metadata.name,
                file_size: Number(metadata.size || 0),
                file_type: metadata.mimeType,
                linked_account_id: file.linked_account_id,
                file_checksum: metadata.checksum,
                file_hash: metadata.hash,                                
            } satisfies ProductFileCreateInput;
        })
    );
}