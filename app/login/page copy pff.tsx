"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createAnonClient } from "@/lib/supabase/client";
import { connectWallet } from "@/lib/wallet";

export default function LoginButton() {
  const supabase = createAnonClient();
  const router = useRouter();

  const { address, isConnected, status, connector } = useAccount();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔒 prevents duplicate sign-in on re-renders
  const hasSignedInRef = useRef(false);

  // 🔍 optional debug logging
  useEffect(() => {
    console.log("Wallet state:", {
      status,
      isConnected,
      address,
      connector: connector?.name,
    });
  }, [status, isConnected, address, connector]);

  const signIn = async () => {
    if (loading || hasSignedInRef.current) return;

    hasSignedInRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithWeb3({
        chain: "ethereum",
        statement: "Sign in to Yogi3",
      });

      if (error) throw error;

      router.replace("/dashboard");
    } catch (err: any) {
      console.error(err);
      hasSignedInRef.current = false;
      setError(err.message || "Sign-in failed");
      setLoading(false);
    }
  };

  // 🔥 KEY: auto sign-in after mobile deep-link return
  useEffect(() => {
    if (isConnected && address) {
      signIn();
    }
  }, [isConnected, address]);

  const handleClick = () => {
    if (!isConnected) {
      connectWallet(); // opens AppKit modal
      return;
    }

    signIn();
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={handleClick} disabled={loading}>
        {loading
          ? "Signing…"
          : isConnected
          ? "Logging in…"
          : "Connect Wallet"}
      </button>
    </div>
  );
}
