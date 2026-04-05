import { z } from "zod";







export const validSubClassCats = [
  "men",
  "creatures",
  "windows",
  "doors",
  "floor",
  "abstract",
  "motion",
  "b-roll",
] as const;

export const subClassCatSchema = z.enum(validSubClassCats, {
  message: "Please select a valid subclass",
});