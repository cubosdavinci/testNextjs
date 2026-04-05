import { z } from "zod";
import { RegionEnum } from "@/lib/db/licenses/types/enums/RegionEnum"
import { MembershipEnum } from "@/lib/enum/MembershipEnum";


// Custom region validator function
export function regionSchema(membership: MembershipEnum, userRegion: RegionEnum ) {
  return z
    .string()
    .refine((value) => Object.values(RegionEnum).includes(value as RegionEnum), {
      message: "Invalid region. The value must be one of the valid regions.",
    })
    .transform((value) => value as RegionEnum) // Ensure value is transformed into RegionEnum
    .refine((value) => {
      // If membership is Free, enforce that the value matches the userRegion
      if (membership === MembershipEnum.Free && value !== userRegion) {
        return false; // Validation fails if the region doesn't match the userRegion for free membership
      }
      return true; // If membership is not Free, any region is allowed
    }, {
      message: `Free memberships can only sell products in their country (${userRegion}).`,
    });
}