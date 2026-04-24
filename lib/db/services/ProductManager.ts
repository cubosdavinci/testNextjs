// lib/db/services/ProductManager.ts
"server-only";
import { supabaseAdmin } from "@/lib/supabase/clients/supabaseAdmin";
import { ProductCreateInput, ProductFileCreateInput, ProductLicenseCreateInput } from "@/lib/supabase/types";
import { consoleLog } from "@/lib/utils";

export class ProductManager {
    constructor(private supabase = supabaseAdmin()) { }

    async create(
        product: ProductCreateInput, // CreateProductInput
        files: ProductFileCreateInput[], // CreateProductFileInput[]
        licenses: ProductLicenseCreateInput[] // CreateProductLicenseInput[]
    ) {
        consoleLog("🔔 Executing rpc_create_product");

        const { data, error } = await this.supabase.rpc("rpc_create_product", {
            p_product: product,
            p_files: files,
            p_licenses: licenses,
        });

        if (error) {
            consoleLog("❌ RPC failed (rpc_create_product)", error);
            throw error;
        }

        return data;
    }
}