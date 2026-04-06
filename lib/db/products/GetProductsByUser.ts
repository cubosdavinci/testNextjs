import { supabaseClient as supabase } from "@/lib/supabase/clients/supabaseAdmin";
import { Product } from "@/types/db/products";

type SortField = "name" | "created_at" | "updated_at";

interface GetProductsByUserVars {
  creatorId: string;
  status?: "draft" | "published" | "archived";
  categoryId?: number | null;
  sort?: { field: "NAME" | "CREATED_AT" | "UPDATED_AT"; direction: "ASC" | "DESC" };
  limit?: number;
}

export async function GetProductsByUser(vars: GetProductsByUserVars) {

  console.log("Variables:", vars);
  try {
    const { creatorId, status, categoryId, sort, limit } = vars;

    let query = supabase
      .from("products")
      .select(`
        id,
        creator_id,
        name,
        description,
        thumbnail_url,
        category_id,
        category_name,
        status,
        created_at,
        updated_at
      `)
      .eq("creator_id", creatorId);

    // Optional filters
    if (status) query = query.eq("status", status);
    if (categoryId !== undefined && categoryId !== null) {
      query = query.eq("category_id", categoryId);
    }

    // Sort mapping
    if (sort?.field) {
      let column: SortField;

      switch (sort.field) {
        case "NAME":
          column = "name";
          break;
        case "CREATED_AT":
          column = "created_at";
          break;
        case "UPDATED_AT":
          column = "updated_at";
          break;
        default:
          column = "created_at";
      }

      query = query.order(column, { ascending: sort.direction === "ASC" });
    }

    if (limit) query = query.limit(limit);

    const { data: productsData, error: productsError } = await query;

    if (productsError) {
      return { error: productsError };
    }

    if (!productsData) {
      return { data: [] };
    }

    // ✅ MAP SNAKE_CASE → CAMELCASE
    const mappedProducts: Product[] = productsData.map((p) => ({
      id: p.id,
      creatorId: p.creator_id,
      categoryId: p.category_id,
      categoryName: p.category_name,
      name: p.name,
      description: p.description,
      thumbnailUrl: p.thumbnail_url,
      status: p.status,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      licenses: undefined, // Product allows licenses?: ProductLicense[]
    }));
    console.log("Products:", mappedProducts)
    return { data: mappedProducts };
  } catch (err: any) {
    return { error: { message: err.message } };
  }
}
