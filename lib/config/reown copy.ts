// config/reown.ts   (or lib/reown-config.ts) — pure TS, no "use client"

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, sepolia } from '@reown/appkit/networks'; // or 'wagmi/chains'                                    
import { cookieStorage, createStorage } from 'wagmi';

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error('Project ID is required — add NEXT_PUBLIC_PROJECT_ID to .env.local');
}

export const networks = [mainnet, sepolia]; // add your chains

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage, // good for Next.js SSR + connection persistence
  }),
});

export const config = wagmiAdapter.wagmiConfig;