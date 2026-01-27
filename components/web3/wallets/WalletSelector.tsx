"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

/**
 * Raw EIP-6963 wallet provider shape
 */
export type DiscoveredWallet = {
  info: {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
  };
  provider: any;
};

type WalletContextValue = {
  wallets: DiscoveredWallet[];
  ready: boolean;
};

const WalletContext = createContext<WalletContextValue>({
  wallets: [],
  ready: false,
});



/**
 * ---- Provider Component ----
 * Run wallet discovery ONCE and cache results
 */
export function WalletSelectorProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [wallets, setWallets] = useState<DiscoveredWallet[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    detectWallets().then((result) => {
      if (!mounted) return;
      setWallets(result);
      setReady(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <WalletContext.Provider value={{ wallets, ready }}>
      {children}
    </WalletContext.Provider>
  );
}

/**
 * ---- Hook ----
 * Used by WalletProviderCard
 */
export function useDiscoveredWallets() {
  return useContext(WalletContext);
}
