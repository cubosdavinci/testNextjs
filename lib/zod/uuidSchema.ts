// lib/zod/uuidSchema.ts
import { z } from "zod";

// Regular expression for validating UUIDs (version 4)
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const uuidSchema = z
  .string()
  .regex(uuidRegex, { message: "Invalid UUID format" })
  .min(36, { message: "UUID is too short" })
  .max(36, { message: "UUID is too long" });