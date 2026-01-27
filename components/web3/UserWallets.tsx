"use client";

import { useEffect, useState } from "react";
import { getUserWallets, UserPaymentMethod } from "@/lib/supabase/web3/getUserWallets";
import { SUPPORTED_WALLET_PROVIDERS } from "@/lib/web3/SupportedWalletProviders";
import WalletCard from "./WalletCard";

export default function UserWallets() {
  const [selectedProvider, setSelectedProvider] = useState<string>(
    SUPPORTED_WALLET_PROVIDERS[0].key
  );
  const [wallets, setWallets] = useState<UserPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserWallets()
      .then(setWallets)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center">Loading wallets...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Provider Selector */}
      <div className="flex gap-4 justify-center">
        {SUPPORTED_WALLET_PROVIDERS.map((p) => (
          <button
            key={p.key}
            onClick={() => setSelectedProvider(p.key)}
            className={`p-3 rounded-lg border transition ${
              selectedProvider === p.key
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <img src={p.icon} className="w-10 h-10 mx-auto" />
            <p className="text-sm mt-1">{p.name}</p>
          </button>
        ))}
      </div>

      {/* Active Wallet Card */}
      <WalletCard
        providerKey={selectedProvider}
        userWallets={wallets.filter(
          (w) => w.wallet_provider === selectedProvider
        )}
      />
    </div>
  );
}
