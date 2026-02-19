"use client";

import { useState } from "react";
import { useAppKit, useAppKitAccount, AppKitButton, } from "@reown/appkit/react";
import { useSession } from "@/components/auth/useSession";
import { Spinner } from "@/components/auth/spinner";
import ErrorAlert from "@/components/banners/ErrorAlert";
import { useConnection } from "wagmi";
import { useSignMessage } from "wagmi";

export default function MyComponent() {
  const { session, user, sessionLoading, signInWithWeb3Account } = useSession();
  const { address, isConnected, connector } = useConnection();
  const signMessage = useSignMessage();
  const { open } = useAppKit();

  const [error, setError] = useState<string | null>(null);

  // -------------------------
  // Sign-in flow
  // -------------------------
  const handleSignMessage = async () => {
    if (!isConnected || !address || !connector) {
      setError("Wallet not connected yet");
      return;
    }

    try {
      const domain = window.location.host;
      const uri = window.location.origin;
      const nonce = crypto.randomUUID();
      const message = `${domain} wants you to sign in with your Ethereum account:
${address}

URI: ${uri}
Version: 1
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`;

      // Sign the message using wagmi
      const signature = await signMessage.mutateAsync({
        account: address,
        message,
        connector,
      });

      // Verify wallet with Supabase
      const { error: verifyError } = await signInWithWeb3Account({
        chain: "ethereum",
        message,
        signature: signature as `0x${string}`,
      });

      if (verifyError) setError(`Wallet verification failed: ${verifyError.message}`);
      else setError(null);
    } catch (err: any) {
      setError(err?.message || "Wallet verification failed");
    }
  };

  // -------------------------
  // Render loading / error / main UI
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


  type JsonViewerProps = {
  data: any;
  label?: string;
  seen?: WeakSet<any>;
};

const JsonViewer: React.FC<JsonViewerProps> = ({ data, label, seen }) => {
  const seenObjects = seen || new WeakSet();

  // 1️⃣ Handle primitives (string, number, boolean, null)
  if (typeof data !== "object" || data === null) {
    return (
      <div className="overflow-x-auto">
        <pre className="ml-2 text-gray-700 whitespace-pre break-words">
          {label ? `${label}: ${String(data)}` : String(data)}
        </pre>
      </div>
    );
  }

  // 2️⃣ Prevent infinite recursion for circular references
  if (seenObjects.has(data)) {
    return (
     <div className="overflow-x-auto">
      <pre className="ml-2 text-gray-700 whitespace-pre break-words">
        {label ? `${label}: [Circular]` : "[Circular]"}
      </pre>
    </div>
    );
  }
  seenObjects.add(data);

  // 3️⃣ Handle arrays
  if (Array.isArray(data)) {
    return (
      <details className="ml-4 mb-1">
        <summary className="cursor-pointer font-medium text-gray-800">
          {label ? `${label} [Array]` : "Array"}
        </summary>
        <div className="ml-4">
          {data.map((item, index) => (
            <JsonViewer key={index} data={item} label={`${index}`} seen={seenObjects} />
          ))}
        </div>
      </details>
    );
  }

  // 4️⃣ Handle objects
  return (

      <div className="ml-4">
        {Object.entries(data).map(([key, value]) => (
          <JsonViewer key={key} data={value} label={key} seen={seenObjects} />
        ))}
      </div>
  );
};

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
      <p>
        <span className="text-red-500">Connector: </span>
        {connector?.name ?? "N/A"}
      </p>

      {/* ------------------------- */}
      {/* Connect Wallet Button */}
      {/* ------------------------- */}
      {true && (
        <AppKitButton className="px-4 py-2 bg-blue-600 text-white rounded">
          Sign In With Wallet
        </AppKitButton>
      )}

      {/* ------------------------- */}
      {/* Sign-in Button */}
      {/* ------------------------- */}
      {!user && (
        <button
          onClick={handleSignMessage}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Sign In With Wallet
        </button>
      )}

      {/* ------------------------- */}
      {/* Optional: User info */}
      {/* ------------------------- */}
      {user && (
        <details className="border rounded p-2 bg-gray-50">
          <summary className="cursor-pointer font-semibold text-red-500">
            User Info
          </summary>
          <pre className="overflow-x-auto mt-2">{JSON.stringify(user, null, 2)}</pre>
        </details>
      )}
      {connector && (
  <details className="mb-2 border rounded p-2 bg-gray-50">
    <summary className="cursor-pointer font-semibold text-red-500 flex items-center gap-2">
      {connector.icon && (
        <img
          src={connector.icon}
          alt={connector.name || "Connector Icon"}
          className="w-10 h-10 rounded"
        />
      )}
      <span>Connector Info</span>
    </summary>
    <div className="mt-2">
      <JsonViewer data={connector} />
    </div>
  </details>
)}
    </div>
  );
}