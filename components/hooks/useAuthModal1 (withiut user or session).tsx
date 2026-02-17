"use client";

import { useState, useEffect, useCallback } from "react";
import { createAnonClient } from "@/lib/supabase/client";
import { useWalletClient, useAccount } from "wagmi";
import { useRouter } from "next/navigation";

interface UseAuthModalOptions {
  redirect?: string;
  statement?: string; // optional statement if needed for wallets
}

interface UseAuthModalReturn {
  isSignedIn: boolean;
  loading: boolean;
  signIn: () => Promise<void>;
}

export function useAuthModal({ redirect, statement }: UseAuthModalOptions = {}): UseAuthModalReturn {
  const router = useRouter();
  const supabase = createAnonClient();

  const { data: walletClient, isSuccess: walletReady } = useWalletClient();
  const { address } = useAccount();

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  /** 1️⃣ Check existing Supabase session */
  const checkSupabase = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsSignedIn(true);
      } else {
        setIsSignedIn(false);
      }
    } catch (err) {
      console.error("Supabase session check failed", err);
      setIsSignedIn(false);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    checkSupabase();
  }, [checkSupabase]);

  /** 2️⃣ Sign in using signature-only flow */
  const signIn = useCallback(async () => {
    if (!walletReady || !walletClient || !address) {
      console.warn("Wallet not ready");
      return;
    }

    setLoading(true);

    try {
      // 2a. Request a nonce from your backend or Supabase Edge function
      // This could be a Supabase function that returns a "message" to sign
      const { data, error } = await supabase.functions.invoke("get_web3_message", {
        body: { address },
      });
      if (error) throw error;

      const message: string = data.message;

      // 2b. Sign the message with walletClient
      const signature = await walletClient.signMessage({ message });

      // 2c. Send to Supabase for signature verification
    await supabase.auth.signInWithWeb3({
        chain: "ethereum",   // <-- add this
        message,
        signature,
        options: {},
    });

      setIsSignedIn(true);

      if (redirect) {
        router.push(redirect);
      }
    } catch (err) {
      console.error("Web3 signature login failed", err);
      setIsSignedIn(false);
    } finally {
      setLoading(false);
    }
  }, [walletReady, walletClient, address, supabase, router, redirect]);

  return { isSignedIn, loading, signIn };
}