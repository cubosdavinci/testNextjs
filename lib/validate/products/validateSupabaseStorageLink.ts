// lib/validate/products/validateSupabaseStorageLink
import { z } from "zod";

export const validateSupabaseStorageLink = z.preprocess(
  (val) => (typeof val === "string" ? val.trim() : val),
  z
    .string()
    .min(1, { message: "Storage URL is required" })
    .regex(
      /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/[^\/]+\/.+$/i,
      { message: "Invalid Supabase public storage URL" }
    )
);
