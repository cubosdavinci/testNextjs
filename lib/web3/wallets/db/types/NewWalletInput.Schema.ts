import { z } from "zod/v4"
import { SUPPORTED_WALLET_PROVIDER_KEYS } from "../../../SupportedWalletProviders"

export const NewWalletInputSchema = z.object({
  wallet_provider: z.enum(SUPPORTED_WALLET_PROVIDER_KEYS).superRefine(
    (val, ctx) => {
      if (!SUPPORTED_WALLET_PROVIDER_KEYS.includes(val)) {
        ctx.addIssue({
          code: "custom",
          message: `Unsupported wallet provider: ${val}. Allowed: ${SUPPORTED_WALLET_PROVIDER_KEYS.join(", ")}`,
        })
      }
    }
  ),

  wallet_address: z.string().superRefine((val, ctx) => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(val)) {
      ctx.addIssue({
        code: "custom",
        message: `Invalid wallet address: ${val}`,
      })
    }
  }),

  chain_id: z.number().superRefine((val, ctx) => {
    if (!Number.isInteger(val) || val <= 0) {
      ctx.addIssue({
        code: "custom",
        message: `Invalid chain_id: ${val}`,
      })
    }
  }),

  token_address: z.string().superRefine((val, ctx) => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(val)) {
      ctx.addIssue({
        code: "custom",
        message: `Invalid token address: ${val}`,
      })
    }
  }),
})
