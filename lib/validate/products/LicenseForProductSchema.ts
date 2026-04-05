import { z } from "zod";

export const LicenseForProductSchema = z.object({
  typeId: z.number(),
  typeName: z.string(),
  price: z.number(),
  isMain: z.boolean(),
});