// lib/supabase/products/getProduct.ts
import { supabaseAdmin } from "@/lib/supabase/clients/supabaseAdmin";
import { consoleLog } from "@/lib/utils";
import { Product, ProductLicense, Prod3DDetails, Previews } from "@/types/db/products";

interface GetProductVars {
  productId: string;
  creatorId?: string;
}

export async function getProduct(vars: GetProductVars) {
  const { creatorId, productId } = vars;

  consoleLog("⚠️ Start lib/db/products/getProduct.ts");

  // 1️⃣ Fetch product
  let query = supabaseAdmin.from("products").select("*").eq("id", productId);
  if (creatorId) query = query.eq("creator_id", creatorId);

  const { data: productData, error: productError } = await query.single();

  if (productError || !productData) {
    throw new Error(`Product not found: ${productError?.message || "Unknown error"}`);
  }

  // 2️⃣ Fetch licenses for product
  const { data: licensesData, error: licensesError } = await supabaseAdmin
    .from("product_licenses")
    .select("*")
    .eq("product_id", productId);

  if (licensesError) {
    throw new Error(`Failed to fetch licenses: ${licensesError.message}`);
  }

  // 3️⃣ Map licenses to camelCase
  const mappedLicenses: ProductLicense[] = (licensesData ?? []).map((l: any) => ({
    id: l.id,
    productId: l.product_id,
    licenseType: l.license_type,
    licenseName: l.license_name ?? null,
    priceCents: l.price_cents,
    currency: l.currency,
    isMain: l.is_main ?? false,
    max_downloads: l.max_downloads ?? null,
    validity: l.validity ?? null,
    expirationDate: l.expiration_date ?? null,
    description: l.description ?? null,
    createdAt: l.created_at,
    updatedAt: l.updated_at,
  }));

  // 4️⃣ Build product previews (null-safe)
  const previews: Previews = {
    gallery: productData.gallery ?? null,
    video: productData.video ?? null,
    anim: productData.anim ?? null,
  };

  // 5️⃣ Build product object based on your Product interface
  const product: Product & { licenses: ProductLicense[] } = {
    id: productData.id,
    creatorId: productData.creator_id,
    isCreatorSuspended: productData.is_creator_suspended ?? false,
    isCreatorBanned: productData.is_creator_banned ?? false,
    isCreatorPremium: productData.is_creator_premium ?? false,
    isOnlyFollowers: productData.is_only_followers ?? false,

    categoryId: productData.category_id,
    categoryName: productData.category_name ?? null,

    title: productData.title,
    description: productData.description ?? null,
    thumbnailUrl: productData.thumbnail_url ?? null,

    version: productData.version ?? 1,
    status: productData.status,
    type: productData.type,

    formats: productData.formats ?? null,
    previews,

    files: null, // ⛔ Si necesitas cargar Prod3DDetails, debes hacer otra query

    createdAt: productData.created_at,
    updatedAt: productData.updated_at,

    licenses: mappedLicenses,
  };

  consoleLog("⚠️ Product: ", product);
  consoleLog("⚠️ End lib/db/products/getProduct.ts");

  return { product: product };
}
