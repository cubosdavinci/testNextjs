import { z } from "zod"
import { fitsUint } from "./U_INT_MAX_VALUES"

export const PlatformFeeSchema = z
  .string()
  .regex(/^\d+$/, "total field:: Must be a base-10 integer string")
  .transform((val) => {
    const value = BigInt(val)

    if (!fitsUint(value, 256)) {
      throw new Error("total field: Does not fit uint256")
    }

    return value
  })
