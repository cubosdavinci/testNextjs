"use client"

import { useEffect, useState } from "react"
import { detectWallets, DiscoveredWallet } from "@/lib/web3/wallets/providers"
import { useWalletSession } from "@/lib/web3/wallets/useWalletSession"

export default function WalletWorkflow() {
  const [wallet, setWallet] = useState<DiscoveredWallet | null>(null)
  const [tokenBalance, setTokenBalance] = useState<string | null>(null)

  console.log("[WalletWorkflow] render")

  // 1️⃣ Detect wallets
  useEffect(() => {
    console.log("[WalletWorkflow] detectWallets() called")

    detectWallets().then((wallets) => {
      console.log("[WalletWorkflow] wallets discovered:", wallets)

      const metamask = wallets.find(
        (w) => w.info.rdns === "io.metamask"
      )

      if (!metamask) {
        console.warn("[WalletWorkflow] MetaMask not found")
      } else {
        console.log("[WalletWorkflow] MetaMask selected:", metamask)
        setWallet(metamask)
      }
    })
  }, [])

  // 2️⃣ Create wallet session
  const session = useWalletSession(wallet?.provider)

  console.log("[WalletWorkflow] session state:", {
    address: session.address,
    chainId: session.chainId,
    isConnected: session.isConnected
  })

  // 3️⃣ Load ERC20 balance (example)
  useEffect(() => {
    console.log("[WalletWorkflow] ERC20 effect fired")

    if (!session.address) {
      console.log("[WalletWorkflow] No address yet, skipping balance load")
      return
    }

    if (!wallet?.provider) {
      console.log("[WalletWorkflow] No provider yet, skipping balance load")
      return
    }

    async function loadBalance() {
      try {
        console.log("[WalletWorkflow] Loading ERC20 balance for", session.address)

        const tokenAddress =
          "0x0000000000000000000000000000000000000000" // replace

        const data = await wallet.provider.request({
          method: "eth_call",
          params: [
            {
              to: tokenAddress,
              data:
                "0x70a08231" +
                session.address.slice(2).padStart(64, "0")
            },
            "latest"
          ]
        })

        console.log("[WalletWorkflow] Raw ERC20 balance data:", data)

        setTokenBalance(BigInt(data as string).toString())
      } catch (err) {
        console.error("[WalletWorkflow] ERC20 balance error:", err)
      }
    }

    loadBalance()
  }, [session.address, wallet])

  if (!wallet) {
    console.log("[WalletWorkflow] No wallet yet, rendering loading UI")
    return <div>🔍 Detecting wallets…</div>
  }

  return (
    <div className="p-6 rounded-xl border space-y-4 max-w-md">
      <div className="flex items-center gap-3">
        <img src={wallet.info.icon} className="w-8 h-8" />
        <strong>{wallet.info.name}</strong>
      </div>

      <div className="text-sm text-gray-600">
        Network ID: {session.chainId ?? "—"}
      </div>

      <div className="text-lg font-mono">
        {session.address
          ? `${session.address.slice(0, 6)}…${session.address.slice(-4)}`
          : "Not connected"}
      </div>

      <div className="text-sm">
        Status:{" "}
        <span className={session.isConnected ? "text-green-600" : "text-gray-500"}>
          {session.isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {!session.isConnected && (
        <button
          onClick={() => {
            console.log("[WalletWorkflow] Connect button clicked")
            session.connect()
              .then((state) => {
                console.log("[WalletWorkflow] connect() resolved:", state)
              })
              .catch((err) => {
                console.error("[WalletWorkflow] connect() error:", err)
              })
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Connect Wallet
        </button>
      )}

      {session.isConnected && (
        <div className="text-sm">
          ERC-20 Balance: {tokenBalance ?? "Loading…"}
        </div>
      )}
    </div>
  )
}
