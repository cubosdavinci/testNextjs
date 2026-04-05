import { z } from "zod";

export const licdevicespaidSchema = z.preprocess(
  (val) => {
    // Ensure the value is an integer
    let num = typeof val === "string" ? parseInt(val.trim(), 10) : val;
    if (typeof num === "number" && !isNaN(num)) {
      return num; // return integer value
    }
    return val;
  },
  z
    .number()
    .int({ message: "The devices per user must be an integer value." })
    .min(1, { message: "There must be at least 1 device per user"})
    .max(3, { message: "The devices per user limit for a paid membership is 3." })
);
