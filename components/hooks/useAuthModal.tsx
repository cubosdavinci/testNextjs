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

  /** Update user/session state */
  const updateState = useCallback((session: Session | null) => {
    setSession(session);
    setUser(session?.user ?? null);
    setIsSignedIn(!!session);
  }, []);

  /** Log errors to browser whenever they occur */
  useEffect(() => {
    if (isError && error) {
      console.error("[useAuthModal] Error:", error);
    }
  }, [isError, error]);

  /** Listen for Supabase session changes */
  useEffect(() => {
    let isMounted = true;

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
        console.error("[useAuthModal] Supabase session fetch failed:", err);
        setIsError(true);
        setError(err as Error);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      try {
        updateState(session);
      } catch (err) {
        console.error("[useAuthModal] Supabase auth state update failed:", err);
        setIsError(true);
        setError(err as Error);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, updateState]);

  /** Isolate walletReady in its own effect */
  useEffect(() => {
    if (walletReady) {
      console.log("[useAuthModal] Wallet Ready");
    } else {
      console.log("[useAuthModal] Wallet Not Ready");
    }
  }, [walletReady]);

  /** Web3 signature login */
  const signIn = useCallback(async () => {
    setLoading(true);
    setIsError(false);
    setError(null);

    if (!walletReady || !walletClient || !address) {
      const msg = "Wallet not ready now";
      console.warn("[useAuthModal]", msg);
      setIsError(true);
      setError(new Error(msg));
      setLoading(false);
      return;
    }

    try {
      const { data, error: funcError } = await supabase.functions.invoke("get_web3_message", { body: { address } });
      if (funcError) {
        console.error("[useAuthModal] Supabase function error:", funcError);
        throw funcError;
      }

      const message: string = data.message;
      const signature = await walletClient.signMessage({ message });

      await supabase.auth.signInWithWeb3({
        chain: "ethereum",
        message,
        signature,
        options: {},
      });

      console.log("[useAuthModal] Web3 login successful for address:", address);

      if (redirect) router.push(redirect);
    } catch (err: any) {
      console.error("[useAuthModal] Web3 signature login failed:", err);
      setIsError(true);
      setError(err instanceof Error ? err : new Error(String(err)));
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
      console.log("[useAuthModal] Logout successful");
      router.replace("/"); // redirect home
    } catch (err: any) {
      console.error("[useAuthModal] Supabase logout failed:", err);
      setIsError(true);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  return { isSignedIn, loading, isError, error, user, session, signIn, logout };
}