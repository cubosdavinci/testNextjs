import { STORAGE_PROVIDER, StorageProvider } from '@/types/db/product-files/StorageProvider';
import { ProductStatus } from '@/types/db/products/ProductStatus';
import { ProductType } from '@/types/db/products/ProductType';
import type { Database } from '@/types/supabase';

// 1. Generic helpers (define once)
export type TableRow<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row'];

export type TableInsert<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Insert'];

export type TableUpdate<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Update'];

// 2. Specific named types (use these everywhere in your app)
export type Product = TableRow<'products'>;
export type ProductInsert = TableInsert<'products'>;
export type ProductUpdate = TableUpdate<'products'>;

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
export type CreateProductFileInput = Omit<
    ProductFileInsert,
    | "id"
    | "product_id"
    | "file_cache_id"
    | "file_cache_expires_at"
    | "description"
    | "sort_order"
    | "created_at"
    | "updated_at"
    | "provider"
> & {
    provider: StorageProvider;
};


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

// ← This is what you asked for
export type ProductWithRelations = Product & {
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