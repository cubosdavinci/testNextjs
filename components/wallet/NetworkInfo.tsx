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
  icon?: string
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
  const [tokenConfig, setTokenConfig] = useState<TokenConfig | null>(null)

  useEffect(() => {
    if (!isConnected || !walletProvider || !address) return

    const loadBalance = async () => {
      const foundToken = network.tokens?.find(
        (t) => t.symbol.toUpperCase() === token.toUpperCase()
      )

      if (!foundToken) return

      setTokenConfig(foundToken)

      try {
        const data =
          '0x70a08231' + // balanceOf selector
          address.replace('0x', '').padStart(64, '0')

        const result = await walletProvider.request<string>({
          method: 'eth_call',
          params: [
            {
              to: foundToken.address,
              data
            },
            'latest'
          ]
        })

        const rawBalance = BigInt(result)
        const formatted = Number(rawBalance) / 10 ** foundToken.decimals

        setBalance(formatted.toFixed(4))
      } catch (err) {
        console.error('Failed to fetch ERC20 balance:', err)
      }
    }

    loadBalance()
    console.log("Token Config !!!! ", network.tokens)
  }, [isConnected, walletProvider, address, network, token])

  if (!isConnected || !balance) return null

  return (
    <div>
      {network.name ?? caipNetwork?.name}: {balance}{' '}
      {tokenConfig?.icon ? (
        <img
          src={tokenConfig.icon}
          alt={tokenConfig.symbol}
          width={20}
          height={20}
          style={{ objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle' }}
        />
      ) : (
        token
      )}
    </div>
  )
}
