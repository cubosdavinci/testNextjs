import { z } from "zod"
import { fitsUint } from "./utils/U_INT_MAX_VALUES"

/**
 * Generic validator for unsigned integers (uint)
 * @param field - field name for error messages
 * @param bits - bit-width (8, 128, 256, etc.)
 * @param positiveOnly - enforce >0 if true (default false)
 */
export const uintTypeValidator = (
  field: string,
  bits: 8 | 16 | 32 | 64 | 128 | 256,
  positiveOnly = true
) =>
  z
    .string()
    .regex(/^\d+$/, `${field} must be a base-10 integer string`)
    .transform((val) => {
      const value = BigInt(val)

      if (!fitsUint(value, bits)) {
        throw new Error(`${field} does not fit uint${bits}`)
      }

      if (positiveOnly && value <= 0n) {
        throw new Error(`${field} must be greater than zero`)
      }

      return value
    })
