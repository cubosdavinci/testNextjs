import { z } from "zod";
import { UUIDToUint128Schema } from "./utils/SchemaUUIDToUint128";
import { ChainIdSchema } from "./utils/ChainIdSchema";
import { validateUINType } from "./validateUINType";
import { validateAddress } from "./validateAddress";
import { validateEnum } from "./validateEnum";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const OrderEscrowSchema = z.object({
  orderId: UUIDToUint128Schema,
  userId: z.string(),
  buyerAddress: validateAddress("buyerAddress"),
  sellerAddress: validateAddress("sellerAddress"),

  total: validateUINType("total", 256),
  taxes: validateUINType("taxes", 256),
  platformFee: validateUINType("platformFee", 256),


  erc20Token: validateAddress("erc20Token"),
  erc20TokenDecimals: validateUINType("total", 8),
  erc20TokenSymbol: validateEnum("erc20TokenSymbol", ["USDC", "USDT", "DAI"]),

  chainId: ChainIdSchema,
  escrowContract: validateAddress("escrow_contract"),

  assetType: z.string(),
  assetSubtype: z.string(),

  productTitle: z.string(),
});
