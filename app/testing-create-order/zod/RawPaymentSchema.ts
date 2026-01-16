import { z } from "zod";
import { Web3AddressSchema } from "./Web3AddressSchema";
import { UUIDToUint128Schema } from "./UUIDToUint128Schema";
import { ChainIdSchema } from "./ChainIdSchema";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const RawPaymentSchema = z.object({
  orderId: UUIDToUint128Schema,
  userId: z.string(),

  buyerAddress: Web3AddressSchema,
  sellerAddress: Web3AddressSchema,

  total: Uint256StringSchema,
  taxes: Uint256StringSchema,
  platformFee: Uint256StringSchema,

  erc20Token: Web3AddressSchema,
  erc20TokenDecimals: z.string(),
  erc20TokenSymbol: z.string(),

  chain_id: ChainIdSchema,
  escrow_contract: Web3AddressSchema,

  assetType: z.string(),
  assetSubtype: z.string(),

  product_title: z.string(),
});
