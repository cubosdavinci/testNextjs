import { supabaseAdmin } from "@/lib/clients/supabaseAdmin";
import { consoleLog } from "@/lib/utils";
import { Category } from "@/types/db/categories";

export interface GetCategoryTreeBySlugVars {
  productType: string;
  catSlug?: string;
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
  consoleLog("⚠️ lib/public/categories/getCategoryTreeBySlug.ts");
  const { productType, catSlug } = vars;

  try {
    let parent: Category | null = null;
    let categories: Category[] = [];

    if (catSlug) {
      // 1️⃣ Fetch the selected category
      const { data: category, error: categoryError } = await supabaseAdmin
        .from("categories")
        .select("*")
        .eq("slug", catSlug)
        .single();

      if (categoryError) throw categoryError;
      if (!category) return { parent: null, tree: [] };

      parent = category;

      // 2️⃣ Fetch all descendants (children) of that category
      const { data: descendants, error: descendantsError } = await supabaseAdmin
        .from("categories")
        .select("*")
        .gte("lft", category.lft)
        .lte("rght", category.rght)
        .order("lft", { ascending: true });

      if (descendantsError) throw descendantsError;

      categories = descendants || [];
    } else {
      // 3️⃣ No slug → fetch all categories of the productType
      const { data: allCategories, error } = await supabaseAdmin
        .from("categories")
        .select("*")
        .eq("product_type", productType)
        .order("lft", { ascending: true });

      if (error) throw error;

      categories = allCategories || [];
    }

    consoleLog("Categories: ", categories)

    // 4️⃣ Build nested tree
    const tree = buildTree(categories, parent?.id ?? null);

    //consoleLog("parent category: ", parent)
    //consoleLog("tree: ", tree)

    return { parent, tree };
  } catch (err: any) {
    consoleLog("💥 Exception from getCategoryTreeBySlug", err);
    throw err;
  }
}
