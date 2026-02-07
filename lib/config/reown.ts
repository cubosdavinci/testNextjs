// config/reown.ts   (pure TS, no "use client")

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

  const { createAppKit } = require('@reown/appkit/react'); // dynamic import to avoid SSR issues

  createAppKit({
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
  });
}