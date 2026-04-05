import { z } from "zod";
import { uuidSchema } from "../../zod/uuidSchema";

// Zod schema to validate the License object
export const LicenseSchema = z.object({
    fileId: uuidSchema, 
    price: z.number().min(0, "Price must be a positive number"),
    typeId: z.number().int(),
    typeName: z.string().min(1, "Type name is required"),
    region: z.string().min(1, "Region is required"),
    usersAllowed: z.number().int().min(1, "At least 1 user allowed"),
    devicesAllowed: z.number().int().min(1, "At least 1 device allowed"),
    validPeriod: z.string().min(1, "Valid period is required"),
    isMain: z.boolean(),
});
