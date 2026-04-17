import { supabaseAdmin } from "@/lib/supabase/clients/supabaseAdmin";
import { consoleLog } from "@/lib/utils";
import { CategorySubTreeResult, Category } from "@/types/db/categories";
import { ProductType } from "@/types/db/products/ProductType";

export interface GetCategorySubTreeVars {
  productType: ProductType; // required
  catId: number;       // required, fetch specific category by ID
}

export async function getCategorySubTree(
  vars: GetCategorySubTreeVars
): Promise<CategorySubTreeResult & { ancestor?: Category }> {
  consoleLog("⚠️ lib/public/categories/getCategorySubTree.ts");
  const { productType, catId } = vars;

  if (!productType || !catId) {
    throw new Error("Both productType and catId are required.");
  }

  try {
    // 1️⃣ Fetch the selected category by ID
    const supabase = supabaseAdmin
    const { data: parentCategory, error: categoryError } = await supabase()
      .from("categories")
      .select("*")
      .eq("id", catId)
      .eq("product_type", productType)
      .single();

    if (categoryError) throw categoryError;
    if (!parentCategory) throw new Error("Category not found");

    // 2️⃣ Fetch all descendants
    const { data: descendants, error: descendantsError } = await supabase()
      .from("categories")
      .select("*")
      .eq("product_type", productType)
      .gte("lft", parentCategory.lft)
      .lte("rght", parentCategory.rght)
      .order("lft", { ascending: true });

    if (descendantsError) throw descendantsError;

    const filteredDescendants = (descendants || []).filter((c) => c.id !== catId);

    // 3️⃣ Fetch the direct ancestor (parent of the parentCategory)
    let ancestor: Category | undefined = undefined;
    if (parentCategory.parent_id) {
      const { data: ancestorData, error: ancestorError } = await supabase()
        .from("categories")
        .select("*")
        .eq("id", parentCategory.parent_id)
        .eq("product_type", productType)
        .single();

      if (ancestorError) throw ancestorError;
      ancestor = ancestorData || undefined;
    }

    consoleLog("Ancestor:", ancestor);
    consoleLog("Parent Category:", parentCategory);
    consoleLog("Descendants:", filteredDescendants);

    return { ancestor, parentCategory, descendants: filteredDescendants };
  } catch (err: any) {
    consoleLog("💥 Exception from getCategorySubTree", err);
    throw err;
  }
}
