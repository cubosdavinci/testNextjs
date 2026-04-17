// lib/db/licenses/types/License.ts
// Enums Type
import { RegionEnum } from "@/lib/db/licenses/types/enums/RegionEnum";
import { ValidPeriodEnum } from "@/lib/db/licenses/types/enums/ValidPeriodEnum";
import { CurrencyCodeEnum } from "./enums/CurrencyCodeEnum";
import { CurrencySymEnum } from "./enums/CurrencySymEnum";
/**
 * Represents a product license. Matches all fields (16) in "ProductLicenses" table.
 */
export interface License {
    id?:string              // (PK) optional
    fileId?: string;        // (FK) optional   
    typeId: string;
    typeName: string;
    price: number;
    region: RegionEnum;
    usersAllowed: number;
    devicesAllowed: number;
    validPeriod: ValidPeriodEnum;
    isMain: boolean;
    shortDescription?: string;  // optional
    fullDescription?: string;   // optional
    currencyCode?: CurrencyCodeEnum;    // optional
    currencySym?: CurrencySymEnum;      // optional
    createdAt?: Date;       // optional
    updatedAt?: Date;       // optional
}
