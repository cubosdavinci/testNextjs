import { supabaseAdmin } from "@/lib/clients/supabaseAdmin";
import { consoleLog } from "@/lib/utils";
import { Category } from "@/types/db/categories";

export interface GetCategoryTreeBySlugVars {
  productType: string; // required
  catSlug?: string;    // optional
}

// Helper to build nested tree from flat array
function buildTree(categories: Category[], parentId: number | null = null): Category[] {
  return categories
    .filter(c => c.parent_id === parentId)
    .map(c => ({
      ...c,
      subcategories: buildTree(categories, c.id),
    }));
}

export async function getCategoryTreeBySlug(vars: GetCategoryTreeBySlugVars) {
  consoleLog("⚠️ lib/public/categories/getCategoryTreeBySlug.ts")
  const { productType, catSlug } = vars;

  try {
    if (catSlug) {
      // 1. Fetch the selected category
      const { data: category, error: categoryError } = await supabaseAdmin
        .from ("categories")
        .select("*")
        .eq("slug", catSlug)
        .single();

      if (categoryError) throw categoryError;
      if (!category) return { parent: null, tree: [] };

      // 2. Fetch ALL descendant categories (subtree)
      const { data: descendants, error: descendantsError } = await supabaseAdmin
        .from ("categories")
        .select("*")
        .gte("lft", category.lft)
        .lte("rght", category.rght)
        .order("lft", { ascending: true });

      if (descendantsError) throw descendantsError;

      // 3. Build nested tree
      const tree = buildTree(descendants, category.id);

      return { parent: category, tree };
    } else {
      // Fetch top-level categories (level = 0) for productType
      const { data: topCategories, error } = await supabaseAdmin
        .from ("categories")
        .select("*")
        .eq("product_type", productType)
        .eq("level", 0)
        .order("lft", { ascending: true });

      if (error) throw error;
      
      consoleLog("Top Categories:", topCategories);


      // Build tree from top-level categories
      const tree = buildTree(topCategories, null);

      return { parent: null, tree };
    }
  } catch (err: any) {
    consoleLog("💥 Exception tree:", err);
    return { parent: null, tree: [] };
  }
}
