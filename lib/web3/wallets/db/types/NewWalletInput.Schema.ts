// lib/web3/wallets/db/types/NewWalletInput.Schema.ts
import { z } from "zod/v4"
import { SUPPORTED_WALLET_PROVIDER_KEYS } from "../../types/SupportedWalletProviders"
import { getTokenSym } from "../../types/SupportedBNetworks";
import { Web3AddressSchema } from "@/lib/zod/Web3AddressSchema";
export const NewWalletInputSchema = z.object({
    user_id: z
    .string()
    .superRefine((val, ctx) => {
      // optional extra checks, e.g., not empty or not all zeros
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(val) || val === "00000000-0000-0000-0000-000000000000") {
        ctx.addIssue({
          code: "custom",
          message: `You must be logged in to add a wallet. Invalid User Id: ${
  val === '' || val === undefined ? '(empty)' : val
}.`,
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
  try {
    const validated = Web3AddressSchema.parse(val);
    if (!validated){
          ctx.addIssue({
      code: "custom",
      message: `Wallet Address can''t be empty`,
    });
    }
  } catch (err: any) { // TypeScript requires 'any' here
    ctx.addIssue({
      code: "custom",
      message: err.issues[0].message,
    });
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
  }).transform((val) => val.toLowerCase())
  ,
  token_sym: z.string()
}).superRefine((data, ctx) => {
    const { chain_id, token_address, token_sym } = data

    const sym = getTokenSym(chain_id, token_address)

    if (!sym || sym !== token_sym) {
      ctx.addIssue({
        path: ["token_sym"],
        code: "custom",
        message: `Invalid token symbol '${token_sym}'`,
      })
    }
}).strict()
  
// THIS IS THE KEY:
// You don't need to manually write an interface anymore.
// This type is automatically generated from your schema's output.
export type NewWalletInputType = z.infer<typeof NewWalletInputSchema>;

/*/*.superRefine((obj, ctx) => {
  // Validate user_id
  if (!obj.user_id || obj.user_id === "00000000-0000-0000-0000-000000000000") {
    ctx.addIssue({
      code: "custom",
      message: "Missing or invalid user_id",
      path: ["user_id"],
    });
  }

  // Validate wallet_provider
  if (!obj.wallet_provider || !SUPPORTED_WALLET_PROVIDER_KEYS.includes(obj.wallet_provider)) {
    ctx.addIssue({
      code: "custom",
      message: "Missing or unsupported wallet_provider",
      path: ["wallet_provider"],
    });
  }

  // Validate wallet_address
  if (!obj.wallet_address || !/^0x[a-fA-F0-9]{40}$/.test(obj.wallet_address)) {
    ctx.addIssue({
      code: "custom",
      message: "Missing or invalid wallet_address",
      path: ["wallet_address"],
    });
  }

  // Validate chain_id
  if (!obj.chain_id || !Number.isInteger(obj.chain_id) || obj.chain_id <= 0) {
    ctx.addIssue({
      code: "custom",
      message: "Missing or invalid chain_id",
      path: ["chain_id"],
    });
  }

  // Validate token_address
  if (!obj.token_address || !/^0x[a-fA-F0-9]{40}$/.test(obj.token_address)) {
    ctx.addIssue({
      code: "custom",
      message: "Missing or invalid token_address",
      path: ["token_address"],
    });
  }
});*/



