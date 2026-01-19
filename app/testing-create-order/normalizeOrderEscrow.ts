import type { EscrowOrderPayloadEIP712, EscrowOrderEIP712Serializable } from "./types/EscrowOrderPayloadEIP712Types"
import { OrderEscrowSchema } from "./zod/OrderEscrowSchema"

export function normalizeOrderEscrow(
  raw: unknown,
  serializable: true
): EscrowOrderEIP712Serializable;

export function normalizeOrderEscrow(
  raw: unknown,
  serializable?: false
): EscrowOrderPayloadEIP712;

export function normalizeOrderEscrow(
  rawJson: unknown,
  serializable = false
){
  const data = OrderEscrowSchema.parse(rawJson);

  const orderId = BigInt(data.orderId);
  const total = BigInt(data.total);
  const taxes = BigInt(data.taxes);
  const platformFee = BigInt(data.platformFee);
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1h

  return  Object.freeze({
    orderId: serializable ? orderId.toString() : orderId,
    buyer: String(data.buyerAddress),
    seller: String(data.sellerAddress),
    paymentToken: String(data.erc20Token),
    total: serializable ? total.toString() : total,
    taxes: serializable ? taxes.toString() : taxes,
    platformFee: serializable ? platformFee.toString() : platformFee,
    deadline: serializable ? deadline.toString() : deadline,
  });
}
