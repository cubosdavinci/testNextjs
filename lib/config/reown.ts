// config/reown.ts   (pure TS, no "use client")
"use client";
import { createAppKit } from "@reown/appkit/react";
export const appKit = createAppKit({
  // config
});





import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, sepolia } from '@reown/appkit/networks';
import { cookieStorage, createStorage } from 'wagmi';

// Project ID from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error(
    'Project ID is required — add NEXT_PUBLIC_PROJECT_ID to .env.local (get from https://cloud.reown.com)'
  );
}

export const networks = [mainnet, sepolia]; // add more chains as needed

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage, // persists connections across SSR/hydration
  }),
});

export const config = wagmiAdapter.wagmiConfig;

// Client-side AppKit initialization (safe to export as a side-effect function)
export function initializeAppKit() {


  // This runs only on client due to import placement
  if (typeof window === 'undefined') return;

  window.location.href = "https://3000-cs-996772579179-default.cs-europe-west1-xedi.cloudshell.dev/login"
  const { createAppKit } = require('@reown/appkit/react'); // dynamic import to avoid SSR issues

  const appKit = createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata: {
      name: 'Yogi3',
      description: 'Your dApp description',
      url: window.location.origin,
      icons: ['/favicon.ico'], // relative or absolute real URL
    },
    // features: { email: false, socials: false }, // optional
    walletConnect: {
    redirect: {
      native: window.location.href,     // ✅ exact page return
      universal: window.location.origin // ✅ fallback / iOS
    },
  },
  });

  // 🔥 expose globally so buttons can open it (Android needs this)
  (window as any).appKit = appKit;
}