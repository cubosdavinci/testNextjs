import { z } from "zod/v4";

// Regex to match ISO 8601 with time zone
const iso8601WithTimezoneRegex = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})\.(\d{3})(([+-]\d{2}:\d{2})|Z)$/;

export const timestampZoneSchema = z
  .string()
  .refine((value) => iso8601WithTimezoneRegex.test(value), {
    message: "Invalid date format. Expected ISO 8601 with timezone (e.g., 2023-12-31T12:00:00.000+00:00)",
  })
  .transform((value) => new Date(value));  // Convert string to Date object
