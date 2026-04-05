import { z } from "zod";

export const licuserspaidSchema = z.preprocess(
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
    .int({ message: "The users per license must be an integer value." })
    .min(1, { message: "There must be at least 1 user per license."})
    .max(5, { message: "The user limit per license for a paid membership is 5." })
);
