import { z } from 'zod';

// Regex pattern for ISO 8601 format
const iso8601Regex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d{3})?Z$/;

// Zod schema that validates an ISO 8601 datetime string
export const Iso8601DatetimeSchema = z.string().regex(iso8601Regex, {
  message: "Invalid ISO 8601 datetime format",
});