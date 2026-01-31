import { z } from "zod/v4"
import { SUPPORTED_WALLET_PROVIDER_KEYS } from "../../types/SupportedWalletProviders"

export const NewWalletInputSchema = z.object({
    user_id: z
    .string()
    .superRefine((val, ctx) => {
      // optional extra checks, e.g., not empty or not all zeros
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(val) || val === "00000000-0000-0000-0000-000000000000") {
        ctx.addIssue({
          code: "custom",
          message: `You must be logged in to add a wallet. Invalid User Id: ${val}.`,
        });
      }
    }),

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
})/*.superRefine((obj, ctx) => {
    const errors: string[] = [];

    // Check each field individually
    if (!obj.user_id || obj.user_id === "00000000-0000-0000-0000-000000000000") {
      errors.push("Missing or invalid user_id");
    }

    if (!obj.wallet_provider || !SUPPORTED_WALLET_PROVIDER_KEYS.includes(obj.wallet_provider)) {
      errors.push("Missing or unsupported wallet_provider");
    }

    if (!obj.wallet_address || !/^0x[a-fA-F0-9]{40}$/.test(obj.wallet_address)) {
      errors.push("Missing or invalid wallet_address");
    }

    if (!obj.chain_id || !Number.isInteger(obj.chain_id) || obj.chain_id <= 0) {
      errors.push("Missing or invalid chain_id");
    }

    if (!obj.token_address || !/^0x[a-fA-F0-9]{40}$/.test(obj.token_address)) {
      errors.push("Missing or invalid token_address");
    }

    // If any errors, add one combined issue
    if (errors.length > 0) {
      ctx.addIssue({
        code: "custom",
        message: errors.join("\n"),
      });
    }
  });*/

