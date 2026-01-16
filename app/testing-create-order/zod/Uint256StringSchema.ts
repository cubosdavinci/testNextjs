import z from "zod"

const UINT256_MAX = (1n << 256n) - 1n

export const Uint256StringSchema = z
  .string()
  .regex(/^\d+$/, "Must be a base-10 integer string")
  .refine((val) => {
    try {
      const n = BigInt(val)
      return n >= 0n && n <= UINT256_MAX
    } catch {
      return false
    }
  }, {
    message: "Value must fit into uint256",
  })
