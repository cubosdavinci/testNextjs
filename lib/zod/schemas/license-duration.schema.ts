import { LICENSE_DURATION_META, LicenseDuration } from "@/types/db/product-licenses/LicenseDuration";
import { z } from "zod/v4";

export const LicenseDurationSchema = z.enum(
    Object.keys(LICENSE_DURATION_META) as [LicenseDuration, ...LicenseDuration[]]
);