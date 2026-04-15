

import type { Database } from "@/types/supabase";

export type DbProductStatus = Database["public"]["Enums"]["product_status"];

export const PRODUCT_STATUS = {
    DRAFT: "Draft",
    PUBLISHED: "Published",
    UNPUBLISHED: "Unpublished",
    TEMP_UNAVAILABLE: "Temporarily Unavailable",
    RESTRICTED: "Restricted",
    ARCHIVED: "Archived",
} as const satisfies Record<string, DbProductStatus>;

export type ProductStatus =
    typeof PRODUCT_STATUS[keyof typeof PRODUCT_STATUS];