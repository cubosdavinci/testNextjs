'use client'
import { wagmiAdapter, projectId } from './config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit, useAppKitState, useAppKitTheme } from '@reown/appkit/react'
import { arbitrumSepolia } from '@reown/appkit/networks'
import React, { useEffect, type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'


// Set up queryClient
const queryClient = new QueryClient()

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Set up metadata
const metadata = {
  name: 'appkit-example',
  description: 'AppKit Example',
  url: 'https://3000-cs-996772579179-default.cs-europe-west1-xedi.cloudshell.dev', // origin must match your domain & subdomain
  icons: ['https://3000-cs-996772579179-default.cs-europe-west1-xedi.cloudshell.dev/favicon.ico']
}

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [arbitrumSepolia],
  defaultNetwork: arbitrumSepolia,
  metadata: metadata,
  features: {
    email: false,
    socials: false,
    analytics: false
  },
  /*themeMode: themeMode, // dark or 'light'
  themeVariables: {
    '--apkt-accent': 'light' === themeMode ? '#000000ff' : '#dfc42cff',
  }*/
})

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {

  //const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  //const themeMode = prefersDark ? 'dark' : 'light'
  
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  const { themeMode, themeVariables, setThemeMode, setThemeVariables } = useAppKitTheme()
  const { open, /*
    initialized, 
    loading,  
    selectedNetworkId, 
    activeChain, */
  } = useAppKitState();
  
    useEffect(() => {
    if (typeof window === 'undefined') return // SSR-safe

    // Get initial theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setThemeMode(mediaQuery.matches ? 'dark' : 'light')

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setThemeMode(event.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)

    // Cleanup listener on unmount
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  useEffect(() => {
    setThemeVariables({
      '--apkt-accent': 'light' === themeMode ? '#000000ff' : '#dfc42cff', // main accent color
      //'--apkt-color-mix': '#ff00ff',                 // blend color
      //'--apkt-color-mix-strength': 30,               // blend strength (0-100)
      //'--apkt-font-family': 'Inter, sans-serif',
      //'--apkt-border-radius-master': '16',           // in px
      //'--apkt-font-size-master': '16',               // in px
      // Add any other variables you want
    })
  }, [themeMode])

  useEffect(() => {

    if (!open) return;

   /*const removeUxByReown = () => {
    document
      .querySelectorAll("wui-ux-by-reown")
      .forEach(el => el.remove());
  };

  // Run immediately
  removeUxByReown();

  // Catch async / delayed renders
  const observer = new MutationObserver(removeUxByReown);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log("Link REMOVED!!!!")
  return () => observer.disconnect(); */

    const tryRemove = () => {
    document.querySelectorAll("*").forEach((el) => {
      const shadow = (el as HTMLElement).shadowRoot;
      if (!shadow) return;

      shadow
        .querySelectorAll("wui-ux-by-reown")
        .forEach(node => node.remove());
    });
  };

  tryRemove();

  const observer = new MutationObserver(tryRemove);
  observer.observe(document.body, { childList: true, subtree: true });

  return () => observer.disconnect();
  }, [open]);
  
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider