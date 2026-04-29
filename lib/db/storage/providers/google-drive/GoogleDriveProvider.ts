// lib/db/storage/providers/GoogleDriveProvider.ts
import { ProductFileToCacheInput, UploadToStorageOutput } from "@/lib/supabase/types";

import { GoogleAuthService } from "@/lib/services/google/GoogleAuthService";
import { supabaseAdmin } from "@/lib/supabase/clients/supabaseAdmin";
import { GoogleDriveMetadataSchema } from "@/lib/zod/schemas/GoogleDriveMetadata.schema";
import { IStorageProvider } from "../IStorageProvider";
import { consoleLog } from "@/lib/utils";
export type NormalizedFileMetadata = {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    checksum?: string;
    hash?: string;
    createdAt?: string;
    updatedAt?: string;
};
export class GoogleDriveProvider implements IStorageProvider<NormalizedFileMetadata> {
    async uploadToCache(file: ProductFileToCacheInput): Promise<UploadToStorageOutput> {
        const authService = new GoogleAuthService();

        const accessToken = await authService.getValidAccessToken(
            file.linked_account_id
        );

        const res = await fetch(
            `https://www.googleapis.com/drive/v3/files/${file.file_id}?alt=media`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!res.ok || !res.body) {
            throw new Error("Download failed");
        }

        const filePath = `products/${file.file_id}-${Date.now()}-${file.file_name}`;

        const supabase = supabaseAdmin();

        const { error } = await supabase.storage
            .from("product_files")
            .upload(filePath, res.body, {
                contentType: file.file_type,
            });

        if (error) throw new Error(error.message);

        const { data } = supabase.storage
            .from("product_files")
            .getPublicUrl(filePath);

        return {
            path: filePath,
            url: data.publicUrl,
            contentType: file.file_type,
        };
    }

    async getFileMetadata(fileId: string, accessToken: string): Promise<NormalizedFileMetadata> {
        consoleLog("Fetching Metadata from Google Drive API service")

        const res = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,md5Checksum,owners,createdTime,modifiedTime,webContentLink`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!res.ok) {
            throw new Error("Failed to fetch Google Drive metadata");
        }

        const data = await res.json();
        const parsed = GoogleDriveMetadataSchema.parse(data);

        return {
            id: parsed.id,
            name: parsed.name,
            mimeType: parsed.mimeType,
            size: Number(parsed.size || 0),
            checksum: parsed.md5Checksum,          
        };
    }
}
