// lib/zod/licenses/licenseSchema.ts
// enums
import { CurrencyCodeEnum } from "@/lib/db/licenses/types/enums/CurrencyCodeEnum";
import { CurrencySymEnum } from "@/lib/db/licenses/types/enums/CurrencySymEnum";
import { MembershipEnum } from "@/lib/enum/MembershipEnum";
import { RegionEnum } from "@/lib/db/licenses/types/enums/RegionEnum";
import { ValidPeriodEnum } from "@/lib/db/licenses/types/enums/ValidPeriodEnum";
// schemas
import { z } from "zod/v4";
import { licpricefreeSchema } from "@/lib/zod/licenses/licpricefreeSchema";
import { licpricepaidSchema } from "@/lib/zod/licenses/licpricepaidSchema";
import { enumSchema } from "../enumSchema";
import { uuidSchema } from "../uuidSchema";
import { timestampZoneSchema } from "../timestampZoneSchema";
import { licusersfreeSchema } from "./licusersfreeSchema";
import { licuserspaidSchema } from "./licuserspaidSchema";
import { licdevicesfreeSchema } from "./licdevicesfreeSchema";
import { licdevicespaidSchema } from "./licdevicespaidSchema";
import { regionSchema } from "./regionSchema";
// Zod schema to validate the License object
export const licenseSchema = (
    membership: MembershipEnum = MembershipEnum.Free,
    userRegion: RegionEnum,
) =>z.object({
    id: uuidSchema.optional(),          // optional
    fileId: uuidSchema.optional(),      // optional
    price: membership === MembershipEnum.Free ? licpricefreeSchema : licpricepaidSchema,
    typeId: z.int("Invalid license type id"),
    typeName: z.string().min(1, "Invalid license type name"),
    region: regionSchema(membership, userRegion),
    usersAllowed: membership === MembershipEnum.Free ? licusersfreeSchema : licuserspaidSchema,
    devicesAllowed: membership === MembershipEnum.Free ? licdevicesfreeSchema : licdevicespaidSchema,
    validPeriod: enumSchema(ValidPeriodEnum),
    isMain: z.boolean(),
    shortDescription: z.string().optional(),
    fullDescription: z.string().optional(),
    currencyCode: enumSchema(CurrencyCodeEnum).optional(),     // optional
    currencySym: enumSchema(CurrencySymEnum).optional(),       // optional
    createdAt: timestampZoneSchema.optional(),                 // optional
    updatedAt: timestampZoneSchema.optional(),                 // optional
});
