"use client"
import { useState, useEffect } from "react"
import { EscrowSignButton } from "./EscrowSignButton"
import { EscrowOrderPayload } from "@/app/testing-create-order/types/EscrowOrderPayloadEIP712Types"
import { detectWallets } from "wallet/providers"
import WalletSlider from "components/radix-ui-slider/WalletSlider";
export default function TestingCreateOrderPage() {
  const [selectedWallet, setSelectedWallet] = useState("io.metamask")
  const [discoveredWallets, setDiscoveredWallets] = useState<any[]>([])
const [selectedWalletProvider, setSelectedWalletProvider] = useState<any>(null)
  const [orderPayload, setOrderPayload] = useState<EscrowOrderPayload>({
    orderId: "ORDER-" + crypto.randomUUID(),
    buyer: "0x0000000000000000000000000000000000000000", // replace with wallet or auto-fill
    seller: "0x0000000000000000000000000000000000000000",
    paymentToken: "0x0000000000000000000000000000000000000000", // USDC on Amoy
    total: "1000000", // 1 USDC (6 decimals)
    taxes: "0",
    platformFee: "0",
    deadline: Math.floor(Date.now() / 1000 + 60 * 30).toString() // 30 minutes
  })

  useEffect(() => {
  async function discover() {
    const wallets = await detectWallets()
    setDiscoveredWallets(wallets)
  }
  discover()
}, [])

useEffect(() => {
  if (!discoveredWallets.length) return

  const match = discoveredWallets.find(
    (w) => w.info.rdns === selectedWallet
  )

  setSelectedWalletProvider(match ?? null)
}, [selectedWallet, discoveredWallets])

  return (
    <main style={{ padding: "2rem", maxWidth: 600 }}>
      <h1>Create Escrow Order (Amoy)</h1>
      <WalletSlider sliderName="Select Wallet Provider" value={selectedWallet} returns={setSelectedWallet} />

      <div style={{ marginBottom: "1rem" }}>
        <label>Buyer</label>
        <input
          value={orderPayload.buyer}
          onChange={(e) =>
            setOrderPayload({ ...orderPayload, buyer: e.target.value })
          }
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Seller</label>
        <input
          value={orderPayload.seller}
          onChange={(e) =>
            setOrderPayload({ ...orderPayload, seller: e.target.value })
          }
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Payment Token (USDC)</label>
        <input
          value={orderPayload.paymentToken}
          onChange={(e) =>
            setOrderPayload({ ...orderPayload, paymentToken: e.target.value })
          }
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Total (USDC, 6 decimals)</label>
        <input
          value={orderPayload.total}
          onChange={(e) =>
            setOrderPayload({ ...orderPayload, total: e.target.value })
          }
          style={{ width: "100%" }}
        />
      </div>

      <EscrowSignButton
  orderPayload={orderPayload}
  discoveredProvider={selectedWalletProvider?.provider}
/>
    </main>
  )
}
