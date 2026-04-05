import { License } from "@/lib/db/licenses/types/License";

export interface CreateProductLicenseVars {   
    fileId: string;
    licenses: License[];
}