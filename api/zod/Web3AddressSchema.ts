import { z } from "zod";
import { getAddress } from "ethers";

export const Web3AddressSchema = z
  .string()
  .trim()
  .optional()
  .refine((addr) => {
    if (!addr) return true; // allow undefined or ""
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  }, {
    message: "Invalid Web3 address (must be 20 bytes hex with 0x prefix)",
  })
  .refine((addr) => {
    if (!addr) return true;
    try {
      getAddress(addr); // validates checksum
      return true;
    } catch {
      return false;
    }
  }, {
    message: "Invalid Ethereum address checksum",
  })
  .transform((addr) => addr?.toLowerCase()); // <-- convert to lowercase
