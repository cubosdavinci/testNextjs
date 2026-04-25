import { z } from "zod/v4";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugSchema = () =>
  z.preprocess(
    (val) => {
      if (typeof val !== "string") return val;

      const processed = val.trim();

      // Treat empty string as missing
      return processed === "" ? undefined : processed;
    },
    z
      .string()
      .min(1, { message: "Slug is required" })
      .max(200, { message: "Slug must be at most 50 characters" })
      .regex(SLUG_REGEX, {
        message:
          "Slug must be lowercase, alphanumeric, and can include hyphens (no leading, trailing, or consecutive hyphens)",
      })
  );