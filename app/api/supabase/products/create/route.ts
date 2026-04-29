// app/api/supabase/product/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod/v4";

import { ProductManager } from "@/lib/db/services/ProductManager";
import { buildProductFiles } from "@/lib/db/products/helpers/buildProductFiles";
import { generateSafeSlug } from "@/lib/db/products/helpers/generateSafeSlug";

import { CreateProductSchema } from "@/lib/zod/schemas/CreateProduct.schema";
import { CreateProductFileSchema } from "@/lib/zod/schemas/CreateProductFile.schema";

//import { CreateProductLicenseSchema } from "@/lib/zod/schemas/CreateProductLicense.schema";

import type {
    ProductCreateClientInput,
    ProductCreateInput,
    ProductFileClientInput,
    ProductFileCreateInput,
    ProductLicenseCreateInput,
} from "@/lib/supabase/types";

import { saveThumbnail } from "@/lib/db/storage/saveThumbnail";
import { supabaseServer } from "@/lib/supabase/clients/supabaseServer";
import { consoleLog } from "@/lib/utils";
import { checkProductFileSizeLimit } from "@/lib/zod/helpers/checkProductFileSizeLimit";
import { enrichFilesFromProviders } from "@/lib/utils/enrichFilesFromProviders";

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

        // =========================
        // 2. Parse JSON onto Objects
        // =========================
        let newProduct: ProductCreateInput;
        

        try {
            newProduct = parseJSON(rawProduct, "newProduct");
            newProduct.creator_id = 'd745ad01-5efb-4241-b0e1-b50c97c0d0c3';
            newProduct.slug = generateSafeSlug(newProduct.title)
            
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
        // 3. Create Files
        // =========================
        let newProductFiles: ProductFileCreateInput[];
        try {
            const parsedProductFiles: ProductFileClientInput[] = parseJSON(rawFiles, "newProductFiles");
                        
            if (!Array.isArray(parsedProductFiles)) {
                return NextResponse.json(
                { error: "newProductFiles must be an array" },
                { status: 422 }
                );
            }
            
            if (parsedProductFiles.length === 0) {
                return NextResponse.json(
                { error: "The new product must have at least one file" },
                { status: 422 }
                );
            }

            if (parsedProductFiles.length > 10) {
                return NextResponse.json(
                { error: "The new product cannot have more than 10 files" },
                { status: 422 }
                );
            }

            parsedProductFiles.map((file) => {
                checkProductFileSizeLimit(file,100,"MB");
            })

            newProductFiles = await enrichFilesFromProviders(parsedProductFiles);

            // ✅ Validate each file individually
            const validatedFiles: ProductFileCreateInput[] = newProductFiles.map((file, fileIdx) => {
                try {
                    return CreateProductFileSchema.parse(file);
                } catch (err) {
                    if (err instanceof ZodError) {
                        const issue = err.issues[0];

                        throw new Error(
                            `Error detected in file ${file?.file_name ?? fileIdx}: ${issue.path.join(".")} - ${issue.message}`
                        );
                    }

                    throw err;
                }
            });     
        } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Unknown error" },
            { status: 400 }
        );
        }

        consoleLog("Files Ready To Be Uploaded to database", newProductFiles)

       

        // =========================
        // 5. Validate licenses
        // =========================

        let validatedLicenses: ProductLicenseClientInput[];

        try {
            const parsedProductLicenses: ProductLicenseClientInput[] =
                parseJSON(rawLicenses, "newProductLicenses");

            if (!Array.isArray(parsedProductLicenses)) {
                return NextResponse.json(
                    { error: "newProductLicenses must be an array" },
                    { status: 422 }
                );
            }

            if (parsedProductLicenses.length === 0) {
                return NextResponse.json(
                    { error: "The new product must have at least one license." },
                    { status: 422 }
                );
            }

            if (parsedProductLicenses.length > 10) {
                return NextResponse.json(
                    { error: "The new product cannot have more than 10 licenses" },
                    { status: 422 }
                );
            }

            validatedLicenses = parsedProductLicenses.map((license, idx) => {
                try {
                    return CreateProductLicenseSchema.parse(license);
                } catch (err) {
                    if (err instanceof ZodError) {
                        const issue = err.issues[0];

                        throw new Error(
                            `Error in license ${license?.file_name ?? idx}: ${issue.path.join(".")} - ${issue.message}`
                        );
                    }

                    throw err;
                }
            });

        } catch (err) {
            return NextResponse.json(
                { error: err instanceof Error ? err.message : "Unknown error" },
                { status: 400 }
            );
        }

       
        // =========================
        // 6. Execute business logic
        // =========================
        const productManager = new ProductManager();

        const result = await productManager.create(
            validatedProduct,
            validatedFiles,
            validatedLicenses,
        );

        return NextResponse.json(
            { id: '2342343-24244-2424224-324524' },
            { status: 200 }
        );

        // =========================
        // 6. Handle thumbnail (UPLOAD FIRST)
        // =========================
        let uploadedThumbnailUrl: string | undefined;

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