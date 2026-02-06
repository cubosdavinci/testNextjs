import { z } from "zod/v4";
import { Iso8601DatetimeSchema } from "@/lib/zod/Iso8601DatetimeSchema"
import { OrderIdSchema } from "@/lib/zod/OrderIdSchema";
import { EthereumSignatureSchema } from "@/lib/zod/EthereumSignatureSchema";


export const ReleaseFundsMessageSchema = z.object({
  message: z.literal("Approve the release of your order funds — this action is free."),
  orderId: OrderIdSchema,
  signatureDateTime: Iso8601DatetimeSchema,
  signature: EthereumSignatureSchema,
});
