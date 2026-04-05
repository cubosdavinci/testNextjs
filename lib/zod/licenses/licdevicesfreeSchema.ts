import { z } from "zod";

export const licdevicesfreeSchema = z.preprocess(
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
    .int({ message: "The number of devices per user must be an integer." })
    .min(1, { message: "A free membership allows only 1 device per user." })
    .max(1, { message: "A free membership allows only 1 device per user." })
);
