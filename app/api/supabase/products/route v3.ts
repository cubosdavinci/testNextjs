// api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { consoleLog } from "@/lib/utils";
import { createProduct } from "@/lib/db/products/createNewProduct";
import { getProduct } from "@/lib/db/products/getProduct";
import { getDriveFileMetadata } from "@/lib/helpers/getDriveFileMetadata";
import { GoogleApiError } from "@/types/error";
import { createProductValidation } from "@/lib/db/products/createProductValidation";
import { ZodError } from "zod";


export async function POST(req: NextRequest) {
  consoleLog("☁️ Route Start: api/products");

  try {
    const contentType = req.headers.get("content-type") || "";
    let operationName: string | undefined;
    let variables: any;
    let file: File | null = null;
    let result;
    const clientID = "a8d30f0e-6ae8-46ac-8a66-1989732b936b";

    // 🧩 Helper function to handle operations
    async function executeOperation(
      name: string,
      vars: any,
      thumbnail?: File | null,
      gallery?: File | null
    ) {
      switch (name) {
        case "createProduct":
            // ✅ Validate server-side using Zod
            const validatedVars = createProductValidation(vars);
            consoleLog("validatedVars continues route: ", validatedVars);
            return createProduct(validatedVars/*,thumbnail, gallery*/);

        case "getProduct":
          return getProduct({ ...vars, creatorId: clientID });

        case "getGoogleDriveMetadata": {
          const { fileId } = vars;
          if (!fileId || typeof fileId !== "string") {
            throw new Error("fileId is required");
          }
          return getDriveFileMetadata(fileId);
        }

        /*case "getProductsByCategory":
          return getProductsByCategory(vars);*/     

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

    consoleLog("Operation: ", operationName);
    consoleLog("Variables:", variables);

    // 🚀 Execute operation
    try {
      result = await executeOperation(operationName, variables, file);

      consoleLog("☁️ Route End - api/products");
      return NextResponse.json(result);
    } catch (err: any) {

      consoleLog("💥 Route Exception - api/products Line 86: ", err.issues[0].message);

      let errorMessage = "❌ Server error. Please try again later.";
      let status = 400;

      if (err instanceof GoogleApiError) {
        errorMessage = err.message;
        status = err.status || 400;
      }if (err instanceof ZodError) {
        errorMessage = err.issues[0].message;
      }
      else if (err instanceof Error) {
        errorMessage = err.message;
      }

      return NextResponse.json({ error: errorMessage }, { status });
    }
  } catch (error: any) {
    consoleLog("💥 Route Exception - api/products: ", error.message);
    return NextResponse.json(
      { error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
