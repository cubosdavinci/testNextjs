'use client'
import React, { useEffect, type ReactNode } from 'react'
import  { createAppKit, useAppKitState, useAppKitTheme, useAppKitAccount } from '@reown/appkit/react'
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solana, solanaTestnet, solanaDevnet } from "@reown/appkit/networks";

// 0. Set up Solana Adapter
const solanaWeb3JsAdapter = new SolanaAdapter();

// 1. Get projectId from https://dashboard.reown.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;

// 2. Create a metadata object - optional
const metadata = {
  name: 'appkit-example',
  description: 'AppKit Example',
  url: 'https://3000-cs-996772579179-default.cs-europe-west1-xedi.cloudshell.dev', // origin must match your domain & subdomain
  icons: ['https://3000-cs-996772579179-default.cs-europe-west1-xedi.cloudshell.dev/favicon.ico']
}

/*

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { cookieToInitialState } from '@reown/appkit/react'
import { Connection, clusterApiUrl } from '@solana/web3.js'
import {
  WalletProvider,
  useWallet,
  ConnectionProvider
} from '@solana/wallet-adapter-react'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { createAnonClient } from '@/lib/supabase/client'

// Set up queryClient
const queryClient = new QueryClient()
const supabase = createAnonClient()

// Solana wallets
const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()]

// Solana connection
const solanaConnection = new Connection(clusterApiUrl('devnet')) // or 'mainnet-beta'

*/
// 3. Create modal for Solana
const modal = createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: [solana, solanaTestnet, solanaDevnet],
  metadata: metadata,
  projectId,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});
/*
function SolanaContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {

  // Initial state from cookies (if needed)
  const initialState = cookieToInitialState({}, cookies)

  const { themeMode, setThemeMode, setThemeVariables } = useAppKitTheme()
  const { open } = useAppKitState()
  const { isConnected } = useAppKitAccount()

  // Sign out from Supabase if disconnected
  useEffect(() => {
    if (!isConnected) supabase.auth.signOut()
  }, [isConnected])

  // Detect system theme
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setThemeMode(mediaQuery.matches ? 'dark' : 'light')

    const handleChange = (event: MediaQueryListEvent) => {
      setThemeMode(event.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Set theme variables
  useEffect(() => {
    setThemeVariables({
      '--apkt-accent': themeMode === 'light' ? '#000000ff' : '#dfc42cff'
    })
  }, [themeMode])

  // Optional: remove UX components inside shadows (if AppKit renders any)
  useEffect(() => {
    if (!open) return

    const tryRemove = () => {
      document.querySelectorAll("*").forEach((el) => {
        const shadow = (el as HTMLElement).shadowRoot
        if (!shadow) return
        shadow.querySelectorAll("wui-ux-by-reown").forEach(node => node.remove())
      })
    }

    tryRemove()
    const observer = new MutationObserver(tryRemove)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [open])

  return (
    <ConnectionProvider endpoint={clusterApiUrl('devnet')}>
      <WalletProvider wallets={wallets} autoConnect>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default SolanaContextProvider
*/