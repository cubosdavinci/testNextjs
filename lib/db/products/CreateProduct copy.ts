import fs from "fs";
import {ProductData} from "@/types/db/products"
import { supabaseClient } from "@/lib/clients/supabaseAdmin"; // supabase client with service key


export async function CreateProduct(data: ProductData) {
  // 1. Insert product row
  const { data: productRow, error: productError } = await supabaseClient
    .from("products")
    .insert({
      creator_id: data.creatorId,
      name: data.name,
      description: data.description,
      price_cents: data.priceCents,
      currency: data.currency,
      category_id: data.categoryId,
    })
    .select()
    .single();

  if (productError) throw productError;

  const productId = productRow.id;

  // 2. Upload thumbnail
  let thumbnailUrl: string | null = null;
  if (data.thumbnailFile) {
    const file = data.thumbnailFile;
    const fileBuffer = fs.readFileSync(file.filepath);
    const { data: thumbData, error: thumbError } = await supabaseClient.storage
      .from("product-thumbnails")
      .upload(`${productId}/${file.originalFilename}`, fileBuffer, { contentType: file.mimetype });
    if (thumbError) throw thumbError;
    thumbnailUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/product-thumbnails/${productId}/${file.originalFilename}`;
    await supabaseClient.from("products").update({ thumbnail_url: thumbnailUrl }).eq("id", productId);
  }

  // 3. Upload images
  for (const img of data.imageFiles) {
    const buffer = fs.readFileSync(img.filepath);
    await supabaseClient.storage.from("product-images").upload(`${productId}/${img.originalFilename}`, buffer, { contentType: img.mimetype });
    const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/product-images/${productId}/${img.originalFilename}`;
    await supabaseClient.from("product_images").insert({ product_id: productId, url });
  }

  // 4. Upload videos
  for (const vid of data.videoFiles) {
    const buffer = fs.readFileSync(vid.filepath);
    await supabaseClient.storage.from("product-videos").upload(`${productId}/${vid.originalFilename}`, buffer, { contentType: vid.mimetype });
    const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/product-videos/${productId}/${vid.originalFilename}`;
    await supabaseClient.from("product_videos").insert({ product_id: productId, url });
  }

    if (data.downloadLink) {
        await supabaseClient.from("product_private").insert({
            product_id: productId,
            download_link: data.downloadLink,
            license: data.license || "Personal"
        });
    }

  return productRow;
}