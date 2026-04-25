import { z } from "zod";

export const FileIdSchema = z
  .string()
  .min(10, "file_id is too short")
  .max(200, "file_id is too long")
  .regex(/^[A-Za-z0-9._-]+$/, "Invalid file_id format");