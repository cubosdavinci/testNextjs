import { z } from "zod";
import { Web3AddressSchema } from "./Web3AddressSchema";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const RawPaymentSchema = z.object({
  orderId: z
    .string()
    .regex(UUID_REGEX, "Invalid UUID")
    .transform((uuid) => {
      const hex = uuid.replace(/-/g, "");
      return BigInt("0x" + hex); // uint128
    }),

  userId: z.string(),

  buyerAddress: Web3AddressSchema,
  sellerAddress: Web3AddressSchema,

  total: z.string().regex(/^\d+$/),
  taxes: z.string().regex(/^\d+$/),
  platformFee: z.string().regex(/^\d+$/),

  erc20Token: Web3AddressSchema,
  erc20TokenDecimals: z.string(),
  erc20TokenSymbol: z.string(),

  chain_id: z.string().regex(/^\d+$/),
  escrow_contract: z.string(),

  assetType: z.string(),
  assetSubtype: z.string(),

  product_title: z.string(),
});
