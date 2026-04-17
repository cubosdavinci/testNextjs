import { supabaseAdmin } from "@/lib/clients/supabaseAdmin";
import { consoleLog } from "@/lib/utils";
import { Category } from "@/types/db/categories";

export interface GetCategoryTreeByProductVars {
  treeId: number; // required
}

export async function getCategoryTreeByProduct(
  vars: GetCategoryTreeByProductVars
): Promise<Category[]> {
  consoleLog("⚠️ lib/public/categories/getCategoryTreeByProduct.ts");
  const { treeId } = vars;

  if (!treeId) {
    throw new Error("treeId is required to fetch the category tree.");
  }

  try {
    // Fetch only level 0 descendants of the tree
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("tree_id", treeId)
      .eq("level", 1)
      .order("lft", { ascending: true });

    if (error) throw error;

    const categories: Category[] = (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      slug: c.slug,
      seo_title: c.seo_title,
      seo_description: c.seo_description,
      thumbnail_url: c.thumbnail_url,
      parent_id: c.parent_id,
      products_count: c.products_count,
      subcategories_count: c.subcategories_count,
      lft: c.lft,
      rght: c.rght,
      tree_id: c.tree_id,
      level: c.level,
      created_at: c.created_at,
      updated_at: c.updated_at,
      product_type: c.product_type,
    }));

    consoleLog("Categories (level 0):", categories);

    return categories;
  } catch (err: any) {
    consoleLog("💥 Exception from getCategoryTreeByProduct", err);
    throw err;
  }
}
