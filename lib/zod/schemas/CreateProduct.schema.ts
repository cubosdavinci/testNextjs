// lib/web3/wallets/db/types/NewWalletInput.Schema.ts
import { z } from "zod/v4"
import type { CreateProductInputExtended } from "@/lib/supabase/types";

export const myType: CreateProductInputExtended = {
    creator_id,
    title,
    description,
    type,
    category_id,
    version,
    only_for_followers,
    tags,
    user_tags,
    slug,
}
export const CreateProductSchema = z.object({
    tags: z.
        array(z.string())
        .optional(),

    creator_id: z
        .string()
        .superRefine((val, ctx) => {
            // optional extra checks, e.g., not empty or not all zeros
            if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(val) || val === "00000000-0000-0000-0000-000000000000") {
                ctx.addIssue({
                    code: "custom",
                    message: `You must be logged in to add a wallet. Invalid User Id: ${val === '' || val === undefined ? '(empty)' : val
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
            if (!validated) {
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


