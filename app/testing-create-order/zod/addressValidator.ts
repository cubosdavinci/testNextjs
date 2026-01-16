import { z } from "zod"
import { getAddress } from "ethers"

type AddressOptions = {
  allowZero?: boolean
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

export const addressValidator = (
  field: string,
  options: AddressOptions = {}
) =>
  z
    .string()
    .min(1, `${field} is required`)
    .refine((val) => {
      try {
        getAddress(val)
        return true
      } catch {
        return false
      }
    }, {
      message: `${field} must be a valid EVM address`,
    })
    .transform((val) => getAddress(val)) // normalize to checksum
    .refine((addr) => {
      if (options.allowZero === true) return true
      return addr !== ZERO_ADDRESS
    }, {
      message: `${field} can not be the zero address`,
    })
