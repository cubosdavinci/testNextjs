"use client"

import { useEffect, useState } from "react"
import WalletProviderCard from "./WalletProviderCard"
import { SUPPORTED_WALLET_PROVIDERS, WalletProvider } from "@/lib/web3/SupportedWalletProviders"
import { SUPPORTED_NETWORKS } from "@/lib/web3/SupportedNetworks"
import type { UserWalletDbRow } from "@/lib/web3/wallets/db/types/UserWalletDbRow"
import type { DiscoveredWallet } from "@/lib/web3/wallets/providers"
import { detectWallets } from "@/lib/web3/wallets/providers"
import { useWalletSession } from "@/lib/web3/wallets/useWalletSession"

type ConnectUserWalletsProps = {
  wallets: UserWalletDbRow[]
}

export default function ConnectUserWallets({ wallets }: ConnectUserWalletsProps) {
  const [discoveredWallets, setDiscoveredWallets] = useState<DiscoveredWallet[]>([])
  const [discoveryReady, setDiscoveryReady] = useState(false)

  // Discover wallets in the browser
  useEffect(() => {
    let mounted = true
    detectWallets().then((found) => {
      if (!mounted) return
      setDiscoveredWallets(found)
      setDiscoveryReady(true)
    })
    return () => { mounted = false }
  }, [])

  // Map provider key -> discovered wallet
  const discoveredMap = new Map<string, DiscoveredWallet>()
  discoveredWallets.forEach((w) => discoveredMap.set(w.info.rdns, w))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUPPORTED_WALLET_PROVIDERS.map((provider: WalletProvider) => {
          const wallet = wallets.find((w) => w.wallet_provider === provider.key)
          const discovered = discoveredWallets.find(d => d.info.rdns.includes(provider.key))
          const session = useWalletSession(discovered?.provider)

          // Network info
          const network = SUPPORTED_NETWORKS.find(n => n.chainId === wallet?.chain_id)
          const token = network?.tokens.find(
            t => t.address.toLowerCase() === wallet?.token_address?.toLowerCase()
          )

          return (
            <WalletProviderCard
              key={provider.key}
              provider={provider}
              wallet={{
                ...wallet,
                network,
                token,
              }}
              isInstalled={!!discovered}
              isConnected={session?.isConnected || false}
              discoveryReady={discoveryReady}
              connect={session?.connect}
            />
          )
        })}
      </div>
    </div>
  )
}
