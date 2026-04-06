import { supabaseAdmin } from "@/lib/supabase/clients/supabaseAdmin";
import { Product, LicenseProduct } from "@/types/db/products";

/**
 * Creates a product and its licenses.
 * Also uploads the thumbnail image to Supabase storage.
 *
 * Expected vars from route:
 * {
 *   creatorId: string;
 *   title: string;
 *   categoryId?: string | null;
 *   thumbnailFile?: File;
 *   thumbnailUrl?: string;
 *   contentUrl?: string;
 *   description?: string;
 *   licenses: { price: number; typeId: string; isMain: boolean }[];
 * }
 */
export async function CreateProduct(vars: any) {
  const {
    creatorId,
    title,
    categoryId,
    description,
    licenses,
    thumbnailFile,
    thumbnailUrl, // optional text input
  } = vars;

  // ---------------------------------------------------------------------
  // 1️⃣ Insert product row
  // ---------------------------------------------------------------------
  const { data: productData, error: productError } = await supabaseAdmin
    .from("products")
    .insert({
      creator_id: creatorId,
      category_id: categoryId ? Number(categoryId) : null,
      name: title,
      description,
      status: "draft",
    })
    .select()
    .single();

  if (productError) throw new Error(`Product insert failed: ${productError.message}`);
  const productId = productData.id;

  // ---------------------------------------------------------------------
  // 2️⃣ Upload thumbnail (if file provided)
  // ---------------------------------------------------------------------
  let uploadedThumbnailUrl = thumbnailUrl || null;

  if (thumbnailFile) {
    const file = thumbnailFile as File;
    const filePath = `prod-thumb-${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("images-store")
      .upload(filePath, file);

    if (uploadError) throw new Error(`Thumbnail upload failed: ${uploadError.message}`);

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("images-store")
      .getPublicUrl(filePath);

    uploadedThumbnailUrl = publicUrlData.publicUrl;

    // Update product with the final URL
    await supabaseAdmin
      .from("products")
      .update({ thumbnail_url: uploadedThumbnailUrl })
      .eq("id", productId);
  }

  // ---------------------------------------------------------------------
  // 3️⃣ Insert licenses into product_licenses
  // ---------------------------------------------------------------------
  if (Array.isArray(licenses) && licenses.length > 0) {
    const licenseRows: Partial<LicenseProduct>[] = licenses.map((lic: any) => ({
      product_id: productId,
      type: Number(lic.typeId),
      price_cents: Math.round(lic.price * 100), // convert to cents
      currency: "USD", // default; can make dynamic if needed
      is_main: !!lic.isMain,
    }));

    const { error: licenseError } = await supabaseAdmin
      .from("product_licenses")
      .insert(licenseRows);

    if (licenseError)
      throw new Error(`License insert failed: ${licenseError.message}`);
  }

  // ---------------------------------------------------------------------
  // ✅ Return product
  // ---------------------------------------------------------------------
  return {
    data: {
      id: productId,
      name: productData.name,
      thumbnail_url: uploadedThumbnailUrl,
    },
  };
}
