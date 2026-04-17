// lib/db/categories/getCategoriesList.ts
import { supabaseAdmin } from "@/lib/supabase/clients/supabaseAdmin";
import { consoleLog } from "@/lib/utils";
import { Category, CategoriesListProps } from "@/types/db/categories";

export async function getCategoriesList(
  vars: CategoriesListProps
): Promise<Category[] | null> {
  consoleLog("⚠️ Start lib/db/categories/getCategoriesList.ts");

  const { first, level, productType, parentId } = vars;

  const supabase = supabaseAdmin();

  let query = supabase
    .from("categories")
    .select("*")
    .eq("level", level)
    .eq("product_type", productType)
    .limit(first)
    .order("id", { ascending: true });

  // only apply parent filter when needed
  if (parentId !== null && parentId !== undefined) {
    query = query.eq("parent_id", parentId);
  }

  const { data: cat, error } = await query;

  if (error) {
    consoleLog("💥 DB Error (lib/db/categories/getCategoriesList).", error);
    throw error;
  }

  if (!cat) return null;

  const categories: Category[] = cat.map((category: any) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    level: category.level,
    parentId: category.parent_id,
    productType: category.product_type,
    thumbnailUrl: category.thumbnail_url ?? undefined,
    productsCount: category.productsCount ?? undefined,
    subcategoriesCount: category.subcategoriesCount ?? undefined,
  }));

  consoleLog("⚠️ Categories", categories);
  consoleLog("⚠️ End lib/db/categories/getCategoriesList.ts");

  return categories;
}