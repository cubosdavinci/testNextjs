"use client"

import { useState } from "react"
import { detectWallets, DiscoveredWallet } from "@/lib/web3/wallets/providers"
import { useWalletSession } from "@/lib/web3/wallets/useWalletSession"

export default function WalletWorkflow() {
  const [wallet, setWallet] = useState<any | null>(null)
  const [detecting, setDetecting] = useState(false)

  console.log("[WalletWorkflow] render", { wallet })

  const session = useWalletSession(wallet?.provider)

  async function connectMetaMask() {
    console.log("[WalletWorkflow] Connect MetaMask clicked")
    setDetecting(true)

    try {
      console.log("[WalletWorkflow] Detecting wallets…")
      const wallets = await detectWallets()
      console.log("[WalletWorkflow] Wallets found:", wallets)

      // 🔹 Filter for MetaMask
      const metamaskObj = wallets.find(
        (w) => w.info.rdns === "io.metamask"
      )

      const metamask = metamaskObj?.provider
      if (!metamask) {
        console.error("[WalletWorkflow] MetaMask not found")
        return
      }

      console.log("[WalletWorkflow] MetaMask provider selected", metamask)

      // 1️⃣ Set provider (triggers useWalletSession effect)
      setWallet(metamask)

      // 2️⃣ Connect on next tick (provider must be set first)
      setTimeout(() => {
        console.log("[WalletWorkflow] Calling session.connect()")
        session.connect()
      }, 0)
    } catch (err) {
      console.error("[WalletWorkflow] MetaMask connect error", err)
    } finally {
      setDetecting(false)
    }
  }

  return (
    <div className="p-6 rounded-xl border space-y-4 max-w-md">
      <h2 className="text-lg font-semibold">MetaMask Test</h2>

      <div className="text-sm">
        Address:{" "}
        {session.address
          ? `${session.address.slice(0, 6)}…${session.address.slice(-4)}`
          : "Not connected"}
      </div>

      <div className="text-sm">
        Chain ID: {session.chainId ?? "—"}
      </div>

      <div className="text-sm">
        Status:{" "}
        <span className={session.isConnected ? "text-green-600" : "text-gray-500"}>
          {session.isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <button
        onClick={connectMetaMask}
        disabled={detecting || session.isConnected}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {detecting ? "Detecting…" : "Connect MetaMask"}
      </button>
    </div>
  )
}
