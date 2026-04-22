// app/api/supabase/product/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { ProductManager } from "@/lib/db/services/ProductManager";

// Import your Zod schemas here
import { CreateProductSchema } from "@/lib/zod/schemas/CreateProduct.schema";
import { CreateProductFileSchema } from "@/lib/zod/schemas/CreateProductFile.schema";
import { CreateProductLicenseSchema } from "@/lib/zod/schemas/CreateProductLicense.schema";



export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        // 1. Extract and Parse JSON
        // Assumes client sends a "data" field with JSON structure
        const data = JSON.parse(formData.get("data") as string);
        const productManager = new ProductManager();

        // 2. Validation
        // Validating against Zod schemas (these will throw if invalid)
        const validatedProduct = CreateProduct.parse(data.product);
        const validatedFiles = data.files.map((f: any) => CreateProductFile.parse(f));
        const validatedLicenses = data.licenses.map((l: any) => CreateProductLicense.parse(l));

        // 3. Execution
        const result = await productManager.create(
            validatedProduct,
            validatedFiles,
            validatedLicenses
        );

        return NextResponse.json({ success: true, data: result }, { status: 200 });

    } catch (error: any) {
        // 4. Error Handling
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 422 }
            );
        }

        console.error("💥 Route Exception - api/supabase/product/create: ", error);

        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}