// lib/db/products/types/CreateProductFileVars.ts
import { GoogleDriveMetadata } from "./GoogleDriveMetadata"; // Assuming you have this import

export interface CreateProductFileVars {
  productId: string; // ID of the associated product
  downloadLink: string;  // Assuming 'id' is the link to the file        
  software: string | undefined;
  fileMetadata: GoogleDriveMetadata; // Metadata of the file to be associated with the product
}
