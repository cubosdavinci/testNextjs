'use client';

/**
 * ================================
 * Solana Login Page (Reactive)
 * ================================
 */

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { useSession } from "@/components/auth/useSession";
import { Spinner } from "@/components/auth/spinner";
import ErrorAlert from "@/components/banners/ErrorAlert";

import LinkGoogleButton from '@/components/auth/LinkGoogleButton';
import UnlinkGoogleButton from "@/components/auth/UnlinkGoogleButton";

export default function SolanaLoginPage() {
  /**
   * 🔑 Reactive auth state (single source of truth)
   */
  const {
    user,
    sessionLoading,
    signInWithWeb3Account,
  } = useSession();

  /**
   * 🪙 Wallet state
   */
  const { publicKey, connected, signMessage } = useWallet();

  /**
   * 🎛️ UI state
   */
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  /**
   * ⏳ Auto-clear errors
   */
  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => setError(null), 8000);
    return () => clearTimeout(timer);
  }, [error]);

  /**
   * 🔐 Sign-In with Solana
   */
  const handleSignIn = async () => {
    if (!connected || !publicKey || !signMessage) {
      setError("Please connect your Solana wallet first");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const domain = window.location.host;
      const uri = window.location.origin;
      const nonce = crypto.randomUUID();

      const message = `${domain} wants you to sign in with your Solana account:
${publicKey.toBase58()}

URI: ${uri}
Version: 1
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`;

      const messageBytes = new TextEncoder().encode(message);
      const signature = await signMessage(messageBytes);

      const result = await signInWithWeb3Account({
        chain: "solana",
        message,
        signature,
      });

      if (result?.error) {
        setError(
          `Verification failed: ${
            result.error.message || JSON.stringify(result.error)
          }`
        );
      }

      // ✅ No manual state update needed
      // useSession will update automatically

    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to sign message or verify wallet";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * ⏳ Global loading (session bootstrap)
   */
  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  /**
   * 🎨 UI
   */
  return (
    <div className="p-6 space-y-6 max-w-md mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Sign in with Solana</h1>
        <p className="text-gray-600">
          Connect your wallet and sign a message to authenticate.
        </p>
      </div>

      {/* Wallet */}
      <div className="space-y-3">
        <p className="text-sm text-gray-500">Wallet Status</p>

        <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
          <p>
            <span className="font-medium">Address:</span>{" "}
            {publicKey ? (
              <span className="font-mono text-sm break-all">
                {publicKey.toBase58()}
              </span>
            ) : (
              "Not connected"
            )}
          </p>

          <p>
            <span className="font-medium">Connected:</span>{" "}
            <span className={connected ? "text-green-600" : "text-red-500"}>
              {connected ? "Yes" : "No"}
            </span>
          </p>
        </div>

        <WalletMultiButton className="w-full" />
      </div>

      {/* Error */}
      {error && <ErrorAlert message={error} />}

      {/* Sign In */}
      {!user && connected && (
        <button
          onClick={handleSignIn}
          disabled={actionLoading}
          className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-50"
        >
          {actionLoading ? "Signing in..." : "Sign In With Wallet"}
        </button>
      )}

      {/* Google Linking */}
      <LinkGoogleButton />
      <UnlinkGoogleButton />

      {/* Success */}
      {user && (
        <div className="mt-8 border rounded-lg p-4 bg-gray-50">
          <p className="font-semibold text-green-600 mb-2">
            ✅ Successfully signed in
          </p>

          <details>
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              View user details
            </summary>

            <pre className="mt-3 text-xs overflow-auto bg-white p-3 rounded border">
              {JSON.stringify(user, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}