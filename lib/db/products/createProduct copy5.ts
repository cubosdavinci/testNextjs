// lib/supabase/products/CreateProduct.ts
import { supabaseClient } from "@/lib/clients/supabaseAdmin";
import { consoleLog } from "@/lib/utils";
import { Product, ProductLicense, CreateProductVars } from "@/types/db/products";

export async function createProduct(vars: CreateProductVars, thumbnail?: File | null, gallery?: File | null) {
  const { creatorId, title, categoryId, description, licenses, thumbnailFile, thumbnailUrl } = vars;

  consoleLog("CreateProduct vars:", [vars]);

  if (!creatorId || !title) {
    return { error: "creatorId and title are required" };
  }

  try {
    // 1️⃣ Create product
    const { data: productData, error: productError } = await supabaseClient
      .from("products")
      .insert({
        creator_id: creatorId,
        category_id: categoryId ?? null,
        title: title,
        description: description ?? null,
        status: "draft",
      })
      .select()
      .single();

    if (productError || !productData) {
      console.error("❌ Error creating product:", productError?.message);
      return { error: productError?.message || "Failed to create product" };
    }

    const productId = productData.id;
    let uploadedThumbnailUrl = thumbnailUrl ?? null;

    // 2️⃣ Upload thumbnail if provided
    if (thumbnailFile) {
      const filePath = `prod-thumb-${Date.now()}-${thumbnailFile.name}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("images-store")
        .upload(filePath, thumbnailFile);

      if (uploadError) {
        console.error("❌ Thumbnail upload error:", uploadError.message);
        return { error: `Thumbnail upload failed: ${uploadError.message}` };
      }

      const { data: publicUrlData } = supabaseClient.storage
        .from("images-store")
        .getPublicUrl(filePath);

      uploadedThumbnailUrl = publicUrlData.publicUrl;

      // Update product with thumbnail URL
      await supabaseClient
        .from("products")
        .update({ thumbnail_url: uploadedThumbnailUrl })
        .eq("id", productId);
    }

    // 3️⃣ Insert licenses if provided
    if (licenses && licenses.length > 0) {
      const licenseRows: Partial<ProductLicense>[] = licenses.map((lic) => ({
        product_id: productId,
        license_type: Number(lic.typeId),
        price_cents: Math.round(lic.price * 100),
        currency: "USD",
        is_main: !!lic.isMain,
      }));

      const { error: licenseError } = await supabaseClient
        .from("product_licenses")
        .insert(licenseRows);

      if (licenseError) {
        console.error("❌ License insert error:", licenseError.message);
        return { error: licenseError.message };
      }
    }

    consoleLog("✅ Product created successfully:", [productId]);

    return {
      data: {
        id: productId,
        name: productData.name,
        thumbnailUrl: uploadedThumbnailUrl,
      },
    };
  } catch (err: any) {
    console.error("❌ Unexpected error in CreateProduct:", err.message);
    return { error: err.message || "Unexpected error creating product" };
  }
}
