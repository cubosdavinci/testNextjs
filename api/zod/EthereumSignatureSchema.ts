import { z } from "zod";

export const EthereumSignatureSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{130}$/)
  .refine((sig) => {
    const v = parseInt(sig.slice(-2), 16);
    return v === 27 || v === 28 || v === 0 || v === 1;
  }, "Invalid signature recovery byte");
