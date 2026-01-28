'use client';

import { useEffect, useState } from 'react';
import WalletProviderCard from './WalletProviderCard';
import { WALLET_PROVIDERS } from '@/lib/wallet/providers';
import { WalletProviderEnum } from '@/lib/wallet/types/WalletProviderEnum';
import type { UserWalletDbRow } from '@/lib/wallet/types/UserWalletDbRow';
import { detectWallets, DiscoveredWallet } from '@/components/web3/wallets/WalletSelector';

type ConnectUserWalletsProps = {
  wallets: UserWalletDbRow[];
};

export default function ConnectUserWallets({ wallets }: ConnectUserWalletsProps) {
  const [discoveredWallets, setDiscoveredWallets] = useState<DiscoveredWallet[]>([]);
  const [discoveryReady, setDiscoveryReady] = useState(false);

  // ----------------------------
  // Discover browser wallets once
  // ----------------------------
  useEffect(() => {
    let mounted = true;

    detectWallets().then((wallets) => {
      if (!mounted) return;
      setDiscoveredWallets(wallets);
      setDiscoveryReady(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Map WalletProviderEnum → discovered provider object (EIP-1193)
  const discoveredMap = new Map<WalletProviderEnum, any>();
  discoveredWallets.forEach((w) => {
    const match = Object.entries(WALLET_PROVIDERS).find(([key, meta]) =>
      meta.rdns.includes(w.info.rdns)
    ) as [WalletProviderEnum, any] | undefined;

    if (match) discoveredMap.set(match[0], w.provider); // store EIP-1193 object
  });

  const providerKeys = Object.keys(WALLET_PROVIDERS) as WalletProviderEnum[];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {providerKeys.map((providerEnum) => {
        const wallet = wallets.find((w) => w.provider === providerEnum);
        const eip1193Provider = discoveredMap.get(providerEnum); // actual browser object
        const isAvailable = !!eip1193Provider;

        return (
          <WalletProviderCard
            key={providerEnum}
            eip1193Provider={eip1193Provider} // the EIP-1193 provider object
            provider={providerEnum} // enum for server actions
            providerName={WALLET_PROVIDERS[providerEnum].label} // human-readable
            wallet={
              wallet
                ? {
                    id: wallet.id,
                    wallet_address: wallet.wallet_address,
                    is_active: wallet.is_active,
                  }
                : undefined
            }
            isAvailable={isAvailable}
            discoveryReady={discoveryReady} // still needed for loading UI
          />
        );
      })}
    </div>
  );
}
