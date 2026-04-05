import { NextResponse} from "next/server";
import { parseForm } from "@/lib/parseForm";
import { IncomingForm, File } from "formidable";
//import { createProduct } from "@/lib/supabase/products/createProduct";
import { Product } from "@/types/db/products";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { consoleLog } from "@/lib/utils";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser to handle multipart
  },
};

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    consoleLog("Primero")
    // 1. Get session
  /*  const session = await auth();
    if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });
    const creatorId = session.user.id;*/
    const creatorId = "a8d30f0e-6ae8-46ac-8a66-1989732b936b"

    const { fields, files } = await parseForm(req);

    // 3. Normalize single/multiple files
    const normalizeFiles = (fileOrArray: File | File[] | undefined): File[] => {
      if (!fileOrArray) return [];
      return Array.isArray(fileOrArray) ? fileOrArray : [fileOrArray];
    };

    // 4. Map to ProductData
    const productData: Product = {
      creatorId,
      name: fields.name,
      description: fields.description,
      priceCents: parseInt(fields.price_cents, 10),
      currency: fields.currency,
      categoryId: fields.category_id,
      license: fields.license,
      downloadLink: fields.download_link,
      thumbnailFile: normalizeFiles(files.thumbnail)[0] || null,
      imageFiles: normalizeFiles(files.images),
      videoFiles: normalizeFiles(files.videos),
    };

    const product = {product: "Hola"}
    // 5. Call your lib function
   // const product = await createProduct(productData);
    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
