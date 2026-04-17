// api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { consoleLog } from "@/lib/utils";
import { getCategorySubTree } from "@/lib/supabase/categories/getCategorySubTree";
import { getCategoriesList } from "@/lib/supabase/categories/getCategoriesList";

export async function POST(req: NextRequest) {
    consoleLog("💬 API Route Start - api/categories")

  try {
    const contentType = req.headers.get("content-type") || "";
    let operationName: string | undefined;
    let variables: any;
    let file: File | null = null;
    let result;

    // 🧩 Helper function to handle operations
    async function executeOperation(name: string, vars: any, file?: File | null) {
      switch (name) {
        case "GetCategorySubTree":
          return getCategorySubTree( vars);
        /*case "GetCategorySubTree":
          return getCategorySubTree( vars);*/
        case "getCategoriesList":
          return getCategoriesList( vars);   
        default:
          throw new Error(`Unknown operation: ${name}`);
      }
    }


    // 🧾 Parse request body based on content type
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      const operations = JSON.parse(formData.get("operations") as string);
      const map = JSON.parse(formData.get("map") as string);
      const fileKey = Object.keys(map)[0];

      operationName = operations.operationName;
      variables = operations.variables;
      file = formData.get(fileKey) as File;
    } else {
      const body = await req.json();
      operationName = body.operationName;
      variables = body.variables;
    }

    // 🧠 Validate operation
    if (!operationName) {
      return NextResponse.json(
        { error: "operationName is required" },
        { status: 400 }
      );
    }

    consoleLog("Operation:", operationName);
    consoleLog("Variables:", variables);

    // 🚀 Execute operation
    try {
      result = await executeOperation(operationName, variables, file);

    /*if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }*/

    consoleLog("💬 API Route End - api/categories")
    return NextResponse.json(result);
    
    } catch (err: any) {
      consoleLog("💥 Route Exception - api/categories: ", err.message);

      return NextResponse.json(
        { error: "❌ Server error. Please try again later." },
        { status: 400 }
      );
    }

  } catch (error: any) {
    consoleLog("💥 Route Exception - api/categories: ", error.message);

    return NextResponse.json(
      { error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
