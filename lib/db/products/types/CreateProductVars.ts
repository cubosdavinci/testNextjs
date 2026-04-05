import { ProdType } from "@/types/db/products";
import { GoogleDriveMetadata } from "./GoogleDriveMetadata";
import { License } from "@/lib/db/licenses/types/License";

export interface CreateProductVars {
  creatorId?: string;   // DB Required, added in server side (route handler)
  title: string;        // DB Required, added in client side (browser)
  slug?: string;        // DB Required, added in server side (route handler)
  description?: string | undefined;   // DB Optional, added in client side (browser)
  type: ProdType;       // DB Required, added in client side (browser)
  categoryId: number | null;    // DB Required, added in client side (browser)
  thumbnailUrl?: string;        // DB Rquires, added in server side (route handler)
  version?: string;
  downLink: string
  fileMetadata?: GoogleDriveMetadata; // <-- added
  licenses?: License[];
  thumbnailFile?: File | null;       // optional
}