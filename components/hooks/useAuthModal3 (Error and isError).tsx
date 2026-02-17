"use client";

import { useState, useEffect, useCallback } from "react";
import { createAnonClient } from "@/lib/supabase/client";
import { useWalletClient, useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";

interface UseAuthModalOptions {
  redirect?: string;
  statement?: string; // optional statement if needed for wallets
}

interface UseAuthModalReturn {
  isSignedIn: boolean;
  loading: boolean;
  isError: boolean;
  error: Error | null;
  user: User | null;
  session: Session | null;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuthModal({ redirect, statement }: UseAuthModalOptions = {}): UseAuthModalReturn {
  const router = useRouter();
  const supabase = createAnonClient();

  const { data: walletClient, isSuccess: walletReady } = useWalletClient();
  const { address } = useAccount();

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // Update state when session changes
  const updateState = useCallback((session: Session | null) => {
    setSession(session);
    setUser(session?.user ?? null);
    setIsSignedIn(!!session);
  }, []);

  // Listen for Supabase session changes
  useEffect(() => {
    let isMounted = true;

    // Initial fetch
    supabase.auth.getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        updateState(data.session);
        setLoading(false);
        setIsError(false);
        setError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Supabase session fetch failed:", err);
        setIsError(true);
        setError(err as Error);
        setLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      updateState(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, updateState]);

  /** Sign-in flow using signature-only Web3 */
  const signIn = useCallback(async () => {
    if (!walletReady || !walletClient || !address) {
      console.warn("Wallet not ready");
      return;
    }

    setLoading(true);
    setIsError(false);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke("get_web3_message", { body: { address } });
      if (funcError) throw funcError;

      const message: string = data.message;
      const signature = await walletClient.signMessage({ message });

      await supabase.auth.signInWithWeb3({
        chain: "ethereum",
        message,
        signature,
        options: {},
      });

      if (redirect) router.push(redirect);
    } catch (err) {
      console.error("Web3 signature login failed", err);
      setIsError(true);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [walletReady, walletClient, address, supabase, router, redirect]);

  /** Logout helper */
  const logout = useCallback(async () => {
    setLoading(true);
    setIsError(false);
    setError(null);

    try {
      await supabase.auth.signOut();
      router.replace("/"); // redirect home
    } catch (err) {
      console.error("Logout failed:", err);
      setIsError(true);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  return { isSignedIn, loading, isError, error, user, session, signIn, logout };
}