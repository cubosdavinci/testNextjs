import { NextRequest, NextResponse } from "next/server";
import { consoleLog } from "@/lib/utils";
import { GetLicenseTypes } from "@/lib/db/licenses/GetLicenseTypes";
import { GetLicenseTerms } from "@/lib/db/licenses/GetLicenseTerms";


export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let operationName: string | undefined;
    let variables: any;
    let file: File | null = null;
    let result;

    // 🧩 Helper function to handle operations
    async function executeOperation(name: string, vars: any, file?: File | null) {
      switch (name) {
        case "GetLicenseTypes":
          return GetLicenseTypes(vars.clientId ?? null);
        case "GetLicenseTerms":
        return GetLicenseTerms(vars.licenseTypeId);       
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

    consoleLog("Operation:", [operationName]);
    consoleLog("Variables:", variables);

    // 🚀 Execute operation
    try {
      result = await executeOperation(operationName, variables, file);

    /*if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }*/

    return NextResponse.json(result);
    
    } catch (err: any) {
      console.error("Error executing operation:", err.message);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }



  } catch (error: any) {

    return NextResponse.json(
      { error: error.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}