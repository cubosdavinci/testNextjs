// app/api/supabase/product/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { ProductManager } from "@/lib/db/services/ProductManager";
import { buildProductFiles } from "@/lib/db/products/helpers/buildProductFiles";
import { generateSafeSlug } from "@/lib/db/products/helpers/generateSafeSlug";

import { CreateProductSchema } from "@/lib/zod/schemas/CreateProduct.schema";
//import { CreateProductFileSchema } from "@/lib/zod/schemas/CreateProductFile.schema";
//import { CreateProductLicenseSchema } from "@/lib/zod/schemas/CreateProductLicense.schema";

import type {
    ProductCreateClientInput,
    ProductCreateInput,
    ProductFileClientInput,
    ProductLicenseCreateInput,
} from "@/lib/supabase/types";

import { saveThumbnail } from "@/lib/db/storage/saveThumbnail";
import { supabaseServer } from "@/lib/supabase/clients/supabaseServer";
import { consoleLog } from "@/lib/utils";

function parseJSON(field: FormDataEntryValue, name: string) {
    try {
        return JSON.parse(field as string);
    } catch {
        throw new Error(`Invalid JSON format in ${name}`);
    }
}

export async function POST(req: NextRequest) {
    try {
        /*
        const supabase = await supabaseServer();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid session found' },
                { status: 401 }
            );
        }*/


        const contentType = req.headers.get("content-type") || "";

        if (!contentType.includes("multipart/form-data")) {
            return NextResponse.json(
                { error: "Content-Type must be multipart/form-data" },
                { status: 400 }
            );
        }

        const formData = await req.formData();

        // =========================
        // 1. Extract fields
        // =========================
        const rawProduct = formData.get("newProduct");
        const rawFiles = formData.get("newProductFiles");
        const rawLicenses = formData.get("newProductLicenses");
        const thumbnail = formData.get("thumbnail") as File | null;

        if (!rawProduct) {
            return NextResponse.json(
                { error: "Missing field: newProduct" },
                { status: 400 }
            );
        }

            
/*
        if (!rawFiles) {
            return NextResponse.json(
                { error: "Missing field: newProductFiles" },
                { status: 400 }
            );
        }

        if (!rawLicenses) {
            return NextResponse.json(
                { error: "Missing field: newProductLicenses" },
                { status: 400 }
            );
        }
*/
        // =========================
        // 2. Parse JSON
        // =========================
        let newProduct: ProductCreateInput;
        let newProductFiles: ProductFileClientInput[];
       // let newProductLicenses: ProductLicenseCreateInput[];

        try {
            newProduct = parseJSON(rawProduct, "newProduct");
            newProduct.creator_id = 'd745ad01-5efb-4241-b0e1-b50c97c0d0c3';
            newProduct.slug = generateSafeSlug(newProduct.title)

            if ()
            newProductFiles = parseJSON(rawFiles, "newProductFiles");
            //newProductLicenses = parseJSON(rawLicenses, "newProductLicenses");
        } catch (err) {
            return NextResponse.json(
                { error: (err as Error).message },
                { status: 400 }
            );
        }

        // =========================
        // 3. Validate product
        // =========================
        const validatedProduct: ProductCreateInput = CreateProductSchema.parse(newProduct);

        // =========================
        // 6. Handle thumbnail (UPLOAD FIRST)
        // =========================
        let uploadedThumbnailUrl: string | undefined;

        // =========================
        // 4. Build full file objects (IMPORTANT STEP)
        // =========================
        const builtFiles = await buildProductFiles(newProductFiles);

        // Validate built files
        const validatedFiles = builtFiles.map((f) =>
            CreateProductFileSchema.parse(f)
        );

        // =========================
        // 5. Validate licenses
        // =========================
        const validatedLicenses = Array.isArray(newProductLicenses)
            ? newProductLicenses.map((l) =>
                CreateProductLicenseSchema.parse(l)
            )
            : [];

        // =========================
        // 6. Execute business logic
        // =========================
        const productManager = new ProductManager();

        const result = await productManager.create(
            validatedProduct,
            validatedFiles,
            validatedLicenses,
        );

        if (thumbnail) {

            let uploadedThumbnailUrl: string;
            
            try {
                uploadedThumbnailUrl = await saveThumbnail(
                    thumbnail,
                    `${validatedProduct.creator_id}/${productId}/thumbnail/${Date.now()}.${ext}`
                );
            }
            catch (err) { }
        }

        return NextResponse.json(
            { success: true, data: result },
            { status: 200 }
        );
    } catch (err) {
        consoleLog("Catching Error", err)

        // =========================
        // Zod errors
        // =========================
        if (err instanceof ZodError) {
            consoleLog("Zod Error", err)
            return NextResponse.json(
                {
                    error: err.issues[0].message,                    
                },
                { status: 422 }
            );
        }

        // =========================
        // Generic errors (including buildProductFiles)
        // =========================
        /*console.error(
            "💥 Route Exception - api/supabase/product/create:",
            error
        );*/

        return NextResponse.json(
            {
                error: (err as Error)?.message || "Internal Server Error",
            },
            { status: 500 }
        );
    }
}