// lib/db/categories/getCategoryAncestors.ts
import { supabaseAdmin } from "@/lib/clients/supabaseAdmin";

export async function getCategoryAncestors(categoryId: number) {
  const { data: cat, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("id", categoryId)
    .single();

  if (error) throw error;

  const { data: ancestors } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("product_type", cat.product_type)
    .lt("lft", cat.lft)
    .gt("rght", cat.rght)
    .order("lft");

  return [...ancestors, cat];
}
