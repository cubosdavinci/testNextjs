

import type { Database } from "@/types/supabase";

export type DbProductType = Database["public"]["Enums"]["product_type"];

export const PRODUCT_TYPE = {
  Image: "Image",
  Video: "Video",
  Music: "Music",
  Apps: "Apps",
  Games: "Games",
  Courses: "Courses",
  EBooks: "E-Books",
  ABooks: "A-Books",
  Icons: "Icons",
  Vector: "Vector",
  Templates: "Templates",
  Fonts: "Fonts",
  ThreeD: "3D",
  ARVR: "AR/VR",
  IoT: "IoT",
  Technical: "Technical",
  Other: "Other",
} as const satisfies Record<string, DbProductType>;

export type ProductType =
  typeof PRODUCT_TYPE[keyof typeof PRODUCT_TYPE];