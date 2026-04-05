// /lib/products/validateProductData.ts
import { z } from "zod";
import { File } from "formidable";

export const ALLOWED_VIDEO_EXTENSIONS = ["mp4", "mov", "avi", "mkv", "webm"];
export const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];

// Utility validators for files
const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB

export const productDataSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  priceCents: z
    .number()
    .int()
    .nonnegative("Price must be 0 or greater"),
  currency: z.enum(["USD", "EUR"]),
  categoryId: z.string().uuid().optional(),
  license: z.enum([
    "Personal",
    "Commercial",
    "Royalty-Free",
    "Extended Commercial",
    "Editorial",
    "Educational",
    "Exclusive",
    "Limited Use",
    "Subscription-Based",
  ]),
  downloadLink: z.string().url().optional(),

  // Files
  thumbnailFile: z
    .any()
    .refine((file: File | undefined) => !!file, "Thumbnail is required")
    .refine(
      (file: File) =>
        ALLOWED_IMAGE_EXTENSIONS.includes(file.originalFilename?.split(".").pop()?.toLowerCase() || ""),
      `Thumbnail must be one of: ${ALLOWED_IMAGE_EXTENSIONS.join(", ")}`
    )
    .refine((file: File) => file.size <= MAX_IMAGE_SIZE, "Thumbnail must be <= 1MB"),

  imageFiles: z
    .array(z.any())
    .refine(
      (files: File[]) =>
        files.every((file) =>
          ALLOWED_IMAGE_EXTENSIONS.includes(
            file.originalFilename?.split(".").pop()?.toLowerCase() || ""
          )
        ),
      `Images must be one of: ${ALLOWED_IMAGE_EXTENSIONS.join(", ")}`
    )
    .refine((files: File[]) => files.every((f) => f.size <= MAX_IMAGE_SIZE), "Each image must be <= 1MB"),

  videoFiles: z
    .array(z.any())
    .refine(
      (files: File[]) =>
        files.every((file) =>
          ALLOWED_VIDEO_EXTENSIONS.includes(
            file.originalFilename?.split(".").pop()?.toLowerCase() || ""
          )
        ),
      `Videos must be one of: ${ALLOWED_VIDEO_EXTENSIONS.join(", ")}`
    )
    .refine((files: File[]) => files.every((f) => f.size <= MAX_VIDEO_SIZE), "Each video must be <= 10MB"),
});

export type ProductDataInput = z.infer<typeof productDataSchema>;
