'use client'

import { useEffect, useState, useCallback } from 'react'
import { useConnection } from 'wagmi'

import Header from './components/Header'
import ActionButtonList from './components/ActionButton'
import InfoList from './components/InfoList'
import Footer from './components/Footer'

export default function App() {
  const { connector, chain, isConnected } = useConnection()
  const [account, setAccount] = useState<string>()
  const [network, setNetwork] = useState<string>()
  const [balance, setBalance] = useState<string>()

  const session = connector?.session ?? connector
  // ----- Helper to fetch account + network -----
  const updateAccountAndNetwork = useCallback(async () => {
    if (!connector) return
    try {
      // Most connectors return array of accounts
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
  }, [updateAccountAndNetwork])

  // ----- Setup listeners for connectors that support events -----
  useEffect(() => {
    if (!connector) return

    const hasEventAPI = 'on' in connector && typeof connector.on === 'function'
    const hasOffAPI = 'off' in connector && typeof connector.off === 'function'

    if (hasEventAPI) {
      if (connector && typeof (connector as any).on === 'function') {
  (connector as any).on('change', updateAccountAndNetwork)
  (connector as any).on('disconnect', () => {
    setAccount(undefined)
    setNetwork(undefined)
  })
}
    }

    return () => {
  if (connector && typeof (connector as any).off === 'function') {
    (connector as any).off('change', updateAccountAndNetwork)
    (connector as any).off('disconnect', () => {
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
    provider={connector && 'connect' in connector ? (connector as any) : undefined} // only for WC
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
