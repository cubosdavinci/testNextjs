// lib/web3/wallets/db/types/NewWalletInput.Schema.ts
import { z } from "zod/v4"
//import type { ProductFileCreateInput } from "@/lib/supabase/types";
import { isUUID, isVersion } from "@/lib/utils/validation";
import { titleSchema } from "@/lib/zod/titleSchema";
import { descriptionSchema } from "../descriptionSchema";
import { enumSchema } from "../enumSchema";
import { PRODUCT_TYPE } from "@/types/db/products/ProductType";
import { STORAGE_PROVIDER } from "@/types/db/product-files/StorageProvider";
import { FileIdSchema } from "./FileId.schema";
import { uuidSchema } from "@/lib/zod/schemas/uuidSchema.schema";

/*
export const myType: ProductFileCreateInput = {
    provider,
    provider_metadata,
    provider_user_name,
    file_id,
    file_name,
    file_size,
    file_type,
    linked_account_id,    
    file_checksum,
    file_hash
}*/


export const CreateProductFileSchema = z.object({
    provider: enumSchema(STORAGE_PROVIDER, "Please enter a valid storage provider"),    
    file_name: titleSchema(1, 200),
    file_id: FileIdSchema,
    linked_account_id: uuidSchema("Storage Linked Account Id is invalid")

}).strict()


// THIS IS THE KEY:
// You don't need to manually write an interface anymore.
// This type is automatically generated from your schema's output.
//export type NewWalletInputType = z.infer<typeof NewWalletInputSchema>;


