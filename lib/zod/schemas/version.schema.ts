// lib/zod/schemas/version.schema.ts
import { z } from "zod";
import { isVersion } from "@/lib/utils/validation/is-version";

/**
 * Creates a version validation schema.
 * @param isOptional - whether the field can be left empty/undefined (default: true)
 */
export const versionSchema = (isOptional: boolean = true) => {
    const baseSchema = z.string();

    const schema = isOptional ? baseSchema.optional() : baseSchema;

    return schema.superRefine((val, ctx) => {
        // If optional and value is empty/undefined, skip validation
        if (isOptional && (val === undefined || val === "")) return;

        // Otherwise, run version check
        if (!isVersion(val!)) {
            ctx.addIssue({
                code: "custom",
                message: `Invalid version number: (${val} is invalid).`,
            });
        }
    });
};