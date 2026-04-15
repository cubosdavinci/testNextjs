import { ProductType } from "@/types/db/products/ProductType";
import { ProductStatus } from "@/types/db/products/ProductStatus";
import { ProductRowSchema, ProductRowType } from "./ProductRow.Schema";

export class ProductRow implements ProductRowType {
    readonly id: string;
    readonly creator_id: string;
    readonly title: string;
    readonly description: string | null;
    readonly type: ProductType; // Replace with your actual type import
    readonly status: ProductStatus; // Replace with your actual status import
    readonly slug: string;
    readonly label: string;
    readonly thumbnail_url: string;
    readonly version: string | null;
    readonly creator_is_suspended: boolean | null;
    readonly creator_is_banned: boolean | null;
    readonly creator_has_membership: boolean | null;
    readonly only_for_followers: boolean | null;
    readonly category_id: number;
    readonly category_name: string;
    readonly created_at: string | null;
    readonly updated_at: string | null;
    readonly is_active: boolean;
    readonly is_published: boolean;
    readonly tags: string[] | null;
    readonly user_tags: string[] | null;

    constructor(data: ProductRowType) {
        // 1. Validate input
        const validated = ProductRowSchema.parse(data);

        // 2. Explicit Assignment
        this.id = validated.id;
        this.creator_id = validated.creator_id;
        this.title = validated.title;
        this.description = validated.description;
        this.type = validated.type;
        this.status = validated.status;
        this.slug = validated.slug;
        this.label = validated.label;
        this.thumbnail_url = validated.thumbnail_url;
        this.version = validated.version;
        this.creator_is_suspended = validated.creator_is_suspended;
        this.creator_is_banned = validated.creator_is_banned;
        this.creator_has_membership = validated.creator_has_membership;
        this.only_for_followers = validated.only_for_followers;
        this.category_id = validated.category_id;
        this.category_name = validated.category_name;
        this.created_at = validated.created_at;
        this.updated_at = validated.updated_at;
        this.is_active = validated.is_active;
        this.is_published = validated.is_published;
        this.tags = validated.tags;
        this.user_tags = validated.user_tags;
    }

    static fromValidated(data: ProductRowType): ProductRow {
        // A faster way to create an instance without running Zod again
        const instance = Object.create(ProductRow.prototype);
        return Object.assign(instance, data);
    }

    toJSON(): ProductRowType {
        // Returns a plain object matching the Type
        return { ...this };
    }

    toJSONString(): string {
        return JSON.stringify(this.toJSON());
    }
}