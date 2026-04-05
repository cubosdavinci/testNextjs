import { sanitizeProductDescription } from "@/lib/helpers/sanitizeProductDescription";
import { z } from "zod";



// Regex for Base64 validation
const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;

// Regex for Product Type
const productTypeRegex = /^(UHJvZHVjdFR5cGU6Mjk=|UasvZHVjdFR5cGU6Mjk=)$/;


// Schema for URLs starting with https://drive.google.com/file
const googleDriveFileUrlSchema = z.url()
  .refine(
    (url) => url.startsWith("https://drive.google.com/file"),
    { message: "URL must start with https://drive.google.com/file" }
  );

  // Schema for the Single Digital Product
export const createSingleDigitalSchema = z.object({
  productType: z
  .string()
  .regex(productTypeRegex, "Invalid Product Type"),

  productOwner: z
    .string()
    .min(1, "Product owner is required")
    .max(255, "Product owner must be at most 255 characters")
    .regex(base64Regex, "Product owner must be in Base64 format"),

  title: 
  
    price: z.preprocess(
    (val) => {
      let num = typeof val === "string" ? parseFloat(val) : val;
      if (typeof num === "number") {
        // Round to 3 decimal places
        return Math.round(num * 100) / 100;
      }
      return val;
    },
    z
      .number()
      .min(5, { message: "Price must be at least 5" })
      .max(20, { message: "Price must be at most 20" })
  ),

  productDescription: z
  .string()
  .min(1, "Description is required")
  .max(500, "Description is too long")
  .refine(
    (val) => {
      const sanitized = sanitizeProductDescription(val);
      // Example: fail if sanitization removes everything
      return sanitized.trim().length > 0;
    },
    { message: "Description contains invalid content" }
  )
  .transform((val) => sanitizeProductDescription(val)),
  
  thumbnailUrl: googleDriveFileUrlSchema,

  downloadLink: googleDriveFileUrlSchema,

});

// Type for the form data
export type FormData = z.infer<typeof createSingleDigitalSchema>;
