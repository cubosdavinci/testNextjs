import { getAddress } from "ethers"
import type { EscrowOrderEIP712 } from "./types/eip712Types"
import { OrderEscrowSchema } from "./zod/OrderEscrowSchema"

export function normalizeOrderEscrow(rawJson: unknown): EscrowOrderEIP712 {
  const data = OrderEscrowSchema.parse(rawJson)
  console.log("buyer address: ", data.buyerAddress)
  return {
    orderId: data.orderId,    
    buyer: String(data.buyerAddress),
    seller: String(data.sellerAddress),
    paymentToken: String(data.erc20Token),
    total: BigInt(data.total),
    taxes: BigInt(data.taxes),
    platformFee: BigInt(data.platformFee),
    deadline: BigInt(Math.floor(Date.now() / 1000) + 3600), //1h
  }
}
