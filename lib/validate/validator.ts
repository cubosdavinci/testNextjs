// /lib/zod/validator.ts
import { z } from "zod";

// URL Validator
export const validator = {
  // URL validator that returns the validated URL or throws an exception if invalid
  url: (input: unknown) => {
    // Define the validation schema using Zod
    const schema = z
      .url("Invalid URL format");

    // Attempt to parse and validate the URL
    return schema.parse(input);  // If invalid, throws an exception
  },

  // Add more validators as needed
  email: (input: unknown) => {
    const schema = z
      .email("Invalid email format");

    return schema.parse(input);  // Throws exception if invalid
  },

  // Add a custom validator for a string (e.g., minimum length)
  minLength: (input: unknown, length: number) => {
    const schema = z
      .string()
      .min(length, `Input must be at least ${length} characters long`);

    return schema.parse(input);  // Throws exception if invalid
  },

  // Add other validators as required
  number: (input: unknown) => {
    const schema = z
      .number()
      .min(0, "Number must be positive")
      .max(1000, "Number is too large");

    return schema.parse(input);  // Throws exception if invalid
  },
};