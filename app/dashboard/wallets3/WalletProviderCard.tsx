// app/dashboard/wallets/WalletProviderCard.tsx
"use client"
import { WalletProvider } from "@/lib/web3/SupportedWalletProviders"
import type { BlockchainNetwork } from "@/lib/web3/Blockchain"

type WalletInfo = {
  id?: string
  wallet_address?: string
  is_active?: boolean
  network?: BlockchainNetwork
  token?: {
    symbol: string
    name: string
    address: string
    icon: string
  }
}

type WalletProviderCardProps = {
  provider: WalletProvider
  wallet?: WalletInfo
  isInstalled: boolean
  isConnected: boolean
  discoveryReady: boolean
  connect?: () => Promise<{
  address: string | null
  chainId: number | null
  isConnected: boolean
}>
}

export default function WalletProviderCard({
  provider,
  wallet,
  isInstalled,
  isConnected,
  discoveryReady,
  connect,
}: WalletProviderCardProps) {
  let status = "Loading..."
  if (discoveryReady) {
    if (isConnected) status = "Connected 🟢"
    else if (isInstalled) status = "Installed ⚪"
    else status = "Not Installed ⚫"
  }

  // Safe wallet address slices
  const shortAddress =
    wallet?.wallet_address && wallet.wallet_address.length > 10
      ? `${wallet.wallet_address.slice(0, 6)}...${wallet.wallet_address.slice(-4)}`
      : wallet?.wallet_address ?? ""

  return (
    <div className="border rounded-lg shadow-md p-4 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <img src={provider.icon} alt={provider.name} className="w-6 h-6" />
        <h3 className="text-lg font-semibold">{provider.name}</h3>
      </div>

      {/* Wallet Info */}
      {shortAddress && <p className="mt-2 text-sm">Registered: {shortAddress}</p>}

      {/* Network / Token Info */}
      {wallet?.network && wallet?.token && (
        <p className="mt-1 text-sm">
          Network: {wallet.network.shortName} | Token: {wallet.token.symbol}
        </p>
      )}

      {/* Status */}
      <p className="mt-2 text-sm font-medium">Status: {status}</p>

      {/* Connect Button */}
      {isInstalled && !isConnected && connect && (
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => connect()}
        >
          Connect Wallet
        </button>
      )}
    </div>
  )
}
