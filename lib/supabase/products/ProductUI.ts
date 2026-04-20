// lib/supabase/products/ProductUI.ts
import { ProductStatus } from "@/types/db/products/ProductStatus";
import { ProductFile, ProductLicense, ProductWithRelations } from "../types";
import { ProductType } from "@/types/enums/ProductType";

class ProductUI implements ProductWithRelations {
    id: string;
    creator_id: string;
    category_id: number | null;
    title: string;
    slug: string;
    description: string | null;
    thumbnail_url: string | null;
    version: string | null;
    status: ProductStatus;
    type: ProductType;
    created_at: string;
    updated_at: string;
    files: ProductFile[];
    licenses: ProductLicense[];

    constructor(data: ProductWithRelations) {
        this.id = data.id;
        this.creator_id = data.creator_id;
        this.category_id = data.category_id;
        this.title = data.title;
        this.slug = data.slug;
        this.description = data.description;
        this.thumbnail_url = data.thumbnail_url;
        this.version = data.version;
        this.status = data.status;
        this.type = data.type;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.files = data.files;
        this.licenses = data.licenses;
    }

    get mainLicense() {
        return this.licenses.find(l => l.is_main) || this.licenses[0];
    }

    get priceRange() {
        if (!this.licenses.length) return null;
        const prices = this.licenses.map(l => Number(l.price_cents));
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    }
}