import { z } from "zod";

export function enumSchema<T extends Record<string, string>>(
  enumType: T,
  errorMessage?: string
) {
  const values = Object.values(enumType);

  return z
    .string()
    // Use superRefine to access the input 'val' and the validation context 'ctx'
    .superRefine((val, ctx) => {
      if (!values.includes(val)) {
        ctx.addIssue({
          code: "custom",
          message: `${errorMessage || "Invalid value"}, (${val} is invalid).`,
        });
      }
    })
    // Now transform the value
    .transform((val) => val as T[keyof T]);
}