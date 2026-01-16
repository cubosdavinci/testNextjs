import { z } from "zod"
import { fitsUint } from "./U_INT_MAX_VALUES"

export const TaxesSchema = z
  .string()
  .regex(/^\d+$/, "taxes field: Must be a base-10 integer string")
  .transform((val) => {
    const value = BigInt(val)

    if (!fitsUint(value, 256)) {
      throw new Error("taxes field: Does not fit uint256")
    }

    return value
  })
