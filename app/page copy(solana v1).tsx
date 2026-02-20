"use client";

import { useState } from "react";
import { useAppKitAccount, AppKitButton, useAppKit } from "@reown/appkit/react";
import { useSession } from "@/components/auth/useSession";
import { Spinner } from "@/components/auth/spinner";
import ErrorAlert from "@/components/banners/ErrorAlert";

export default function MyComponent() {
  const { session, user, sessionLoading, signInWithWeb3Account } = useSession();
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();

  const [error, setError] = useState<string | null>(null);

  // -------------------------
  // Sign-in flow
  // -------------------------
  const handleSignMessage = async () => {
    if (!isConnected || !address) {
      setError("Wallet not connected yet");
      return;
    }

    try {
      const domain = window.location.host;
      const uri = window.location.origin;
      const nonce = crypto.randomUUID();
      const message = `${domain} wants you to sign in with your Solana account:
${address}

URI: ${uri}
Version: 1
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`;

      // Use Reown AppKit's `signMessage`
      const signature = await open.signMessage(message);

      // Verify wallet with Supabase or your backend
      const { error: verifyError } = await signInWithWeb3Account({
        chain: "solana",
        message,
        signature,
      });

      if (verifyError) setError(`Wallet verification failed: ${verifyError.message}`);
      else setError(null);
    } catch (err: any) {
      setError(err?.message || "Wallet verification failed");
    }
  };

  // -------------------------
  // Loading / error UI
  // -------------------------
  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  // -------------------------
  // JSON viewer component (unchanged)
  // -------------------------
  type JsonViewerProps = { data: any; label?: string; seen?: WeakSet<any> };
  const JsonViewer: React.FC<JsonViewerProps> = ({ data, label, seen }) => {
    const seenObjects = seen || new WeakSet();
    if (typeof data !== "object" || data === null) return <pre>{label ? `${label}: ${String(data)}` : String(data)}</pre>;
    if (seenObjects.has(data)) return <pre>{label ? `${label}: [Circular]` : "[Circular]"}</pre>;
    seenObjects.add(data);
    if (Array.isArray(data))
      return (
        <details>
          <summary>{label ? `${label} [Array]` : "Array"}</summary>
          {data.map((item, i) => (
            <JsonViewer key={i} data={item} label={`${i}`} seen={seenObjects} />
          ))}
        </details>
      );
    return (
      <div>
        {Object.entries(data).map(([k, v]) => (
          <JsonViewer key={k} data={v} label={k} seen={seenObjects} />
        ))}
      </div>
    );
  };

  // -------------------------
  // Render main UI
  // -------------------------
  return (
    <div className="p-6 space-y-4">
      <p>
        <span className="text-red-500">Wallet address: </span>
        {address ?? "not connected"}
      </p>
      <p>
        <span className="text-red-500">Wallet isConnected: </span>
        {isConnected ? "Yes" : "No"}
      </p>

      {/* Connect Wallet Button */}
      <AppKitButton
        label="Connect Wallet"
        loadingLabel="Opening wallet selector..."
        size="md"
      />

      {/* Sign-in Button */}
      {!user && (
        <button
          onClick={handleSignMessage}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Sign In With Wallet
        </button>
      )}

      {/* Optional: User info */}
      {user && (
        <details className="border rounded p-2 bg-gray-50">
          <summary className="cursor-pointer font-semibold text-red-500">User Info</summary>
          <pre className="overflow-x-auto mt-2">{JSON.stringify(user, null, 2)}</pre>
        </details>
      )}

      {/* Optional: Wallet debug */}
      {address && (
        <details className="mb-2 border rounded p-2 bg-gray-50">
          <summary className="cursor-pointer font-semibold text-red-500">Wallet Info</summary>
          <div className="mt-2">
            <JsonViewer data={{ address, isConnected }} />
          </div>
        </details>
      )}
    </div>
  );
}