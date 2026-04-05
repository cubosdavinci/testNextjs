// api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { consoleLog } from "@/lib/utils";
import { createNewProduct } from "@/lib/db/products/createNewProduct";
import { getProduct } from "@/lib/db/products/getProduct";
import { getDriveFileMetadata } from "@/lib/helpers/getDriveFileMetadata";
import { GoogleApiError } from "@/types/error";
import { generateSafeSlug } from "@/lib/db/products/helpers/generateSafeSlug";
import { insertNewProduct } from "@/lib/db/products/insertNewProduct";
import { prodTypeToString } from "@/lib/helpers/prodTypeToString";
import { UploadFile } from "@/lib/db/storage/updateFile";
import { GoogleDriveMetadata } from "@/lib/db/products/types/GoogleDriveMetadata";
import { CreateProduct } from "@/lib/db/products/CreateProduct copy 2";
// Server Helpers for Zod Validations
import { ZodError } from "zod";
import { createProductValidation } from "@/lib/db/products/createProductValidation";
import { validateSupabaseStorageLink } from "@/lib/validate/products/validateSupabaseStorageLink";
import { CreateProductVars } from "@/lib/db/products/types/CreateProductVars";
import { fetchMetadataFromDownlink } from "@/lib/db/products/helpers/fetchMetadataFromDownloadLink";
import { saveThumbnail } from "@/lib/db/products/helpers/saveThumbnail";

// 🧩 Helper function to handle operations
async function executeOperation(
  name: string,
  vars: any,
  file: File | null,  // this is the thumbnail
  gallery?: File | null
) {

  switch (name) {
    case "CreateProduct":

        // ✅ Server-side validation using Zod (lib/db/createProductValidation)
        const validatedVars = createProductValidation(vars);  

        // ✅ Generate slug from title
        const slug = generateSafeSlug(validatedVars.title);

        // ✅ Fetch downloadLink metadata from Google Drive     
        validatedVars.fileMetadata = await fetchMetadataFromDownlink(validatedVars.downLink);
        
        // ✅ Set a default thumbnail URL
        const DEFAULT_THUMBNAIL_URL = "https://gzjluxccvxvjfywbwonv.supabase.co/storage/v1/object/public/images-store/gotit-new-product.jpg";
        validatedVars.thumbnailUrl = DEFAULT_THUMBNAIL_URL;

        // ✅ Upload  thumbnail to Supabase storage
        if(file){
          const fileName = `${file.name}-thumbnail-${Date.now()}`;
          validatedVars.thumbnailUrl = await saveThumbnail(file, fileName)
        }

        consoleLog("validatedVars: ", validatedVars)
        
        return createNewProduct(validatedVars);
       
        /*consoleLog("FileMetadata Generated in route: ", fileMetadata)
        Merge slug and fileMetadata into finalVars
        validatedVars.slug = slug;
        validatedVars.fileMetadata = fileMetadata;*/

        /*const finalVarsFixed = {
          ...finalVars,
          categoryId:
            finalVars.categoryId === null
              ? null
              : Number(finalVars.categoryId) // force numeric

        };*/

        
    case "insertNewProduct":
        // ✅ Validate server-side using Zod
        //const validatedVars2 = createProductValidation(vars);
        const validatedVars2 = vars;

        // Generate slug from title
        const slug2 = generateSafeSlug(validatedVars2.title);

        // Fetch file metadata from Google Drive using downLink
        let fileMetadata2;
        if (validatedVars2.downLink) {
          
            // Extract fileId from Google Drive URL
            const match = validatedVars2.downLink.match(/\/d\/([a-zA-Z0-9_-]+)/);
            const fileId = match ? match[1] : null;

            if (fileId) {
              // Fetch metadata using the helper function
              fileMetadata2 = await getDriveFileMetadata(fileId);
            } else {
              consoleLog("⚠️ Cannot extract fileId from downLink");
            }
            try {
          } catch (err: any) {
            consoleLog("⚠️ Failed to fetch file metadata:", err.message || err);
          }
        }

          if (thumbnail instanceof File) {
          const timestamp = Date.now();
          const fileName = fileMetadata ? `${fileMetadata2?.name}-${timestamp}` 
                          : file && file.name ? `${timestamp}-${file.name}`
                          : `${timestamp}-default`;

          const { url, error } = await UploadFile(thumbnail, fileName);

          if (error) {
            consoleLog("❌ Error uploading file to Supabase:", error);
            throw new Error(error); // You could throw or handle it as needed
          }

          // If the file is uploaded successfully, update the thumbnail URL
          validatedVars2.thumbnailUrl = url; // This will be the new URL from Supabase
          consoleLog("✅ Thumbnail uploaded to Supabase address: ", validatedVars2.thumbnailUrl);
        }

        //consoleLog("FileMetadata Generated in route: ", fileMetadata)
        // Merge slug and fileMetadata into finalVars
        const finalVars2 = {...validatedVars2, slug2, fileMetadata2 };
        
        const finalVarsFixed2 = {
          ...finalVars2,
          categoryId:
            finalVars2.categoryId === null
              ? null
              : Number(finalVars2.categoryId), // force numeric
        };
        consoleLog("finalVars: ", finalVars2);
        consoleLog("validatedVars continues route: ", validatedVars2);

        return insertNewProduct(finalVarsFixed2,thumbnail/*, gallery*/);

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
  consoleLog("☁️ API Route Starts (api/products)");

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

    // Output Console Variables
    consoleLog("operationName: ", operationName);
    consoleLog("variables: ", variables);
    consoleLog("file: ", file);



    // 🚀 Execute operation
    try {
      result = await executeOperation(operationName, variables, file);

      consoleLog("☁️ API Route Ends (api/products)");
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
