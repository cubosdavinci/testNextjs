import { z } from "zod";
import { UUIDToUint128Schema } from "./utils/SchemaUUIDToUint128";
import { ChainIdSchema } from "./utils/ChainIdSchema";
import { TotalSchema } from "./utils/TotalSchema";
import { TaxesSchema } from "./utils/TaxesSchema";
import { PlatformFeeSchema } from "./utils/PlatformFeeSchema";
import { uintTypeValidator } from "./uintTypeValidator";
import { addressValidator } from "./addressValidator";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const RawPaymentSchema = z.object({
  orderId: UUIDToUint128Schema,
  userId: z.string(),
  buyerAddress: addressValidator("buyerAddress"),
  sellerAddress: addressValidator("sellerAddress"),

  total: uintTypeValidator("total", 256),
  taxes: uintTypeValidator("taxes", 256),
  platformFee: uintTypeValidator("platformFee", 256),


  erc20Token: addressValidator("erc20Token"),
  erc20TokenDecimals: z.string(),
  erc20TokenSymbol: z.string(),

  chain_id: ChainIdSchema,
  escrow_contract: Web3AddressSchema,

  assetType: z.string(),
  assetSubtype: z.string(),

  product_title: z.string(),
});
