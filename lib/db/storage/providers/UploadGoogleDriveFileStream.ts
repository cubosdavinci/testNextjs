// lib/storage/providers/googleDrive/uploadGoogleDriveFileStream.ts

import { supabaseAdmin } from "@/lib/supabase/clients/supabaseAdmin";
import { GoogleAuthService } from "@/lib/services/google/GoogleAuthService";

export async function UploadGoogleDriveFileStream({
    fileId,
    fileName,
    linkedAccountId,
    bucket = "product_files",
}: {
    fileId: string;
    fileName: string;
    linkedAccountId: string;
    bucket?: string;
}) {
    const authService = new GoogleAuthService();

    // ✅ Clean abstraction
    const accessToken = await authService.getValidAccessToken(linkedAccountId);

    const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!res.ok || !res.body) {
        throw new Error(`Google Drive download failed: ${res.statusText}`);
    }

    const contentType =
        res.headers.get("content-type") || "application/octet-stream";

    const filePath = `products/${fileId}-${Date.now()}-${fileName}`;

    const supabase = supabaseAdmin()

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, res.body, {
            contentType,
        });

    if (error) {
        throw new Error(`Supabase upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return {
        path: filePath,
        url: publicUrlData.publicUrl,
        contentType,
    };
}