import { z } from "zod";
import { stripHtml } from "@/lib/utils/stripHtml"; // Importing the helper

const defaultTitleRegex = /^[A-Za-z0-9 .,:;!?'"()\[\]{}\-_%&@#*+=\/\\~]+$/;

export const descriptionSchema = (
  min: number = 5,
  max: number = 50,
  stripHtmlContent: boolean = false,
  regexExpression?: RegExp,
  errorMessage?: string
) =>
  z.preprocess(
    (val) => {
      if (typeof val !== "string") return val;

      let processedValue = val.trim();

      if (stripHtmlContent) {
        processedValue = stripHtml(processedValue);
      }

      return processedValue;
    },
    z
      .string()
      .min(min, { message: `Description must be at least ${min} characters` })
      .max(max, { message: `Description must be at most ${max} characters` })
      .regex(
        regexExpression || defaultTitleRegex,
        errorMessage || "Description contains invalid characters"
      )
  );