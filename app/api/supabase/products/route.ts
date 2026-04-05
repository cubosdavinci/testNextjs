// api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { consoleLog } from "@/lib/utils";
import { getProduct } from "@/lib/db/products/getProduct";
import { getDriveFileMetadata } from "@/lib/helpers/getDriveFileMetadata";
import { GoogleApiError } from "@/types/error";
// Server Helpers for Zod Validations
import { ZodError } from "zod";
import { logicCreateNewProduct } from "@/lib/db/products/helpers/logicCreateNewProduct";
import { logicInsertNewProduct } from "@/lib/db/products/helpers/logicInsertNewProduct";
import { logicInsertNewProductFile } from "@/lib/db/products/helpers/logicInsertNewProductFile";
import { logicInsertNewLicenses } from "@/lib/db/products/helpers/logicInsertNewLicenses";
import { dboperationResponse } from "@/lib/helpers/dboperationResponse";

// 🧩 Helper function to handle operations
async function executeOperation(
  name: string,
  vars: any,
  file: File | null,  // this is the thumbnail
  gallery?: File | null
) {
  consoleLog("🔔 🔍 Execute operation: ", name)

  switch (name) {
    case "CreateNewProduct":    
      return await logicCreateNewProduct(vars, file);
               
    case "InsertNewProduct":
      return await logicInsertNewProduct(vars, file);

    case "InsertNewProductFile":
      return await logicInsertNewProductFile(vars);
      
    case "InsertNewLicenses":
      return await logicInsertNewLicenses(vars);

    case "getProduct":
      return getProduct({ ...vars, creatorId: vars });

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

export async function POST(req: NextRequest) {
  consoleLog("🔔 ☁️ API Route Starts (api/products)");

  try {
    const contentType = req.headers.get("content-type") || "";
    let operationName: string | undefined;
    let variables: any;
    let file: File | null = null;
    let result;
    const userId = "a8d30f0e-6ae8-46ac-8a66-1989732b936b";
    

    // 🧾 Parse request body based on content type
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      // Get operationName and Variables
      const operations = JSON.parse(formData.get("operations") as string);
      operationName = operations.operationName;
      variables = operations.variables;

      // Get file
      const map = JSON.parse(formData.get("map") as string);
      const fileKey = Object.keys(map)[0];
      file = formData.get(fileKey) as File;     

    } else {
      // Get operationName and Variables
      const body = await req.json();
      operationName = body.operationName;
      variables = body.variables;
    }

    // Validate there is an operationName
    if (!operationName) {
      return NextResponse.json(
        { error: "operationName is required" },
        { status: 400 }
      );
    }

    // Add userId ro variables
    variables.creatorId = userId;

    // 🚀 Execute operation
    try {
      result = await executeOperation(operationName, variables, file);
      return dboperationResponse(result, `products/${operationName}`);

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

    consoleLog("💥 Route Exception - api/products: ", error);
    return NextResponse.json(
      { error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
