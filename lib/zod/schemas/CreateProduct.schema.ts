// lib/web3/wallets/db/types/NewWalletInput.Schema.ts
import { z } from "zod/v4"
import type { ProductCreateInput } from "@/lib/supabase/types";
import { isUUID, isVersion } from "@/lib/utils/validation";
import { titleSchema } from "@/lib/zod/titleSchema";
import { descriptionSchema } from "../descriptionSchema";
import { enumSchema } from "../enumSchema";
import { PRODUCT_TYPE } from "@/types/db/products/ProductType";
import { versionSchema } from "./version.schema";
/*
export const myType: ProductCreateInput = {
    creator_id, slug, title, type, category_id, description, version,
    only_for_followers,
    tags,
    user_tags,
    thumbnail_url,

    Unrecognized keys: 
    "title", "description", "type", "version", "only_for_followers", "user_tags", "slug"
}*/


export const CreateProductSchema = z.object({
    tags: z
        .array(z.string())
        .optional(),
    user_tags: z
        .array(z.string())
        .optional(),
    version: versionSchema(true),
    type: enumSchema(PRODUCT_TYPE, "Please provide a valid product type"),
    
    
    title: titleSchema(5, 30),
    description: descriptionSchema(0,300, true),
    only_for_followers: z
        .boolean({ message: "Invalid value for only_for_followers" })
        /*.optional()*/,

    creator_id: z
        .string()
        .superRefine((val, ctx) => {
            // optional extra checks, e.g., not empty or not all zeros
            if (!isUUID(val)) {
                ctx.addIssue({
                    code: "custom",
                    message: `Invalid user id: ${val === '' || val === undefined ? '(empty)' : val
                        }.`,
                });
            }
        }
    ),

/*
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
    }*/
}).strict()


// THIS IS THE KEY:
// You don't need to manually write an interface anymore.
// This type is automatically generated from your schema's output.
//export type NewWalletInputType = z.infer<typeof NewWalletInputSchema>;


