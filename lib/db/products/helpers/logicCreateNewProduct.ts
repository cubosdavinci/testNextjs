// lib/db/products/helpers/logicCreateNewProduct.ts
import { consoleLog } from "@/lib/utils";
import { createNewProduct } from "../createNewProduct";
import { createProductValidation } from "../createProductValidation";
import { CreateProductVars } from "../types/CreateProductVars";
import { fetchMetadataFromDownloadLink  } from "./fetchMetadataFromDownloadLink";
import { generateSafeSlug } from "./generateSafeSlug";
import { saveThumbnail } from "./saveThumbnail";
import { deleteFile } from "../../storage/deleteFile";

export async function logicCreateNewProduct(vars: CreateProductVars, file: File | null) {
    // ✅ Server-side validation using Zod (lib/db/createProductValidation)
    const validatedVars = createProductValidation(vars);

    // ✅ Generate slug from title
    validatedVars.slug = generateSafeSlug(validatedVars.title);

    // ✅ Fetch downloadLink metadata from Google Drive  
    validatedVars.fileMetadata = await fetchMetadataFromDownloadLink(validatedVars.downLink);

    // ✅ Set a default thumbnail URL
    const DEFAULT_THUMBNAIL_URL =
        "https://gzjluxccvxvjfywbwonv.supabase.co/storage/v1/object/public/images-store/gotit-new-product.jpg";
    validatedVars.thumbnailUrl = DEFAULT_THUMBNAIL_URL;

    // ✅ Upload  thumbnail to Supabase storage
    let uploadedThumbnailUrl: string | null = null;
    if (file) {
        const fileName = `${file.name}-thumbnail-${Date.now()}`;
        uploadedThumbnailUrl = await saveThumbnail(file, fileName);
        validatedVars.thumbnailUrl = uploadedThumbnailUrl;
    }

    try {
        return await createNewProduct(validatedVars);
    } catch (err) {
        consoleLog("🔥 Server Error at 'lib/db/products/createNewProduct'");
        consoleLog("🔥 Catched Error: ", err);

        // ✅ Cleanup thumbnail if uploaded
        if (uploadedThumbnailUrl) {
            await deleteFile(uploadedThumbnailUrl);
        }
        throw err; // rethrow for outer handler
    }
}
