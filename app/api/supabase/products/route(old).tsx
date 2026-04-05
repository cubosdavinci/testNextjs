import { NextResponse } from "next/server";
import { getProducts } from "@/lib/saleor/queries/products/getProducts";
import { ProductEdge } from "@/lib/saleor/queries/products/types";
import { consoleLog } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const firstParam = searchParams.get("first");
    const afterParam = searchParams.get("after");

    const first = firstParam ? parseInt(firstParam, 10) : 20;

    // Call your lib function
    const productsData = await getProducts(first, afterParam || undefined);
    // consoleLog("Route.tsx: ", [productsData])
    return NextResponse.json( productsData );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ edges: [], error: "Failed to fetch products" }, { status: 500 });
  }
}