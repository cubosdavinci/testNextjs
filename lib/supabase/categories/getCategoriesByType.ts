import { supabaseAdmin } from "@/lib/supabase/clients/supabaseAdmin";
import { ProductType } from "@/types/db/products/ProductType";

export async function getCategoriesByType(productType: ProductType) {
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("product_type", productType)
    .order("lft", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "Failed to fetch categories");
  }

  return data ?? [];
}