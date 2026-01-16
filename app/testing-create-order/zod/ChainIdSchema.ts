import { z } from "zod"
import { fitsUint } from "./U_INT_MAX_VALUES"

export const ChainIdSchema = z
  .string()
  .regex(/^\d+$/, "Invalid chain ID")
  .transform((val) => {
    const n = BigInt(val)

    if (!fitsUint(n, 256)) {
      throw new Error("Does not fit uint256")
    }

    if (n <= BigInt(0)) {
      throw new Error("chain_id must be > 0")
    }

    return n
  })
