import { z } from "zod";

export const licpricepaidSchema = z.preprocess(
  (val) => {
    let num = typeof val === "string" ? parseFloat(val.trim()) : val;
    if (typeof num === "number" && !isNaN(num)) {
      // Round to 2 decimal places
      return Math.round(num * 100) / 100;
    }
    return val;
  },
  z
    .number()
    .min(0, { message: "The price must be at least $0 USD" }) // Allow 0 as a valid price
    .max(200, { message: "The max price limit for a paid membership is $200 USD." })
    .refine(value => value >= 0 && (value === 0 || value >= 5), {
      message: "For paid products, the minimum price must be $5.",
    })
);
