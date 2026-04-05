import { z } from "zod";

// Default regex: standard title characters
const defaultTitleRegex =
  /^[A-Za-z0-9 .,:;!?'"()\[\]{}\-_%&@#*+=\/\\~]+$/;

/**
 * Returns a Zod schema for a generic title with optional min/max length
 * and a customizable regex pattern and error message.
 *
 * @param min - minimum length (default 1)
 * @param max - maximum length (default 50)
 * @param regexExpression - optional custom regex (default allows standard title characters)
 * @param errorMessage - optional custom error message for regex validation
 */
export const titleSchema = (
  min: number = 5,
  max: number = 50,
  regexExpression?: RegExp,
  errorMessage?: string
) =>
  z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z
      .string()
      .min(min, { message: `Title must be at least ${min} characters` })
      .max(max, { message: `Title must be at most ${max} characters` })
      .regex(
        regexExpression || defaultTitleRegex,
        errorMessage || "Title contains invalid characters"
      )
  );
