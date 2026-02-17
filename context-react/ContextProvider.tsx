'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import React, { type ReactNode } from 'react'
import { cookieStorage, cookieToInitialState, createStorage, WagmiProvider, type Config } from 'wagmi'
import { arbitrumSepolia as baseSepolia } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// ----------------------
// 1️⃣ Define network with custom tokens
// ----------------------
export const networkSepolia = {
  ...baseSepolia,
  tokens: [
    {
      symbol: 'USDT',
      address: '0x5bd9fad99155001645b62a35f1edc5dd01609103',
      decimals: 6,
      icon: '/images/web3/tokens/usdt.png',
    },
    {
      symbol: 'USDC',
      address: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
      decimals: 6,
      icon: '/images/web3/tokens/usdc.png',
    },
  ],
}

// ----------------------
// 2️⃣ Project ID & QueryClient
// ----------------------
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!
if (!projectId) throw new Error('Project ID is not defined')
const queryClient = new QueryClient()

// ----------------------
// 3️⃣ Wagmi Adapter
// ----------------------
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks: [networkSepolia],
})

// ----------------------
// 4️⃣ AppKit modal
// ----------------------
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [networkSepolia],
  defaultNetwork: networkSepolia,
  metadata: {
    name: 'appkit-example',
    description: 'AppKit Example',
    url: 'https://your-domain.example.com',
    icons: ['/favicon.ico'],
  },
  features: {
    analytics: true, // optional
  },
})

// ----------------------
// 5️⃣ ContextProvider
// ----------------------
function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode
  cookies: string | null
}) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider
