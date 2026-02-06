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
  const [orderPayload, setOrderPayload] = useState<EscrowOrderPayload>(
    {
  "orderId": "8f6c9e2a-3a7d-4a8b-9a21-9a5fbb5a0c11",
  "buyer": "0x1d4A0e211D1CA95897ddC854e4ce1F9E3B119191",
  "seller": "0xd332279fc2f2f88aaf323466f9d37f567cb6f31d",
  "USD": "1.00", 
  "total": "1000000",
  "taxes": "200000",
  "platformFee": "200000",
  "erc20Token": "0x8B0180f2101c8260d49339abfEe87927412494B4",
  "erc20TokenDecimals": "6",
  "erc20TokenSymbol": "USDC",
  "chainId": "80002",
  "escrowContract": "0x34B1E5aDF927b47832D1a55dC09E1B6270115d53",
  "assetType": "CRYPTO",
  "assetSubtype": "PAYMENT_TOKEN",

  "productTitle": "Pro License – 1 Year"
}

  )

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
