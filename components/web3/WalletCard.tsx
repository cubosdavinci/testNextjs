"use client";

import { useState } from "react";
import { SUPPORTED_NETWORKS } from "@/lib/web3/SupportedNetworks";
import { UserPaymentMethod } from "@/lib/supabase/web3/getUserWallets";
import { createClient } from "@/lib/supabase/client";

type Props = {
  providerKey: string;
  userWallets: UserPaymentMethod[];
};

export default function WalletCard({
  providerKey,
  userWallets,
}: Props) {
  const [activeChainId, setActiveChainId] = useState<number>(
    SUPPORTED_NETWORKS[0].chainId
  );
  const supabase = createClient();

  const network = SUPPORTED_NETWORKS.find(
    (n) => n.chainId === activeChainId
  );

  if (!network) return null;

  function isTokenConnected(tokenAddress: string) {
    return userWallets.some(
      (w) =>
        w.chain_id === activeChainId &&
        w.token_address.toLowerCase() === tokenAddress.toLowerCase()
    );
  }

  async function toggleToken(tokenAddress: string) {
    const existing = userWallets.find(
      (w) =>
        w.chain_id === activeChainId &&
        w.token_address.toLowerCase() === tokenAddress.toLowerCase()
    );

    if (existing) {
      await supabase
        .from("web3_user_payment_methods")
        .delete()
        .eq("id", existing.id);
    } else {
      await supabase.from("web3_user_payment_methods").insert({
        wallet_provider: providerKey,
        chain_id: activeChainId,
        token_address: tokenAddress,
        is_default: false,
        is_active: true,
      });
    }

    location.reload();
  }

  return (
    <div className="border rounded-xl p-6 space-y-6">
      <h2 className="text-xl font-semibold text-center capitalize">
        {providerKey} Wallet
      </h2>

      {/* Networks */}
      <div className="flex justify-center gap-4">
        {SUPPORTED_NETWORKS.map((n) => (
          <button
            key={n.chainId}
            onClick={() => setActiveChainId(n.chainId)}
            className={`p-2 rounded-lg border ${
              activeChainId === n.chainId
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200"
            }`}
          >
            <img src={n.icon} className="w-10 h-10" />
          </button>
        ))}
      </div>

      {/* Tokens */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {network.tokens.map((token) => {
          const connected = isTokenConnected(token.address);

          return (
            <div
              key={token.address}
              className="text-center space-y-2"
            >
              <img
                src={
                  connected
                    ? token.icon
                    : token.icon.replace(".png", "-bw.png")
                }
                className="w-12 h-12 mx-auto"
              />

              <p className="text-sm">{token.symbol}</p>

              <button
                onClick={() => toggleToken(token.address)}
                className={`text-xs px-3 py-1 rounded ${
                  connected
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {connected ? "Disconnect" : "Connect"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
