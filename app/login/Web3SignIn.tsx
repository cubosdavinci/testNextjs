"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createAnonClient } from "@/lib/supabase/client";
import { detectWallets, DiscoveredWallet } from "@/lib/web3/wallets/providers";
import ErrorAlert from "@/components/banners/ErrorAlert";

export default function Web3SignIn() {
  const [wallets, setWallets] = useState<DiscoveredWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createAnonClient();

  // Discover wallets
  useEffect(() => {
    let mounted = true;
    detectWallets()
      .then((found) => mounted && setWallets(found))
      .catch((err) => mounted && setError("Error detecting wallets: " + err))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const signInWithWallet = async (wallet: DiscoveredWallet) => {
    setError(null);

    try {
      // Inject selected provider
      ;(window as any).ethereum = wallet.provider;

      // Request account access
      if (wallet.provider.request) {
        await wallet.provider.request({ method: "eth_requestAccounts" });
      }

      // Sign in via Supabase Web3
      const { data, error } = await supabase.auth.signInWithWeb3({
        chain: "ethereum",
        statement: "Sign in to MyApp (web3 secure access)",
      });

      if (error) {
        setError(error.message);
        console.error(error);
        return;
      }

      console.log("Signed in:", data.session, data.user);
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Login failed");
    }
  };

  if (loading) return <div>Discovering wallets...</div>;

  return (
    <section className="flex flex-col gap-3" aria-labelledby="web3-signin-title">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-grow border-t border-gray-300" />
        <h4 id="web3-signin-title">Sign In with Your Wallet</h4>
        <div className="flex-grow border-t border-gray-300" />
      </div>

      {/* Error Banner */}
      <ErrorAlert message={error} />

      {/* Wallet Buttons */}
      {wallets.length === 0 ? (
        <div>No wallets detected. Install MetaMask or another EIP-6963 wallet.</div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          {wallets.map((w) => (
            <button
              key={w.info.uuid}
              onClick={() => signInWithWallet(w)}
              className="flex w-full items-center justify-center gap-2 rounded border bg-white py-2 px-4 font-semibold hover:bg-gray-50"
            >
              <img src={w.info.icon} alt={w.info.name} className="w-5 h-5" />
              <span>Sign in with {w.info.name}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
