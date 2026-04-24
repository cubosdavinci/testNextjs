import { z } from "zod/v4";

// Generic function to validate any enum type
export function enumSchema<EnumType extends { [key: string]: string }>(
  enumType: EnumType,
  errorMessage?: string
) {
  return z
    .string()
    .refine((val) => Object.values(enumType).includes(val), {
      message: errorMessage || "Invalid value for Enum type",
    })
    // Transform the string value to the corresponding enum value
    .transform((val) => {
      // Return the enum value directly instead of just a string
      return enumType[val as keyof EnumType];
    });
}
