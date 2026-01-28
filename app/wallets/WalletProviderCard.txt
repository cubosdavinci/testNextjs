'use client';

import Image from 'next/image';
import { useState } from 'react';
import ErrorAlert from '@/components/banners/ErrorAlert';
import WarningAlert from '@/components/banners/WarningAlert';
import { connectWallet, verifyWallet, deleteWallet } from './actions';
import { WALLET_PROVIDERS } from '@/lib/wallet/providers';
import { connectWithProvider } from '@/lib/wallet/connect';
import type { UserWalletDbRow } from '@/lib/wallet/types/UserWalletDbRow';
import { WalletProviderEnum } from '@/lib/wallet/types/WalletProviderEnum';

type WalletRow = {
  id: string;
  wallet_address: string;
  is_active: boolean;
};

// ----------------------------
// Props type for the component
// ----------------------------
export type WalletProviderCardProps = {
  eip1193Provider: any; // actual EIP-1193 provider object from the browser
  provider?: WalletProviderEnum; // enum for server actions
  providerName: string; // human-readable name for UI / lookup (like "MetaMask")
  wallet?: WalletRow;
  isAvailable: boolean;
  discoveryReady: boolean;
};

export default function WalletProviderCard({
  eip1193Provider,
  provider,
  providerName,
  wallet,
  isAvailable,
  discoveryReady,
}: WalletProviderCardProps) {
  // Lookup wallet metadata using providerName
  const meta = Object.values(WALLET_PROVIDERS).find((p) => p.label === providerName);

  if (!meta) {
    throw new Error(`Wallet metadata not found for providerName: ${providerName}`);
  }

  const [currentWallet, setCurrentWallet] = useState<WalletRow | undefined>(wallet);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ----------------------------
  // CONNECT
  // ----------------------------
  async function handleConnect() {
    if (!isAvailable || !eip1193Provider || !provider) return;

    setError(null);
    setLoading(true);

    try {
      // Use the actual EIP-1193 provider object to get signer/address
      const { signer, address } = await connectWithProvider(eip1193Provider);

      // Use enum for server actions
      const { message, nonce } = await connectWallet(provider);

      const walletRow: UserWalletDbRow = await verifyWallet({
        provider,
        walletAddress: address,
        signature: await signer.signMessage(message),
        nonce,
      });

      setCurrentWallet({
        id: walletRow.id,
        wallet_address: walletRow.wallet_address,
        is_active: walletRow.is_active,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------
  // DELETE
  // ----------------------------
  async function handleDelete() {
    if (!currentWallet) return;

    setError(null);
    setLoading(true);

    try {
      await deleteWallet(currentWallet.id);
      setCurrentWallet(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete wallet');
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <div className="border rounded-lg p-4 text-center space-y-4">
      <Image src={meta.image} alt={meta.label} width={64} height={64} />
      <h3 className="font-semibold">{meta.label}</h3>

      {!currentWallet ? (
        !isAvailable ? (
          <a
            href={meta.install.chrome}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Install
          </a>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading || !discoveryReady}
            className="btn-primary"
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        )
      ) : currentWallet.is_active ? (
        <>
          <p className="text-xs break-all">{currentWallet.wallet_address}</p>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="btn-danger"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </>
      ) : (
        <>
          <p className="text-xs break-all">{currentWallet.wallet_address}</p>
          <button disabled className="btn-warning">
            Upgrade Membership
          </button>
          <WarningAlert message="Free Memberships can only use MetaMask" />
        </>
      )}

      {error && <ErrorAlert message={error} />}
    </div>
  );
}
