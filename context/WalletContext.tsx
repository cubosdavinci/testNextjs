// context/WalletContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { UniversalProvider } from '@walletconnect/universal-provider'

type SessionData = {
  evm?: {
    accounts: string[]
    chainId: number
  }
  tron?: {
    accounts: string[]
    chainId: string
  }
}

type WalletContextType = {
  provider?: InstanceType<typeof UniversalProvider>
  session: SessionData
  setSession: (s: SessionData) => void
}

const WalletContext = createContext<WalletContextType>({
  session: {},
  setSession: () => {},
})

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [provider, setProvider] = useState<InstanceType<typeof UniversalProvider>>()
  const [session, setSession] = useState<SessionData>({})

  useEffect(() => {
    function getAccountsByNamespace(
      provider: InstanceType<typeof UniversalProvider>,
      namespace: string
    ) {
      const session = provider.session
      if (!session?.namespaces?.[namespace]) return undefined

      return session.namespaces[namespace].accounts.map((acc: string) => {
        const [, chainId, address] = acc.split(':')
        return { chainId, address }
      })
    }



    // Initialize provider
    async function initProvider() {
      const up = await UniversalProvider.init({
        projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
        metadata: {
          name: "My App",
          description: "My App",
          url: window.location.origin,
          icons: ['https://example.com/icon.png']
        },
      })
      setProvider(up)

      if (up.session) {
      const evmAccounts = getAccountsByNamespace(up, 'eip155')
      const tronAccounts = getAccountsByNamespace(up, 'tron')

      setSession({
        evm: evmAccounts
          ? {
              accounts: evmAccounts.map(a => a.address),
              chainId: Number(evmAccounts[0].chainId)
            }
          : undefined,
        tron: tronAccounts
          ? {
              accounts: tronAccounts.map(a => a.address),
              chainId: tronAccounts[0].chainId
            }
          : undefined
      })
    }
    }

    initProvider()
  }, [])

  return (
    <WalletContext.Provider value={{ provider, session, setSession }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
