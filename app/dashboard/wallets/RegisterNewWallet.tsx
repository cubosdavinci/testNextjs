"use client";
import { useEffect, useMemo, useState } from "react";
import { WalletService } from "@/lib/web3/wallets/service";
import { SUPPORTED_WALLET_PROVIDERS } from "@/lib/web3/wallets/types/SupportedWalletProviders";
import type { DiscoveredWallet } from "@/lib/web3/wallets/providers";
import type { BNetwork } from "@/lib/web3/wallets/types/SupportedBNetworks";
const service = new WalletService();
export default function RegisterNewWallet() {
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState<any[]>([]);
  const [discovered, setDiscovered] = useState<DiscoveredWallet[]>([]);
  const [networks, setNetworks] = useState<BNetwork[]>([]);
  const [walletStep, setWalletStep] = useState(0);
  const [networkStep, setNetworkStep] = useState(0);
  const [tokenStep, setTokenStep] = useState(0);
  // -------------------------------
  // Load everything
  // -------------------------------
  useEffect(() => {
    async function load() {
      const [dbWallets, found] = await Promise.all([
        service.getWallets(),
        service.discoverProviders(),
      ]);
      setRegistered(dbWallets || []);
      setDiscovered(found);
      setNetworks(service.getSupportedNetworks());
      setLoading(false);
    }
    load();
  }, []);
  // -------------------------------
  // Derived State
  // -------------------------------
  const selectedWallet = SUPPORTED_WALLET_PROVIDERS[walletStep];
  const selectedNetwork = networks[networkStep];
  const selectedToken = selectedNetwork?.tokens[tokenStep];
  const discoveredMap = useMemo(() => {
    const map = new Map<string, DiscoveredWallet>();
    discovered.forEach((w) => map.set(w.info.rdns, w));
    return map;
  }, [discovered]);
  const isDiscovered = selectedWallet
    ? discoveredMap.has(selectedWallet.rdns)
    : false;
  const isRegistered = useMemo(() => {
    if (!selectedWallet || !selectedNetwork || !selectedToken) return false;
    return registered.some(
      (w) =>
        w.wallet_provider === selectedWallet.rdns &&
        w.chain_id === selectedNetwork.chainId &&
        w.token_address.toLowerCase() === selectedToken.address.toLowerCase(),
    );
  }, [registered, selectedWallet, selectedNetwork, selectedToken]);
  // -------------------------------
  // Actions
  // -------------------------------
  async function handleRegister() {
    const discoveredWallet = discoveredMap.get(selectedWallet.rdns);
    if (!discoveredWallet || !selectedNetwork || !selectedToken) return;
    const saved = await service.connectAndSaveWallet({
      provider: discoveredWallet.provider,
      wallet_provider: selectedWallet.rdns,
      chain_id: selectedNetwork.chainId,
      token_address: selectedToken.address,
    });
    setRegistered((prev) => [saved, ...prev]);
  }
  if (loading) {
    return (
      <div className="p-6 border rounded-lg text-center">
        Loading wallets...
      </div>
    );
  }
  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div className="border rounded-lg p-6 space-y-8">
      {/* WALLET SLIDER */}
      <div>
        <h3 className="font-semibold mb-2">Wallet {selectedWallet?.name}</h3>
        <div className="flex space-x-4">
          {SUPPORTED_WALLET_PROVIDERS.map((w, i) => {
            const discovered = discoveredMap.has(w.rdns);
            const active = i === walletStep;
            return (
              <button
                key={w.rdns}
                onClick={() => setWalletStep(i)}
                className={`flex flex-col items-center space-y-2 p-2 rounded-lg
border ${active ? "border-blue-600" : "border-gray-300"}`}
              >
                <img
                  src={active && discovered ? w.colorIcon : w.bwIcon}
                  className="w-10 h-10"
                />
                <span className="text-sm">{w.name}</span>
                {active && !discovered && (
                  <a
                    href={w.extensionUrl}
                    target="_blank"
                    className="text-xs text-blue-600 underline"
                  >
                    Install Extension
                  </a>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {/* NETWORK SLIDER */}
      <div>
        <h3 className="font-semibold mb-2">Blockchain</h3>
        <div className="flex space-x-4">
          {networks.map((n, i) => {
            const active = i === networkStep;
            return (
              <button
                key={n.key}
                onClick={() => {
                  setNetworkStep(i);
                  setTokenStep(0);
                }}
                className={`flex flex-col items-center space-y-2 p-2 rounded-lg
border ${active ? "border-blue-600" : "border-gray-300"}`}
              >
                <img src={active ? n.icon : n.bgIcon} className="w-10 h-10" />
                <span className="text-sm">{n.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>
      {/* TOKEN SLIDER */}
      {selectedNetwork && (
        <div>
          <h3 className="font-semibold mb-2">Token</h3>
          <div className="flex space-x-4">
            {selectedNetwork.tokens.map((t, i) => {
              const active = i === tokenStep;
              return (
                <button
                  key={t.address}
                  onClick={() => setTokenStep(i)}
                  className={`flex flex-col items-center space-y-2 p-2 roundedlg border ${
                    active ? "border-blue-600" : "border-gray-300"
                  }`}
                >
                  <img src={t.icon} className="w-8 h-8" />
                  <span className="text-sm">{t.symbol}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {/* ACTION */}
      <div className="pt-4">
        {isRegistered ? (
          <span className="text-green-600 font-semibold">
            Wallet already registered
          </span>
        ) : (
          <button
            disabled={!isDiscovered}
            onClick={handleRegister}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bgblue-700 disabled:bg-gray-400"
          >
            Add Wallet
          </button>
        )}
      </div>
    </div>
  );
}
