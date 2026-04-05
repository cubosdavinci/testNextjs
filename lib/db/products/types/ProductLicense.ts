export interface ProductLicense {
  id: string;                  // UUID
  productId: string;          // UUID of the product
  licenseType: number;        // license type ID
  licenseName?: string | null; // denormalized license name
  priceCents: number;         // BIGINT
  currency: string;            // e.g., 'USD'
  isMain?: boolean;           // optional, defaults to false
  max_downloads?: number | null;
  validity?: number | null;    // duration in days
  expirationDate?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}