import { z } from "zod";
import { isUUID } from "@/lib/utils/validation"

export const uuidSchema = (message?: string, optional = false) => {
  const baseMessage = message ?? "Invalid uuid value";

  const schema = z.string().superRefine((val, ctx) => {
    const trimmed = val.trim();

    // ❌ Empty (after trimming)
    if (trimmed === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${baseMessage}: (empty)`,
      });
      return;
    }

    // ❌ Invalid UUID
    if (!isUUID(trimmed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${baseMessage}: ${val}`,
      });
    }
  });

  return optional ? schema.optional() : schema;
};