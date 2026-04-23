// app/api/supabase/product/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { ProductManager } from "@/lib/db/services/ProductManager";

import { CreateProductSchema } from "@/lib/zod/schemas/CreateProduct.schema";
import { CreateProductFileSchema } from "@/lib/zod/schemas/CreateProductFile.schema";
import { CreateProductLicenseSchema } from "@/lib/zod/schemas/CreateProductLicense.schema";
import { ProductCreateInput, ProductFileCreateInput, ProductLicenseCreateInput } from "@/lib/supabase/types";

function parseJSON(field: FormDataEntryValue, name: string) {
    try {
        return JSON.parse(field as string);
    } catch {
        throw new Error(`Invalid JSON format in ${name}`);
    }
}

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get("content-type") || "";

        if (!contentType.includes("multipart/form-data")) {
            return NextResponse.json(
                { error: "Content-Type must be multipart/form-data" },
                { status: 400 }
            );
        }

        const formData = await req.formData();

        // 1. Extract fields
        const rawProduct = formData.get("newProduct");
        const rawFiles = formData.get("newProductFiles");
        const rawLicenses = formData.get("newProductLicenses");
        const thumbnail = formData.get("thumbnail") as File | null;

        // 2. Validate required fields
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

        // 3. Parse JSON safely
        let newProduct: ProductCreateInput;
        let newProductFiles: ProductFileCreateInput[];
        let newProductLicenses: ProductLicenseCreateInput[];
        try {
            newProduct = parseJSON(rawProduct, "newProduct");
            newProductFiles = parseJSON(rawFiles, "newProductFiles");
            newProductLicenses = parseJSON(rawLicenses, "newProductLicenses");
        } catch (err) {
            const error = err as Error
            return NextResponse.json(
                { error: error.message},
                { status: 400 }
            );
        }

        // 4. Validate with Zod
        const validatedProduct = CreateProductSchema.parse(newProduct);
        
        const validatedFiles = Array.isArray(newProductFiles)
            ? newProductFiles.map((f: any) =>
                CreateProductFileSchema.parse(f)
            )
            : [];
        
        const validatedLicenses = Array.isArray(newProductLicenses)
            ? newProductLicenses.map((l: any) =>
                CreateProductLicenseSchema.parse(l)
            )
            : [];

        // 5. Execute
        const productManager = new ProductManager();

        const result = await productManager.create(
            validatedProduct,
            validatedFiles,
            validatedLicenses,
            thumbnail // optional
        );

        return NextResponse.json(
            { success: true, data: result },
            { status: 200 }
        );

    } catch (error) {
        // Zod validation errors
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: error.issues,
                },
                { status: 422 }
            );
        }

        console.error(
            "💥 Route Exception - api/supabase/product/create:",
            error
        );

        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}