import { supabaseAdmin } from "@/lib/clients/supabaseAdmin";
import { Product, ProductLicense } from "@/types/db/products";

export async function CreateProduct(vars: any) {
  const {
    creatorId, title, categoryId, description, licenses, thumbnailFile, thumbnailUrl, } = vars;

  // 1️⃣ Create product
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

    console.log("Returned Data: ", productData)
    console.log("Returned Error: ", productError)

  if (productError) throw new Error(`Product insert failed: ${productError.message}`);
  const productId = productData.id;

  // 2️⃣ Upload thumbnail (optional)
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

    await supabaseAdmin
      .from("products")
      .update({ thumbnail_url: uploadedThumbnailUrl })
      .eq("id", productId);
  }

  // 3️⃣ Insert product licenses
  if (Array.isArray(licenses) && licenses.length > 0) {
    const licenseRows: Partial<ProductLicense>[] = licenses.map((lic: any) => ({
      product_id: productId,
      license_type: Number(lic.typeId),
      price_cents: Math.round(lic.price * 100),
      currency: "USD",
      is_main: !!lic.isMain,
    }));

    const { error: licenseError } = await supabaseAdmin
      .from("product_licenses")
      .insert(licenseRows);

    if (licenseError)
      throw new Error(`License insert failed: ${licenseError.message}`);
  }

  return {
    data: {
      id: productId,
      name: productData.name,
      thumbnail_url: uploadedThumbnailUrl,
    },
  };
}
