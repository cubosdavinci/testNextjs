import { z } from "zod"
import { getAddress } from "ethers"

export const Web3AddressSchema = z
  .string()
  .refine((val) => {
    try {
      getAddress(val)
      return true
    } catch {
      return false
    }
  }, {
    message: "Invalid EVM address (bad format or checksum)",
  })
  .transform((val) => getAddress(val)) // normalize to checksum
