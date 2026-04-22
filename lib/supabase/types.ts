import { STORAGE_PROVIDER, StorageProvider } from '@/types/db/product-files/StorageProvider';
import { ProductStatus } from '@/types/db/products/ProductStatus';
import { ProductType } from '@/types/db/products/ProductType';
import { LICENSE_DURATION, type LicenseDuration } from '@/types/db/product-licenses/LicenseDuration';
import type { Database } from '@/types/supabase';

// 1. Generic helpers (define once)
export type TableRow<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row'];

export type TableInsert<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Insert'];

export type TableUpdate<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Update'];

// 2. Specific named types (use these everywhere in your app)
export type ProductRow = TableRow<'products'>;
export type ProductInsert = TableInsert<'products'>;
export type ProductUpdate = TableUpdate<'products'>;

export type ProductCreateInput = Pick<ProductInsert,
    | "title"
    | "description"
    | "type"
    | "category_id"
    | "version"
    | "only_for_followers"
    | "tags"
    | "user_tags"
    >

export type ProductCreateInputExtended = ProductCreateInput & Pick<ProductInsert,
    | "creator_id"
    | "slug"
>

/*{
    version?: string;

    categoryId?: number;
    categoryName?: string;

    onlyForFollowers?: boolean;

    tags?: string[];
    userTags?: string[]; 
}*/


export type ProductFile = TableRow<'product_files'>;
export type ProductFileToCacheInput = Pick<
    ProductFile,
    | "id"
    | "file_id"
    | "linked_account_id"
    | "file_name"
    | "file_type"
    | "provider"
    | "file_size"
    >;

export type ProductFileInsert = TableInsert<'product_files'>;

export type ProductFileCreateInput = {
        provider: StorageProvider;
    } & Pick<ProductFileInsert,
        | "product_id"        
        | "provider_user_name"
        | "provider_metadata"
        | "file_name"
        | "file_type"
        | "file_size"
        | "file_checksum"
        | "file_hash"
        | "linked_account_id"
        | "file_id"
    >;

export type ProductFileUpdate = TableUpdate<'product_files'>;

/* Custom output type for supabase upload (to storage) file operations*/
export type UploadToStorageOutput = {
    path: string;
    url: string;
    contentType: string;
};

export type ProductLicense = TableRow<'product_licenses'>;
export type ProductLicenseInsert = TableInsert<'product_licenses'>;
export type ProductLicenseUpdate = TableUpdate<'product_licenses'>;
export type ProductLicenseCreateInput = Pick<ProductLicenseInsert,
    | "name"
    | "description"
    | "base_price_cents"
    | "max_license_users"
    | "max_user_devices"
    | "is_main"
    | "sort_order"
    > & {
        license_duration: LicenseDuration;    
    }

// ← This is what you asked for
export type ProductWithRelations = ProductRow & {
    files: ProductFile[];     // array because one product can have many files
    licenses: ProductLicense[]; // array because one product can have many licenses
};

export type CategoryDb = TableRow<'categories'>;



export type ExternalFileCacheRow = TableRow<'external_file_cache'>;

export type FileCacheSyncResult = Pick<
    ExternalFileCacheRow,
    "provider_file_id" |
    "storage_path" |
    "storage_url"
> & {
    externalFileCacheId: string; // external_file_cache.id
    productFileId: string;       // product_files.id

    status: "uploaded" | "skipped" | "failed";
    error?: string;
};