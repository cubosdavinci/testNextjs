'use client'

import { useEffect, useState, useCallback } from 'react'
import { useConnection } from 'wagmi'
import UniversalProvider from '@walletconnect/universal-provider'
import { createAppKit } from '@reown/appkit'
import { arbitrumSepolia, mainnet } from '@reown/appkit/networks'

import Header from './components/Header'
import ActionButtonList from './components/ActionButton'
import InfoList from './components/InfoList'
import Footer from './components/Footer'

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694'

export default function App() {
  const { connector, chain } = useConnection()
  const [account, setAccount] = useState<string>()
  const [network, setNetwork] = useState<string>()
  const [balance, setBalance] = useState<string>()
  const [wcProvider, setWcProvider] = useState<InstanceType<typeof UniversalProvider> | null>(null)
  const [appKitModal, setAppKitModal] = useState<ReturnType<typeof createAppKit> | null>(null)

  // ----- session object for InfoList -----
  const session = wcProvider?.session ?? connector

  // ----- Helper to fetch account + network -----
  const updateAccountAndNetwork = useCallback(async () => {
    if (!connector) return
    try {
      const accounts = await connector.getAccounts?.()
      const acc = accounts?.[0]
      const chainId = chain?.id.toString() || (await connector.getChainId?.())?.toString()
      setAccount(acc)
      setNetwork(chainId)
    } catch (err) {
      console.error('Failed to get account or chain from connector:', err)
      setAccount(undefined)
      setNetwork(undefined)
    }
  }, [connector, chain])

  // ----- Initialize on mount -----
  useEffect(() => {
    document.documentElement.className = 'light'
    updateAccountAndNetwork()

    // --- Initialize WalletConnect + AppKit modal ---
    const initModal = async () => {
      const up = await UniversalProvider.init({
        projectId,
        metadata: {
          name: 'My App',
          description: 'Example AppKit Modal',
          url: window.location.origin,
          icons: ['https://example.com/icon.png']
        }
      })
      setWcProvider(up)

      const modal = createAppKit({
        projectId,
        networks: [mainnet, arbitrumSepolia]
      })
      setAppKitModal(modal)

      // Show modal on WC display_uri event
      up.on('display_uri', (uri: string) => {
        modal.open({ uri })
      })

      // Update session on connect
      up.on('connect', (newSession: any) => {
        modal.close()
        updateAccountAndNetwork()
      })

      // Reset on disconnect
      up.on('disconnect', () => {
        setAccount(undefined)
        setNetwork(undefined)
      })
    }

    initModal()
  }, [updateAccountAndNetwork])

  // ----- Setup Wagmi connector events -----
  useEffect(() => {
    if (!connector) return
    const hasEventAPI = 'on' in connector && typeof connector.on === 'function'
    const hasOffAPI = 'off' in connector && typeof connector.off === 'function'

    if (hasEventAPI) {
      ;(connector as any).on('change', updateAccountAndNetwork)
      ;(connector as any).on('disconnect', () => {
        setAccount(undefined)
        setNetwork(undefined)
      })
    }

    return () => {
      if (hasOffAPI) {
        ;(connector as any).off('change', updateAccountAndNetwork)
        ;(connector as any).off('disconnect', () => {
          setAccount(undefined)
          setNetwork(undefined)
        })
      }
    }
  }, [connector, updateAccountAndNetwork])

  return (
    <div className="page-container">
      <Header />

      <ActionButtonList
        provider={wcProvider || undefined}
        session={session}
        account={account}
        onSessionChange={(s) => console.log('session changed', s)}
        onAccountChange={setAccount}
        onBalanceChange={setBalance}
        onNetworkChange={setNetwork}
      />

      <InfoList
        account={account}
        network={network}
        balance={balance}
        session={session}
      />

      <Footer />
    </div>
  )
}
