'use client'

import { useEffect, useState } from 'react'
import {
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider
} from '@reown/appkit/react'

type EvmProvider = {
  request: <T = unknown>(args: {
    method: string
    params?: unknown[] | object
  }) => Promise<T>
}

type TokenConfig = {
  symbol: string
  address: string
  decimals: number
}

type AppKitNetworkWithTokens = {
  name?: string
  tokens?: TokenConfig[]
}

type Props = {
  network: AppKitNetworkWithTokens
  token: string
}

export default function NetworkInfo({ network, token }: Props) {
  const { address, isConnected } = useAppKitAccount()
  const { caipNetwork } = useAppKitNetwork()
  const { walletProvider } = useAppKitProvider<EvmProvider>('eip155')

  const [balance, setBalance] = useState<string | null>(null)

  useEffect(() => {
    if (!isConnected || !walletProvider || !address) return

    const loadBalance = async () => {
      // 1️⃣ Find token by symbol
      const tokenConfig = network.tokens?.find(
        (t) => t.symbol.toUpperCase() === token.toUpperCase()
      )

      if (!tokenConfig) return

      try {
        // ERC20 balanceOf(address)
        const data =
          '0x70a08231' + // balanceOf selector
          address.replace('0x', '').padStart(64, '0')

        const result = await walletProvider.request<string>({
          method: 'eth_call',
          params: [
            {
              to: tokenConfig.address,
              data
            },
            'latest'
          ]
        })

        const rawBalance = BigInt(result)
        const formatted =
          Number(rawBalance) / 10 ** tokenConfig.decimals

        setBalance(formatted.toFixed(4))
      } catch (err) {
        console.error('Failed to fetch ERC20 balance:', err)
      }
    }

    loadBalance()
  }, [isConnected, walletProvider, address, network, token])

  // ❌ Not connected → render nothing
  if (!isConnected || !balance) return null

  return (
    <div>
      {network.name ?? caipNetwork?.name}: {balance} {token}
    </div>
  )
}
