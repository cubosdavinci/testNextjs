"use client"

import { useWalletSession } from "@/lib/web3/wallets/useWalletSession"

export default function WalletCard({
  provider,
  walletName,
  networkName,
  tokenSymbol,
  icon
}: {
  provider: any
  walletName: string
  networkName: string
  tokenSymbol: string
  icon: string
}) {
  const session = useWalletSession(provider)

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white w-96 rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">{walletName}</h3>
          <button className="text-red-500 text-xl">✕</button>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-4">
          <div className="flex justify-center gap-3">
            <span>🧩 {walletName}</span>
            <span>🌐 {networkName}</span>
            <span>💰 {tokenSymbol}</span>
          </div>

          <div className="text-xl font-bold">
            {session.address
              ? `${session.address.slice(0, 6)}...${session.address.slice(-4)}`
              : "Not connected"}
          </div>

          <div
            className={`text-sm ${
              session.isConnected ? "text-green-600" : "text-gray-500"
            }`}
          >
            Wallet Session: {session.isConnected ? "Connected" : "Disconnected"}
          </div>

          {!session.isConnected && (
            <button
              onClick={session.connect}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
