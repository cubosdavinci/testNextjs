'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  FC,
} from 'react'
import { WalletConnectTronAdapter, TronAccount } from './WalletConnectTronAdapter' // Assuming the adapter file is named accordingly and imported

// -------------------- Context --------------------

interface TronContextType {
  accounts: TronAccount[]
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  adapter: WalletConnectTronAdapter
}

const TronContext = createContext<TronContextType | undefined>(undefined)

export const useTron = () => {
  const context = useContext(TronContext)
  if (!context) {
    throw new Error('useTron must be used within a TronProvider')
  }
  return context
}

// -------------------- Provider --------------------

interface TronProviderProps {
  children: ReactNode
  adapterOptions?: {
    tokens?: Record<string, string>
  }
}

export const TronProvider: FC<TronProviderProps> = ({
  children,
  adapterOptions,
}) => {
  const [adapter] = useState(() => new WalletConnectTronAdapter(adapterOptions))
  const [accounts, setAccounts] = useState<TronAccount[]>(adapter.getAccounts())
  const [isConnected, setIsConnected] = useState(accounts.length > 0)

  useEffect(() => {
    // Optional: Listen for external disconnect events if the library supports it
    // For example, if WalletConnectWallet has event emitters:
    // adapter.wallet.on('disconnect', handleDisconnect)
    // Return cleanup: adapter.wallet.off('disconnect', handleDisconnect)
  }, [adapter])

  const connect = async () => {
    try {
      const newAccounts = await adapter.connect()
      setAccounts(newAccounts)
      setIsConnected(true)
    } catch (error) {
      console.error('Connection failed:', error)
      // Optional: Handle errors with toast or modal
    }
  }

  const disconnect = async () => {
    try {
      await adapter.disconnect()
      setAccounts([])
      setIsConnected(false)
    } catch (error) {
      console.error('Disconnection failed:', error)
    }
  }

  const value = {
    accounts,
    isConnected,
    connect,
    disconnect,
    adapter,
  }

  return <TronContext.Provider value={value}>{children}</TronContext.Provider>
}

// -------------------- Connect Button Component --------------------

// This component mirrors a simple ConnectButton from libraries like RainbowKit or AppKit.
// It triggers the WalletConnect modal (handled internally by the adapter) on connect.
// Styles are basic; you can enhance with Tailwind, CSS modules, or a UI library.

export const TronConnectButton: FC = () => {
  const { accounts, isConnected, connect, disconnect } = useTron()

  if (isConnected && accounts.length > 0) {
    const address = accounts[0].address
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
    return (
      <button
        onClick={disconnect}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {shortAddress} - Disconnect
      </button>
    )
  }

  return (
    <button
      onClick={connect}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      Connect Tron Wallet
    </button>
  )
}