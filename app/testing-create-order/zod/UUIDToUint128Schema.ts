import { z } from "zod";
import { fitsUint } from "./U_INT_MAX_VALUES";

const UINT128_MAX = (BigInt(1) << BigInt(128)) - BigInt(1)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  export const UUIDToUint128Schema = z
  .string()
  .regex(UUID_REGEX, "Invalid UUID")
  .transform((uuid) => {
    const hex = uuid.replace(/-/g, "")
    const value = BigInt("0x" + hex)
    if (!fitsUint(value, 128)) throw new Error("Does not fit uint128")

      return value
  })
