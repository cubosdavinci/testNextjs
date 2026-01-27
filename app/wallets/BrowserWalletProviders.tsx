'use client';

import { useEffect, useState, ReactNode } from 'react';
import { detectWallets, DiscoveredWallet } from '@/components/wallet/WalletSelector';

type BrowserWalletProvidersProps = {
  render: (props: { discoveredWallets: DiscoveredWallet[]; ready: boolean }) => ReactNode;
};

export default function BrowserWalletProviders({ render }: BrowserWalletProvidersProps) {
  const [discoveredWallets, setDiscoveredWallets] = useState<DiscoveredWallet[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    detectWallets().then((wallets) => {
      if (mounted) {
        setDiscoveredWallets(wallets);
        setReady(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return <>{render({ discoveredWallets, ready })}</>;
}
