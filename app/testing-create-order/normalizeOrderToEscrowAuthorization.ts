import { getAddress } from "ethers"
import { EscrowPaymentAuthorization } from "./types/EscrowPaymentAuthorization"
import { RawPaymentSchema } from "./zod/RawPaymentSchema"

export function normalizeToAuthorization(raw: unknown): EscrowPaymentAuthorization {
  const data = RawPaymentSchema.parse(raw)

  return {
    orderId: data.orderId,
    buyer: getAddress(data.buyerAddress),
    seller: getAddress(data.sellerAddress),

    paymentToken: getAddress(data.erc20Token),

    total: BigInt(data.total),
    taxes: BigInt(data.taxes),
    platformFee: BigInt(data.platformFee),

    chainId: BigInt(data.chain_id),
    escrowContract: getAddress(data.escrow_contract),

    // Example: 1 hour expiry
    deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
  }
}
