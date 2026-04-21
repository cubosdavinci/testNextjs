// app/api/products/sync-cache/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ProductFilesManager } from "@/lib/db/services/ProductFilesManager";
import { consoleLog } from "@/lib/utils";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { productId, forceUpload = false } = body;

        if (!productId) {
            return NextResponse.json(
                { error: "Missing productId" },
                { status: 400 }
            );
        }

        const manager = new ProductFilesManager();

        const results = await manager.syncProductFilesToCache(
            productId,
            forceUpload
        );

        return NextResponse.json({
            success: true,
            results,
        });

    } catch (err) {
        consoleLog("🔥 API /products/sync-cache error", err);

        return NextResponse.json(
            {
                success: false,
                error: err instanceof Error ? err.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}