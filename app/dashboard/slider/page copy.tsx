// app/page.tsx
"use client";

import { useState } from "react";
import WalletSlider from "@/components/radix-ui-slider/WalletSlider";
import {
  SUPPORTED_WALLET_PROVIDERS,
  SUPPORTED_WALLET_PROVIDER_KEYS,
  getWalletBWIcons,
  getWalletIcons,
  getWalletKeys,
  getWalletNames,
  type SupportedWalletProvider,
} from "lib/web3/wallets/types/SupportedWalletProviders";


export default function Page() {
  // State to hold the selected wallet key
  const [selectedWallet, setSelectedWallet] = useState<string>(
    SUPPORTED_WALLET_PROVIDER_KEYS[0] // default to first wallet
  );
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Select Your Wallet</h1>

      <WalletSlider
        sliderName="Wallet Provider"
        value={selectedWallet}
        keys={getWalletKeys()}
        names={getWalletNames()}
        icons={getWalletIcons()}
        bwIcons={getWalletBWIcons()}
        returns={(val: string) => setSelectedWallet(val)}
      />
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">Selected wallet key:</p>
        <p className="font-mono text-lg">{selectedWallet}</p>
      </div>
    </div>
  );
}
