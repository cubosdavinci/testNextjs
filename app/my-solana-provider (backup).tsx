'use client'

import React, { FC, useMemo, ReactNode } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';

// ─── NEW ────────────────────────────────────────
import {
  SolanaMobileWalletAdapter,
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache,
} from '@solana-mobile/wallet-adapter-mobile';
//import { SolanaMobileWalletAdapter } from '@solana-mobile/wallet-adapter-mobile';

import {
  WalletModalProvider,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';

export enum WalletAdapterNetwork {
  Mainnet = 'mainnet-beta',
  Testnet = 'testnet',
  Devnet = 'devnet',
}

interface WalletProviderProps {
  children: ReactNode;
}

export const Wallet: FC<WalletProviderProps> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter({ network }),
      new SolflareWalletAdapter({ network }),

      // ─── Add this ────────────────────────────────────────
new SolanaMobileWalletAdapter({
  cluster: network,
  appIdentity: {
    name: 'Your App Name',
    uri: typeof window !== 'undefined' ? window.location.origin : '',
    icon: '/icon.png',
  },

  addressSelector: createDefaultAddressSelector(),
  authorizationResultCache: createDefaultAuthorizationResultCache(),

  onWalletNotFound: async (mobileWalletAdapter) => {
    // fallback behavior (VERY important)
    console.warn('No mobile wallet found');
  },
}),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};